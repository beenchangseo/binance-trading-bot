// 주문 유형: 롱(매수) 또는 숏(매도) 포지션
export type OrderType = 'long' | 'short';

// 주문 상태
// pending: 대기 중인 주문
// open: 체결되어 활성화된 주문
// closed: 청산된 주문
// cancelled: 취소된 주문
export type OrderStatus = 'pending' | 'open' | 'closed' | 'cancelled';

// 시장 추세 방향
// bullish: 상승 추세 (MACD > signal, RSI > 55, 가격 > SMA20)
// bearish: 하락 추세 (MACD < signal, RSI < 45, 가격 < SMA20)
// sideways: 횡보 추세 (위 조건에 해당하지 않는 경우)
export type TrendDirection = 'bullish' | 'bearish' | 'sideways';

// 주문 정보를 담는 인터페이스
export interface Order {
    id: number;                  // 주문 고유 식별자
    type: OrderType;             // 주문 유형 (롱/숏)
    status: OrderStatus;         // 주문 상태
    entryPrice: number;          // 진입 가격
    amount: number;              // 주문 수량
    margin: number;              // 필요 증거금 = (진입가격 * 수량) / 레버리지
    targetExitPrice: number;     // 목표 청산 가격
    stopLossPrice: number;       // 손절 가격
    filledPrice: number;         // 실제 체결 가격
    createdTime: number;         // 주문 생성 시간 (timestamp)
    initialStopLoss: number;     // 초기 손절 가격 (트레일링 스탑을 위해 보존)
}

// 시장 상태 정보
export interface MarketState {
    isTrending: boolean;         // 추세 존재 여부
    trendDirection: TrendDirection;  // 추세 방향
    currentATR: number;          // 현재 ATR (Average True Range) - 변동성 지표
    lowerBand: number;           // 볼린저 밴드 하단
    upperBand: number;           // 볼린저 밴드 상단
    sma20: number;               // 20일 단순 이동평균
}

// 트레이딩 설정값
export interface TradingConfig {
    SYMBOL: string;              // 거래 페어 (예: BTCUSDT)
    BASE_GRID_STEP: number;      // 기본 그리드 간격 (USDT)
    GRID_SIZE: number;           // 그리드 레벨 수
    TRADE_AMOUNT: number;        // 기본 거래 수량
    LEVERAGE: number;            // 레버리지 배수
    TRADING_FEE_PERCENT: number; // 거래 수수료 (%)
    FUNDING_FEE_INTERVAL: number;// 펀딩비 정산 간격 (ms)
    SLIPPAGE_PERCENT: number;    // 예상 슬리피지 (%)
    ATR_PERIOD: number;          // ATR 계산 기간
    VOLATILITY_MULTIPLIER: number;// 변동성 승수
    MIN_DYNAMIC_AMOUNT: number;  // 최소 동적 거래 수량
    MAX_PENDING_TIME: number;    // 최대 미체결 대기 시간 (ms)
    TRAILING_TRIGGER_PERCENT: number;// 트레일링 스탑 발동 조건 (%)
    TRAILING_STEP_PERCENT: number;// 트레일링 스탑 간격 (%)
}

// 트레이딩 상태 정보
export interface TradingState {
    initialBalance: number;      // 초기 잔고
    availableBalance: number;    // 사용 가능한 잔고
    totalBalance: number;        // 총 잔고 (포지션 가치 포함)
    realizedPnL: number;        // 실현된 손익
    currentPrice: number;       // 현재 시장 가격
    pendingOrders: Order[];     // 대기 중인 주문 목록
    acceptedOrders: Order[];    // 체결된 활성 주문 목록
    closedOrders: Order[];      // 청산된 주문 목록
    orderIdCounter: number;     // 주문 ID 카운터
}
