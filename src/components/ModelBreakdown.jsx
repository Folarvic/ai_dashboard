import React, { useState } from 'react'
import styles from './ModelBreakdown.module.css'
import panelStyles from './Panel.module.css'

const MODELS = [
  { key: 'lstm', label: 'LSTM', weight: 30, desc: 'Trend following' },
  { key: 'xgboost', label: 'XGBoost', weight: 25, desc: 'Mean reversion' },
  { key: 'transformer', label: 'Transformer', weight: 25, desc: 'Sentiment' },
  { key: 'garch', label: 'GARCH', weight: 20, desc: 'Volatility' },
]

function SignalBar({ value }) {
  const pct = Math.abs(value) * 50
  const isPos = value >= 0
  return (
    <div className={styles.barTrack}>
      <div className={styles.barCenter} />
      <div
        className={`${styles.barFill} ${isPos ? styles.barPos : styles.barNeg}`}
        style={{
          width: `${pct}%`,
          left: isPos ? '50%' : `${50 - pct}%`,
        }}
      />
    </div>
  )
}

export default function ModelBreakdown({ signals }) {
  const [selected, setSelected] = useState('EURUSD')

  if (!signals) return null

  const assets = Object.keys(signals)
  const sig = signals[selected]

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.header}>
        <h3 className={panelStyles.title}>Model Breakdown</h3>
        <select
          className={styles.select}
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          {assets.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className={panelStyles.body}>
        <div className={styles.rows}>
          {MODELS.map(m => (
            <div key={m.key} className={styles.row}>
              <div className={styles.modelInfo}>
                <span className={styles.modelName}>{m.label}</span>
                <span className={styles.modelDesc}>{m.desc} &bull; {m.weight}%</span>
              </div>
              <SignalBar value={sig?.[m.key] ?? 0} />
              <span className={`${styles.val} ${sig?.[m.key] >= 0 ? styles.pos : styles.neg}`}>
                {(sig?.[m.key] ?? 0) >= 0 ? '+' : ''}{(sig?.[m.key] ?? 0).toFixed(3)}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.ensemble}>
          <span className={styles.ensembleLabel}>Ensemble</span>
          <span className={`${styles.ensembleVal} ${sig?.ensemble >= 0 ? styles.pos : styles.neg}`}>
            {sig?.ensemble >= 0 ? '+' : ''}{sig?.ensemble.toFixed(3)}
          </span>
          <span className={`${styles.action} ${styles['action_' + sig?.action]}`}>
            {sig?.action?.replace('_', ' ')}
          </span>
        </div>
      </div>
    </div>
  )
}
