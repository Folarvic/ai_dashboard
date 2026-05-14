// Simulated ML/DL ensemble signal engine (mirrors Python backend logic)

const ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'XAUUSD', 'US30']

const BASE_PRICES = {
  EURUSD: 1.0845,
  GBPUSD: 1.2715,
  USDJPY: 154.32,
  AUDUSD: 0.6542,
  USDCAD: 1.3621,
  XAUUSD: 2345.60,
  US30: 39842.0,
}

const VOLATILITIES = {
  EURUSD: 0.0008,
  GBPUSD: 0.0012,
  USDJPY: 0.18,
  AUDUSD: 0.0009,
  USDCAD: 0.0007,
  XAUUSD: 4.2,
  US30: 85.0,
}

function tanh(x) {
  return Math.tanh(x)
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

// Deterministic noise seeded by time bucket + asset
function seededNoise(asset, seed) {
  let h = 0
  const str = asset + seed
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0
  }
  return ((h >>> 0) / 0xffffffff) * 2 - 1
}

function generatePrice(asset, bucket) {
  const base = BASE_PRICES[asset]
  const vol = VOLATILITIES[asset]
  const drift = seededNoise(asset, String(bucket)) * vol * 3
  return base + drift
}

function lstmSignal(asset, bucket) {
  const momentum = seededNoise(asset, 'lstm' + bucket) * 0.6
  return tanh(momentum * 2.5)
}

function xgboostSignal(asset, bucket) {
  const rsi = 30 + (seededNoise(asset, 'rsi' + bucket) + 1) * 35
  if (rsi < 30) return 0.7
  if (rsi > 70) return -0.7
  if (rsi < 45) return 0.3
  if (rsi > 55) return -0.3
  return 0
}

function transformerSignal(asset, bucket) {
  const pos = (seededNoise(asset, 'tf' + bucket) + 1) / 2
  return clamp((pos - 0.5) * 2, -1, 1)
}

function garchSignal(asset, bucket) {
  const vol = Math.abs(seededNoise(asset, 'garch' + bucket)) * 0.02
  const volFactor = 1 - Math.min(vol * 100, 1)
  const dir = Math.sign(seededNoise(asset, 'dir' + bucket))
  return dir * volFactor * 0.5
}

function getAction(ensemble) {
  if (ensemble > 0.5) return 'STRONG_BUY'
  if (ensemble > 0.2) return 'BUY'
  if (ensemble > -0.2) return 'HOLD'
  if (ensemble > -0.5) return 'SELL'
  return 'STRONG_SELL'
}

export function generateSnapshot() {
  const bucket = Math.floor(Date.now() / (15 * 60 * 1000))
  const prices = {}
  const signals = {}
  const positions = {}

  for (const asset of ASSETS) {
    const price = generatePrice(asset, bucket)
    prices[asset] = {
      price: parseFloat(price.toFixed(asset === 'US30' ? 1 : asset === 'XAUUSD' ? 2 : 4)),
      timestamp: new Date().toISOString(),
    }

    const lstm = lstmSignal(asset, bucket)
    const xgb = xgboostSignal(asset, bucket)
    const transformer = transformerSignal(asset, bucket)
    const garch = garchSignal(asset, bucket)
    const ensemble = clamp(0.30 * lstm + 0.25 * xgb + 0.25 * transformer + 0.20 * garch, -1, 1)

    signals[asset] = {
      ensemble: parseFloat(ensemble.toFixed(3)),
      lstm: parseFloat(lstm.toFixed(3)),
      xgboost: parseFloat(xgb.toFixed(3)),
      transformer: parseFloat(transformer.toFixed(3)),
      garch: parseFloat(garch.toFixed(3)),
      action: getAction(ensemble),
      price: prices[asset].price,
    }

    if (Math.abs(ensemble) > 0.2) {
      const atr = VOLATILITIES[asset] * 2
      const weight = Math.min(Math.abs(ensemble) * 0.3, 0.25)
      const dollarsValue = weight * 100000
      const dir = ensemble > 0 ? 1 : -1
      positions[asset] = {
        weight: parseFloat(weight.toFixed(4)),
        dollar_value: parseFloat(dollarsValue.toFixed(2)),
        price: prices[asset].price,
        stop: parseFloat((price - dir * atr * 2).toFixed(asset === 'US30' ? 1 : 4)),
        target: parseFloat((price + dir * atr * 3).toFixed(asset === 'US30' ? 1 : 4)),
        direction: ensemble > 0 ? 'LONG' : 'SHORT',
        signal: ensemble,
        risk_amount: parseFloat((dollarsValue * (atr / price) * 2).toFixed(2)),
      }
    }
  }

  const totalRisk = Object.values(positions).reduce((s, p) => s + p.risk_amount, 0)

  return {
    timestamp: new Date().toISOString(),
    prices,
    signals,
    positions,
    portfolio_value: 100000,
    portfolio_risk: {
      total_risk: parseFloat(totalRisk.toFixed(2)),
      total_risk_pct: parseFloat((totalRisk / 1000).toFixed(3)),
      within_limit: totalRisk / 1000 <= 2.0,
      max_allowed_pct: 2.0,
    },
  }
}

export { ASSETS }
