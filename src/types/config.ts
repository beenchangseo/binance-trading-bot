import 'dotenv/config';
import Binance from 'node-binance-api';

export const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY!,
    APISECRET: process.env.BINANCE_API_SECRET!,
    useServerTime: true,
});
