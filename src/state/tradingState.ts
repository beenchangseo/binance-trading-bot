import {TradingState, MarketState, TrendDirection} from '../types';
import {tradingConfig} from '../config/tradingConfig';

export const marketState: MarketState = {
    isTrending: false,
    trendDirection: 'sideways',
    currentATR: tradingConfig.BASE_GRID_STEP,
    lowerBand: 0,
    upperBand: 0,
    sma20: 0,
};

export const tradingState: TradingState = {
    initialBalance: 10000,
    availableBalance: 10000,
    totalBalance: 10000,
    realizedPnL: 0,
    currentPrice: 0,
    pendingOrders: [],
    acceptedOrders: [],
    closedOrders: [],
    orderIdCounter: 1,
};

export const updateMarketState = (
    newTrending: boolean,
    newDirection: TrendDirection,
    newATR: number,
    newLowerBand: number,
    newUpperBand: number,
    newSMA20: number,
): void => {
    marketState.isTrending = newTrending;
    marketState.trendDirection = newDirection;
    marketState.currentATR = newATR;
    marketState.lowerBand = newLowerBand;
    marketState.upperBand = newUpperBand;
    marketState.sma20 = newSMA20;
};
