import React from 'react'
import styles from './PositionsTable.module.css'
import panelStyles from './Panel.module.css'

function ActionBadge({ action }) {
  const map = {
    STRONG_BUY: { label: 'Strong Buy', cls: styles.strongBuy },
    BUY: { label: 'Buy', cls: styles.buy },
    HOLD: { label: 'Hold', cls: styles.hold },
    SELL: { label: 'Sell', cls: styles.sell },
    STRONG_SELL: { label: 'Strong Sell', cls: styles.strongSell },
  }
  const { label, cls } = map[action] ?? map.HOLD
  return <span className={`${styles.badge} ${cls}`}>{label}</span>
}

function DirectionTag({ dir }) {
  return (
    <span className={`${styles.dir} ${dir === 'LONG' ? styles.long : styles.short}`}>
      {dir}
    </span>
  )
}

function formatPrice(val, asset) {
  if (val == null) return '-'
  if (asset === 'US30') return val.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (asset === 'XAUUSD') return val.toFixed(2)
  return val.toFixed(4)
}

export default function PositionsTable({ snapshot, onRefresh }) {
  if (!snapshot) return null

  const { positions, signals } = snapshot
  const rows = Object.entries(positions).map(([asset, pos]) => ({
    asset,
    pos,
    signal: signals[asset],
  }))

  rows.sort((a, b) => Math.abs(b.signal.ensemble) - Math.abs(a.signal.ensemble))

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.header}>
        <h3 className={panelStyles.title}>Active Positions</h3>
        <button className={styles.refreshBtn} onClick={onRefresh}>
          Refresh
        </button>
      </div>
      <div className={styles.tableWrap}>
        {rows.length === 0 ? (
          <div className={styles.empty}>No active positions</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Price</th>
                <th>Signal</th>
                <th>Weight</th>
                <th>Stop</th>
                <th>Target</th>
                <th>Dir</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ asset, pos, signal }) => (
                <tr key={asset}>
                  <td className={styles.assetCell}>
                    <strong>{asset}</strong>
                  </td>
                  <td className={styles.mono}>{formatPrice(pos.price, asset)}</td>
                  <td><ActionBadge action={signal?.action} /></td>
                  <td className={styles.mono}>{(pos.weight * 100).toFixed(1)}%</td>
                  <td className={`${styles.mono} ${styles.stop}`}>{formatPrice(pos.stop, asset)}</td>
                  <td className={`${styles.mono} ${styles.target}`}>{formatPrice(pos.target, asset)}</td>
                  <td><DirectionTag dir={pos.direction} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
