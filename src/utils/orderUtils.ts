import {Order, OrderType} from '../types';
import {tradingConfig} from '../config/tradingConfig';
import {marketState, tradingState} from '../state/tradingState';

export const createOrder = (
    type: OrderType,
    entryPrice: number,
    gridStep: number,
    amount: number,
    simulationTime: number,
): Order => {
    const dynamicStopLoss = marketState.currentATR
        ? marketState.currentATR * tradingConfig.VOLATILITY_MULTIPLIER
        : entryPrice * 0.05;

    const finalStopLoss = Math.max(dynamicStopLoss, gridStep * 2);
    const margin = (entryPrice * amount) / tradingConfig.LEVERAGE;

    return {
        id: tradingState.orderIdCounter++,
        type,
        status: 'pending',
        entryPrice,
        amount,
        margin,
        targetExitPrice: type === 'long' ? entryPrice + gridStep : entryPrice - gridStep,
        stopLossPrice: type === 'long' ? entryPrice - finalStopLoss : entryPrice + finalStopLoss,
        filledPrice: 0,
        createdTime: simulationTime,
        initialStopLoss: type === 'long' ? entryPrice - finalStopLoss : entryPrice + finalStopLoss,
    };
};

export const simulateSlippage = (order: Order): number => {
    const randomFactor = Math.random() * (tradingConfig.SLIPPAGE_PERCENT / 100);
    return order.type === 'long' ? order.entryPrice * (1 + randomFactor) : order.entryPrice * (1 - randomFactor);
};

export const getDynamicTradeAmount = (): number => {
    let dynamicAmount = tradingConfig.TRADE_AMOUNT;
    if (marketState.currentATR > tradingConfig.BASE_GRID_STEP) {
        dynamicAmount = tradingConfig.TRADE_AMOUNT * (tradingConfig.BASE_GRID_STEP / marketState.currentATR);
    }
    return Math.max(dynamicAmount, tradingConfig.MIN_DYNAMIC_AMOUNT);
};
