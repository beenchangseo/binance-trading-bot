import Binance from 'node-binance-api';
import * as technicalIndicators from 'technicalindicators';
import {tradingConfig} from '../config/tradingConfig';
import {updateMarketState} from '../state/tradingState';
import {TrendDirection} from '../types';
import {MACDOutput} from 'technicalindicators/declarations/moving_averages/MACD';

export const analyzeMarketTrend = async (binance: Binance, currentPrice: number): Promise<void> => {
    try {
        const candles = await binance.futuresCandles(tradingConfig.SYMBOL, '1h', {limit: 50});
        if (!candles || candles.length < tradingConfig.ATR_PERIOD + 1) return;

        const closes = candles.map((c: any) => parseFloat(c[4]));
        const highs = candles.map((c: any) => parseFloat(c[2]));
        const lows = candles.map((c: any) => parseFloat(c[3]));

        // MACD 계산
        const macd = technicalIndicators.MACD.calculate({
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });

        // RSI 계산
        const rsi = technicalIndicators.RSI.calculate({
            values: closes,
            period: 14,
        });

        if (macd.length === 0 || rsi.length === 0) return;

        const latestMACD = macd[macd.length - 1] as MACDOutput;
        const latestRSI = rsi[rsi.length - 1] as number;

        // SMA(20) 계산
        const sma20 =
            technicalIndicators.SMA.calculate({
                period: 20,
                values: closes,
            }).pop() || 0;

        // ATR 계산
        const atrValues = technicalIndicators.ATR.calculate({
            high: highs,
            low: lows,
            close: closes,
            period: tradingConfig.ATR_PERIOD,
        });

        const currentATR = atrValues.length ? atrValues[atrValues.length - 1] : tradingConfig.BASE_GRID_STEP;

        // Bollinger Bands 계산
        const bb = technicalIndicators.BollingerBands.calculate({
            period: 20,
            values: closes,
            stdDev: 2,
        });

        if (!bb.length) return;

        const {lower: lowerBand, upper: upperBand} = bb[bb.length - 1];

        // 추세 방향 결정
        let newTrendDirection: TrendDirection = 'sideways';
        let isTrending = false;

        if (latestMACD.MACD == null || latestMACD.signal == null) {
            throw new Error('latestMACD is undefined');
        }

        if (latestMACD.MACD > latestMACD.signal && latestRSI > 55 && currentPrice > sma20) {
            newTrendDirection = 'bullish';
            isTrending = true;
        } else if (latestMACD.MACD < latestMACD.signal && latestRSI < 45 && currentPrice < sma20) {
            newTrendDirection = 'bearish';
            isTrending = true;
        }

        // 상태 업데이트
        updateMarketState(isTrending, newTrendDirection, currentATR, lowerBand, upperBand, sma20);

        console.log(
            `추세 분석: ${newTrendDirection} (ATR: ${currentATR.toFixed(2)}, RSI: ${latestRSI.toFixed(2)}, SMA20: ${sma20.toFixed(2)})`,
        );
        console.log(`Bollinger Bands: Lower ${lowerBand.toFixed(2)}, Upper ${upperBand.toFixed(2)}`);
    } catch (error) {
        console.error('추세 분석 에러:', error);
    }
};
