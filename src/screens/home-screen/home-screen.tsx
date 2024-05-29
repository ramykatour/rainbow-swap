import {isDefined, isNotEmptyString} from '@rnw-community/shared';
import {useTonAddress} from '@tonconnect/ui-react';
import {useEffect} from 'react';
import {ToastContainer} from 'react-toastify';

import {Header} from '../../components/header/header.tsx';
import {useViewportHeight} from '../../hooks/viewport-height/viewport-height.hook.ts';
import {useDispatch} from '../../store';
import {loadAssetsActions} from '../../store/assets/assets-actions.ts';
import {
    addPendingActivationTransactionActions,
    addPendingSwapTransactionActions,
    checkIsRainbowWalletActiveActions,
    loadBalancesActions
} from '../../store/wallet/wallet-actions.ts';
import {
    usePendingActivationTransactionSelector,
    usePendingSwapTransactionSelector
} from '../../store/wallet/wallet-selectors.ts';
import {SwapScreen} from '../home/swap-form/swap-form.tsx';

export const HomeScreen = () => {
    const dispatch = useDispatch();
    const pendingSwapTransaction = usePendingSwapTransactionSelector();
    const pendingActivationTransaction =
        usePendingActivationTransactionSelector();

    const walletAddress = useTonAddress();
    const viewportHeight = useViewportHeight();

    useEffect(() => {
        viewportHeight.updateValue();
        dispatch(loadAssetsActions.submit());

        // restore waitTransactionConfirmation for swap & activation transactions
        if (isDefined(pendingSwapTransaction.data)) {
            dispatch(
                addPendingSwapTransactionActions.submit(
                    pendingSwapTransaction.data
                )
            );
        }

        if (isDefined(pendingActivationTransaction.data)) {
            dispatch(
                addPendingActivationTransactionActions.submit(
                    pendingActivationTransaction.data
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isNotEmptyString(walletAddress)) {
            // load wallet related data
            dispatch(loadBalancesActions.submit(walletAddress));
            dispatch(checkIsRainbowWalletActiveActions.submit(walletAddress));
        } else {
            // reset wallet related data
            dispatch(loadBalancesActions.success({}));
            dispatch(checkIsRainbowWalletActiveActions.success(false));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress]);

    return (
        <>
            <ToastContainer
                position="top-center"
                pauseOnFocusLoss={false}
                draggablePercent={40}
            />
            <Header />
            <SwapScreen />
        </>
    );
};
