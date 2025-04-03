import dotenv from 'dotenv';
import Binance from 'node-binance-api';
import {tradingConfig} from './config/tradingConfig';
import {tradingState} from './state/tradingState';
import {analyzeMarketTrend} from './utils/technicalAnalysis';
import {placeGridOrders, updateOrders, cancelStaleOrders} from './services/orderManager';

dotenv.config();

const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    useServerTime: true,
});

const startTickerStream = (): void => {
    binance.websockets.trades(tradingConfig.SYMBOL, (trades: any) => {
        const {p: price} = trades;
        const newPrice = parseFloat(price);
        tradingState.currentPrice = newPrice;
        updateOrders(newPrice);
    });
};

const mainLoop = async (price: number, simulationTime: number): Promise<void> => {
    await analyzeMarketTrend(binance, price);
    placeGridOrders(price, simulationTime);
    cancelStaleOrders(simulationTime);
    console.log(
        `미실현 수익: ${calculateUnrealizedPnL(price).toFixed(2)} USDT, ` +
            `가용잔액: ${tradingState.availableBalance.toFixed(2)} USDT, ` +
            `실현 손익: ${tradingState.realizedPnL.toFixed(2)} USDT`,
    );
};

const calculateUnrealizedPnL = (price: number): number => {
    let unrealizedProfit = 0;
    for (const order of tradingState.acceptedOrders) {
        if (order.status === 'open') {
            if (order.type === 'long') {
                unrealizedProfit += (price - order.filledPrice) * order.amount * tradingConfig.LEVERAGE;
            } else if (order.type === 'short') {
                unrealizedProfit += (order.filledPrice - price) * order.amount * tradingConfig.LEVERAGE;
            }
        }
    }
    return unrealizedProfit;
};

const startBot = async (): Promise<void> => {
    console.log(`모의 트레이딩 봇 시작: 초기 잔액 ${tradingState.totalBalance.toFixed(2)} USDT`);

    setInterval(() => {
        mainLoop(tradingState.currentPrice, Date.now());
    }, 10 * 1000);

    startTickerStream();
};

// 봇 시작
startBot().catch((error) => {
    console.error('봇 실행 중 에러 발생:', error);
});
