import {isDefined} from '@rnw-community/shared';
import {Address} from '@ton/core';
import {useTonWallet} from '@tonconnect/ui-react';
import {getSwapMessages} from 'rainbow-swap-sdk';
import {FC} from 'react';

import {RainbowWalletInfo} from './rainbow-wallet-info/rainbow-wallet-info';
import {SwapRouteInfo} from './swap-route-info/swap-route-info';
import {useSwapForm} from '../../../hooks/swap-form/swap-form.hook';
import {
    trackButtonClick,
    trackSwapConfirmation
} from '../../../hooks/use-analytics.hook';
import {useRainbowWallet} from '../../../hooks/use-rainbow-wallet.hook';
import {useSendTransaction} from '../../../hooks/use-send-transaction.hook';
import {FormButton} from '../../../shared/form-button/form-button';
import {useDispatch} from '../../../store';
import {useSlippageToleranceSelector} from '../../../store/settings/settings-selectors';
import {useSwapRoutesSelector} from '../../../store/swap-routes/swap-routes-selectors';
import {addPendingSwapTransactionActions} from '../../../store/wallet/wallet-actions';
import {showSuccessToast} from '../../../utils/toast.utils';
import {Disclaimer} from '../../disclaimer/disclaimer';
import styles from '../swap-button/swap-button.module.css';

interface Props {
    outputAssetAmount: string;
    onConfirm: () => void;
}

export const SwapDetails: FC<Props> = ({outputAssetAmount, onConfirm}) => {
    const dispatch = useDispatch();
    const swapRoutes = useSwapRoutesSelector();
    const slippageTolerance = useSlippageToleranceSelector();
    const {inputAssetAmount, inputAsset, outputAsset} = useSwapForm();

    const wallet = useTonWallet();
    const sendTransaction = useSendTransaction();
    const rainbowWallet = useRainbowWallet(swapRoutes);

    const handleConfirm = async () => {
        trackButtonClick('Confirm');
        const senderAddress = Address.parse(wallet?.account.address ?? '');
        const messages = await getSwapMessages(
            senderAddress.toString(),
            swapRoutes,
            Number(slippageTolerance)
        );

        const transactionInfo = await sendTransaction(senderAddress, messages);

        if (isDefined(transactionInfo)) {
            const usdAmount =
                parseFloat(inputAssetAmount) *
                parseFloat(inputAsset.exchangeRate);

            trackSwapConfirmation(
                transactionInfo.bocHash,
                usdAmount,
                inputAsset,
                outputAsset,
                Number(outputAssetAmount) ?? 0
            );

            dispatch(addPendingSwapTransactionActions.submit(transactionInfo));
            showSuccessToast('Swap sent, please wait...');
            onConfirm();
        }
    };

    return (
        <>
            {rainbowWallet.isRequired && <RainbowWalletInfo />}
            <SwapRouteInfo />
            <Disclaimer
                title="Disclaimer"
                description={
                    'This interface and the Rainbow Smart contract are provided "as is", at your own risk, and without warranties of any kind'
                }
                isInitiallyOpen={false}
            />
            {rainbowWallet.isRequired ? (
                <FormButton
                    text="Activate contract"
                    containerClassName={styles.main_button}
                    onClick={rainbowWallet.activateContract}
                ></FormButton>
            ) : (
                <FormButton
                    text="Confirm"
                    containerClassName={styles.main_button}
                    onClick={handleConfirm}
                ></FormButton>
            )}
        </>
    );
};
