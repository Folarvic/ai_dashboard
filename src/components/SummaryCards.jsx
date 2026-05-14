import React from 'react'
import styles from './SummaryCards.module.css'

function Card({ label, value, sub, subType, accent }) {
  return (
    <div className={`${styles.card} ${accent ? styles[accent] : ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {sub && (
        <div className={`${styles.sub} ${subType ? styles[subType] : ''}`}>{sub}</div>
      )}
    </div>
  )
}

export default function SummaryCards({ snapshot }) {
  if (!snapshot) return null

  const { portfolio_value, positions, portfolio_risk } = snapshot
  const activeCount = Object.keys(positions).length
  const riskPct = portfolio_risk?.total_risk_pct ?? 0
  const totalWeight = Object.values(positions).reduce((s, p) => s + p.weight, 0)

  const buySignals = Object.values(snapshot.signals).filter(s => s.ensemble > 0.2).length
  const sellSignals = Object.values(snapshot.signals).filter(s => s.ensemble < -0.2).length

  return (
    <div className={styles.grid}>
      <Card
        label="Portfolio Value"
        value={`$${portfolio_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        sub="Active capital base"
        subType="neutral"
        accent="primary"
      />
      <Card
        label="Active Positions"
        value={`${activeCount} / 7`}
        sub={`${(totalWeight * 100).toFixed(1)}% deployed`}
        subType="neutral"
      />
      <Card
        label="Signal Distribution"
        value={`${buySignals}B / ${sellSignals}S`}
        sub={`${7 - buySignals - sellSignals} neutral`}
        subType="neutral"
      />
      <Card
        label="Portfolio Risk"
        value={`${riskPct.toFixed(2)}%`}
        sub={riskPct <= 1.5 ? 'Within limits' : 'Approaching limit'}
        subType={riskPct <= 1.0 ? 'positive' : riskPct <= 1.5 ? 'warning' : 'negative'}
      />
    </div>
  )
}
