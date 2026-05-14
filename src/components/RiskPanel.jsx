import React from 'react'
import styles from './RiskPanel.module.css'
import panelStyles from './Panel.module.css'

function RiskMeter({ value, max, label, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className={styles.meter}>
      <div className={styles.meterHeader}>
        <span className={styles.meterLabel}>{label}</span>
        <span className={styles.meterValue} style={{ color }}>{value.toFixed(2)}%</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function StatRow({ label, value, highlight }) {
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statValue} ${highlight ? styles[highlight] : ''}`}>{value}</span>
    </div>
  )
}

export default function RiskPanel({ snapshot }) {
  if (!snapshot) return null

  const risk = snapshot.portfolio_risk
  const riskPct = risk.total_risk_pct
  const riskColor = riskPct > 1.5 ? 'var(--red)' : riskPct > 1.0 ? 'var(--yellow)' : 'var(--green)'

  const positions = Object.values(snapshot.positions)
  const maxWeight = positions.length > 0 ? Math.max(...positions.map(p => p.weight)) : 0
  const totalDollars = positions.reduce((s, p) => s + p.dollar_value, 0)

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.header}>
        <h3 className={panelStyles.title}>Risk Management</h3>
        <span className={`${panelStyles.badge} ${riskPct <= 1.5 ? '' : styles.badgeDanger}`}>
          {risk.within_limit ? 'OK' : 'WARNING'}
        </span>
      </div>
      <div className={panelStyles.body}>
        <RiskMeter
          value={riskPct}
          max={risk.max_allowed_pct}
          label="Portfolio Risk"
          color={riskColor}
        />
        <RiskMeter
          value={maxWeight * 100}
          max={25}
          label="Largest Position"
          color="var(--blue)"
        />

        <div className={styles.stats}>
          <StatRow label="Capital Deployed" value={`$${totalDollars.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
          <StatRow label="Risk Limit" value={`${risk.max_allowed_pct}%`} />
          <StatRow label="Position Sizing" value="Half-Kelly" />
          <StatRow label="Stop Method" value="2x ATR" />
          <StatRow label="Target Method" value="3x ATR" />
        </div>
      </div>
    </div>
  )
}
