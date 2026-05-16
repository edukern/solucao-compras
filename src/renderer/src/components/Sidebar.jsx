export default function Sidebar({ current, onNavigate, theme, onToggleTheme }) {
  return (
    <aside style={{ width: 200, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', padding: '1rem 0.5rem' }}>
      <div style={{ marginBottom: '1rem', color: 'var(--accent-light)', fontWeight: 700 }}>SC</div>
      {['dashboard', 'planejamento', 'compras'].map(s => (
        <button key={s} onClick={() => onNavigate(s)} style={{ display: 'block', width: '100%', background: current === s ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', color: current === s ? 'var(--accent-light)' : 'var(--text-secondary)', padding: '0.5rem 0.75rem', borderRadius: 6, textAlign: 'left', marginBottom: 2, cursor: 'pointer', fontSize: '0.85rem' }}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
      <button onClick={onToggleTheme} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </aside>
  )
}
