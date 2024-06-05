import {Address} from '@ton/core';

import {SwapParams, SwapStep} from './sdk';
import {packJettonSwap, packTonSwap} from './transfer-params-pack.utils';
import {dedust_getVaultAddress} from './vault.utils';
import {JETTON_TRANSFER_GAS_AMOUNT, TON} from '../../globals';
import {RouteStepWithCalculation} from '../../interfaces/route-step-with-calculation.interface';
import {
    getJettonTransferBody,
    getJettonWalletAddress
} from '../../utils/jetton.utils';

const createNextSwapStepPayload = (
    remainingRoute: RouteStepWithCalculation[],
    slippageTolerance: string
): SwapStep | undefined => {
    if (remainingRoute.length === 0) {
        return undefined;
    }

    const routeStep = remainingRoute[0];

    const poolAddress = Address.parse(routeStep.dexPairAddress);
    const limit =
        (BigInt(routeStep.outputAssetAmount) *
            BigInt(100 - parseFloat(slippageTolerance))) /
        100n;
    const next = createNextSwapStepPayload(
        remainingRoute.slice(1),
        slippageTolerance
    );

    return {
        poolAddress,
        limit,
        next
    };
};

export const dedust_getTransferParams = async (
    route: RouteStepWithCalculation[],
    queryId: number,
    gasAmount: bigint,
    senderAddress: Address,
    receiverAddress: Address,
    responseDestination: Address,
    slippageTolerance: string,
    applyMinOutputAmount: boolean
) => {
    if (route.length === 0) {
        throw new Error('Empty route');
    }

    const firstRouteStep = route[0];

    const vaultAddress = await dedust_getVaultAddress(
        firstRouteStep.inputAssetAddress
    );

    const poolAddress = Address.parse(firstRouteStep.dexPairAddress);
    const minOutputAmount = applyMinOutputAmount
        ? (BigInt(firstRouteStep.outputAssetAmount) *
              BigInt(100 - parseFloat(slippageTolerance))) /
          100n
        : 0n;
    const nextSwapStep = createNextSwapStepPayload(
        route.slice(1),
        slippageTolerance
    );
    const swapParams: SwapParams = {recipientAddress: receiverAddress};

    if (firstRouteStep.inputAssetAddress === TON) {
        return {
            to: vaultAddress,
            value: gasAmount + BigInt(firstRouteStep.inputAssetAmount),
            body: packTonSwap({
                queryId,
                inputAmount: BigInt(firstRouteStep.inputAssetAmount),
                poolAddress,
                minOutputAmount,
                nextSwapStep,
                swapParams
            })
        };
    } else {
        const inputJettonWalletAddress = await getJettonWalletAddress(
            firstRouteStep.inputAssetAddress,
            senderAddress
        );

        const jettonSwapPayload = packJettonSwap({
            poolAddress,
            minOutputAmount,
            nextSwapStep,
            swapParams
        });

        return {
            to: inputJettonWalletAddress,
            value: gasAmount + JETTON_TRANSFER_GAS_AMOUNT,
            body: getJettonTransferBody({
                queryId,
                amount: BigInt(firstRouteStep.inputAssetAmount),
                destination: vaultAddress,
                responseDestination: responseDestination,
                forwardTonAmount: gasAmount,
                forwardPayload: jettonSwapPayload
            })
        };
    }
};
