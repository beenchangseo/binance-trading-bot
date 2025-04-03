import {Order} from '../types';
import {tradingConfig} from '../config/tradingConfig';
import {marketState, tradingState} from '../state/tradingState';
import {createOrder, getDynamicTradeAmount, simulateSlippage} from '../utils/orderUtils';

export const placeGridOrders = (price: number, simulationTime: number): void => {
    try {
        if (!price) {
            console.log(`price: ${price}`);
            return;
        }

        const dynamicAmount = getDynamicTradeAmount();
        const gridStep =
            tradingConfig.BASE_GRID_STEP + (marketState.currentATR * tradingConfig.VOLATILITY_MULTIPLIER) / 2;
        const bandRange = marketState.upperBand - marketState.lowerBand;
        const normalizedPosition = bandRange > 0 ? (price - marketState.lowerBand) / bandRange : 0.5;

        // 롱 주문 배치
        if (
            (marketState.trendDirection === 'sideways' || marketState.trendDirection === 'bullish') &&
            normalizedPosition < 0.4
        ) {
            for (let i = 1; i <= tradingConfig.GRID_SIZE; i++) {
                const longEntryPrice = price - gridStep * i;
                const exists = [...tradingState.pendingOrders, ...tradingState.acceptedOrders].some(
                    (order) => order.type === 'long' && Math.abs(order.entryPrice - longEntryPrice) < 1e-6,
                );

                if (!exists) {
                    const order = createOrder('long', longEntryPrice, gridStep, dynamicAmount, simulationTime);
                    if (tradingState.availableBalance >= order.margin) {
                        tradingState.availableBalance -= order.margin;
                        tradingState.pendingOrders.push(order);
                        console.log(
                            `그리드 롱 주문 생성: ID ${order.id}, 진입가 ${order.entryPrice.toFixed(2)} USDT, 주문수량: ${order.amount.toFixed(4)}, 가용잔액: ${tradingState.availableBalance.toFixed(2)} USDT`,
                        );
                    }
                }
            }
        }

        // 숏 주문 배치
        if (
            (marketState.trendDirection === 'sideways' || marketState.trendDirection === 'bearish') &&
            normalizedPosition > 0.6
        ) {
            for (let i = 1; i <= tradingConfig.GRID_SIZE; i++) {
                const shortEntryPrice = price + gridStep * i;
                const exists = [...tradingState.pendingOrders, ...tradingState.acceptedOrders].some(
                    (order) => order.type === 'short' && Math.abs(order.entryPrice - shortEntryPrice) < 1e-6,
                );

                if (!exists) {
                    const order = createOrder('short', shortEntryPrice, gridStep, dynamicAmount, simulationTime);
                    if (tradingState.availableBalance >= order.margin) {
                        tradingState.availableBalance -= order.margin;
                        tradingState.pendingOrders.push(order);
                        console.log(
                            `그리드 숏 주문 생성: ID ${order.id}, 진입가 ${order.entryPrice.toFixed(2)} USDT, 주문수량: ${order.amount.toFixed(4)}, 가용잔액: ${tradingState.availableBalance.toFixed(2)} USDT`,
                        );
                    }
                }
            }
        }

        console.log(`주문 배치하지 않음(${marketState.trendDirection}, ${normalizedPosition})`);
        
    } catch (error) {
        console.error('그리드 주문 생성 에러:', error);
    }
};

export const updateOrders = (simPrice: number): void => {
    try {
        if (!simPrice) return;

        // 대기 주문 처리
        const stillPending: Order[] = [];
        for (const order of tradingState.pendingOrders) {
            if (order.status === 'pending') {
                if (order.type === 'long' && simPrice <= order.entryPrice) {
                    order.status = 'open';
                    order.filledPrice = simulateSlippage(order);
                    tradingState.acceptedOrders.push(order);
                    console.log(`🟢 롱 주문 접수: ID ${order.id}, 체결가 ${order.filledPrice.toFixed(2)} USDT`);
                } else if (order.type === 'short' && simPrice >= order.entryPrice) {
                    order.status = 'open';
                    order.filledPrice = simulateSlippage(order);
                    tradingState.acceptedOrders.push(order);
                    console.log(`🔴 숏 주문 접수: ID ${order.id}, 체결가 ${order.filledPrice.toFixed(2)} USDT`);
                } else {
                    stillPending.push(order);
                }
            }
        }
        tradingState.pendingOrders = stillPending;

        // 활성 주문 처리
        const stillAccepted: Order[] = [];
        for (const order of tradingState.acceptedOrders) {
            if (order.status === 'open') {
                if (order.type === 'long' && simPrice >= order.targetExitPrice) {
                    const profit = (order.targetExitPrice - order.filledPrice) * order.amount * tradingConfig.LEVERAGE;
                    const fee = order.targetExitPrice * order.amount * (tradingConfig.TRADING_FEE_PERCENT / 100);
                    const netProfit = profit - fee;
                    tradingState.realizedPnL += netProfit;
                    tradingState.availableBalance += order.margin + netProfit;
                    order.status = 'closed';
                    tradingState.closedOrders.push(order);
                    console.log(
                        `🔴 롱 청산: ID ${order.id}, 청산가 ${order.targetExitPrice.toFixed(2)} USDT, 차익: ${netProfit.toFixed(2)} USDT, 가용잔액: ${tradingState.availableBalance.toFixed(2)} USDT`,
                    );
                } else if (order.type === 'short' && simPrice <= order.targetExitPrice) {
                    const profit = (order.filledPrice - order.targetExitPrice) * order.amount * tradingConfig.LEVERAGE;
                    const fee = order.targetExitPrice * order.amount * (tradingConfig.TRADING_FEE_PERCENT / 100);
                    const netProfit = profit - fee;
                    tradingState.realizedPnL += netProfit;
                    tradingState.availableBalance += order.margin + netProfit;
                    order.status = 'closed';
                    tradingState.closedOrders.push(order);
                    console.log(
                        `🟢 숏 청산: ID ${order.id}, 청산가 ${order.targetExitPrice.toFixed(2)} USDT, 차익: ${netProfit.toFixed(2)} USDT, 가용잔액: ${tradingState.availableBalance.toFixed(2)} USDT`,
                    );
                } else {
                    stillAccepted.push(order);
                }
            }
        }
        tradingState.acceptedOrders = stillAccepted;
        tradingState.totalBalance = tradingState.availableBalance;
    } catch (error) {
        console.error('주문 업데이트 에러:', error);
    }
};

export const cancelStaleOrders = (simulationTime: number): void => {
    const stillPending: Order[] = [];
    for (const order of tradingState.pendingOrders) {
        if (simulationTime - order.createdTime > tradingConfig.MAX_PENDING_TIME) {
            tradingState.availableBalance += order.margin;
            order.status = 'cancelled';
            tradingState.closedOrders.push(order);
            console.log(
                `⏰ 미체결 주문 취소: ID ${order.id}, 생성시각: ${new Date(order.createdTime).toISOString()}, 가용잔액: ${tradingState.availableBalance.toFixed(2)} USDT`,
            );
        } else {
            stillPending.push(order);
        }
    }
    tradingState.pendingOrders = stillPending;
};

export const cancelAllOrders = (): void => {
    const allActiveOrders = [...tradingState.pendingOrders, ...tradingState.acceptedOrders];
    for (const order of allActiveOrders) {
        tradingState.availableBalance += order.margin;
        order.status = 'cancelled';
        tradingState.closedOrders.push(order);
    }
    tradingState.pendingOrders = [];
    tradingState.acceptedOrders = [];
    tradingState.totalBalance = tradingState.availableBalance;
    console.log(`모든 미체결 주문 취소됨. 전체 잔액: ${tradingState.totalBalance.toFixed(2)} USDT`);
};
