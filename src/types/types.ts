export const SYMBOL = 'BTCUSDT';

export const BASE_GRID_STEP = 50; // 기본 그리드 간격 (USDT)
export const GRID_SIZE = 7; // 각 측면에서 그리드 주문 레벨 수
export const TRADE_AMOUNT = 0.001; // 기본 거래 수량
export const LEVERAGE = 2; // 레버리지
export const TRADING_FEE_PERCENT = 0.04; // 거래 수수료(%)
export const FUNDING_FEE_INTERVAL = 8 * 60 * 60 * 1000; // 펀딩비 적용 간격 (8시간)
export const SLIPPAGE_PERCENT = 0.05; // 체결 시 슬리피지 (%)

export const ATR_PERIOD = 14;
export const VOLATILITY_MULTIPLIER = 5; // 변동성 곱셈 값
export const MIN_DYNAMIC_AMOUNT = 0.0005; // 최소 주문 수량 보장

// 미체결 주문의 최대 유지 시간 (예: 6시간)
export const MAX_PENDING_TIME = 6 * 60 * 60 * 1000;
// 트레일링 스탑 발동 기준 (예: 최소 1% 이상 이익 시)
export const TRAILING_TRIGGER_PERCENT = 1.0; // 1% 수익 이상 시 발동
// 트레일링 스탑 업데이트 폭 (예: 이익의 50%를 보존)
export const TRAILING_STEP_PERCENT = 0.5; // 수익 차의 50%를 반영하여 스탑 업데이트
