# Binance Grid Trading Bot

이 프로젝트는 바이낸스 선물 거래소에서 작동하는 그리드 트레이딩 봇입니다. 시장 변동성과 추세를 분석하여 자동으로 매매 포지션을 생성하고 관리합니다.

## 주요 기능

- **그리드 트레이딩**: 설정된 가격 범위 내에서 그리드 주문을 생성하고 관리
- **동적 그리드 간격**: ATR(Average True Range) 지표를 활용하여 시장 변동성에 따라 그리드 간격 자동 조정
- **추세 분석**: 볼린저 밴드를 활용한 시장 추세 분석 및 대응
- **레버리지 거래**: 설정된 레버리지를 사용한 포지션 관리
- **자동 리밸런싱**: 일정 시간이 지난 미체결 주문 자동 취소
- **백테스팅**: 과거 데이터를 사용한 전략 성능 검증

## 설치 방법

### 필수 조건
- Node.js (v14 이상)
- npm 또는 yarn
- 바이낸스 API 키

### 설치 단계

1. 저장소 클론
```bash
git clone https://github.com/yourusername/binance-trading-bot.git
cd binance-trading-bot
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 입력하세요:
```
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
```

## 설정

`src/config/tradingConfig.ts` 파일에서 다음 설정을 수정할 수 있습니다:

- `SYMBOL`: 거래할 암호화폐 심볼 (기본값: 'BTCUSDT')
- `BASE_GRID_STEP`: 기본 그리드 간격 (USDT)
- `GRID_SIZE`: 생성할 그리드 주문의 수
- `TRADE_AMOUNT`: 기본 거래량
- `LEVERAGE`: 레버리지 배수
- `TRADING_FEE_PERCENT`: 거래소 수수료
- `VOLATILITY_MULTIPLIER`: 변동성 승수 (ATR 기반)
- `MAX_PENDING_TIME`: 미체결 주문 최대 대기 시간

## 사용 방법

### 봇 실행

```bash
npm start
```

### 백테스팅

```bash
node backtest.js (구현중)
```

## 프로젝트 구조

```
binance-trading-bot/
├── .env                  # 환경 변수
├── src/                  # 소스 코드
│   ├── index.ts          # 진입점
│   ├── config/           # 설정 파일
│   ├── services/         # 서비스 로직
│   ├── state/            # 상태 관리
│   ├── types/            # TypeScript 타입 정의
│   └── utils/            # 유틸리티 함수
├── backtest.js           # 백테스팅 스크립트
└── package.json          # 패키지 정보
```

## 주의사항

- 이 봇은 자동화된 거래를 수행하므로 **실제 자금 손실의 위험이 있습니다**.
- 반드시 소량의 자금으로 테스트한 후 실제 운용을 고려하세요.
- 암호화폐 시장은 매우 변동성이 크므로 모든 거래에는 위험이 따릅니다.
- API 키는 안전하게 보관하고, 인출 권한을 부여하지 마세요.

## 향후 개발 계획

- Stop-Loss 기능 구현
- 실시간 모니터링 대시보드
- 텔레그램/디스코드 알림 시스템
- 다중 거래소 지원
- 위험 관리 도구 강화
- 포트폴리오 분산 전략

## 라이선스

MIT

## 면책 조항

이 소프트웨어는 "있는 그대로" 제공되며, 어떠한 형태의 명시적이거나 묵시적인 보증도 하지 않습니다. 개발자는 이 소프트웨어의 사용으로 인한 어떠한 손해에 대해서도 책임을 지지 않습니다.

트레이딩 봇 사용에 따른 모든 위험과 결과는 사용자 본인의 책임입니다. 항상 본인의 판단하에 투자하시기 바랍니다.
