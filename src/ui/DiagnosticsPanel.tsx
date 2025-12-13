import { useEffect, useState } from 'react'
import { collectDiagnostics, type Diagnostics } from '../debug/diagnostics'

export default function DiagnosticsPanel() {
  const [data, setData] = useState<Diagnostics | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setBusy(true)
    setError(null)
    try {
      const d = await collectDiagnostics()
      setData(d)
    } catch (e: any) {
      setError(e?.message ?? 'Impossible de collecter les diagnostics.')
    } finally {
      setBusy(false)
    }
  }

  async function copyJson() {
    if (!data) return
    const json = JSON.stringify(data, null, 2)
    try {
      await navigator.clipboard.writeText(json)
      alert('Diagnostics copiés dans le presse-papiers.')
    } catch {
      // fallback: affiche le JSON pour copie manuelle
      alert(json)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <h2>Diagnostics</h2>

      <p style={{ fontSize: 12, opacity: 0.75 }}>
        Pour SW/caches, teste sur HTTPS (ou localhost) car certaines API sont limitées aux contextes sécurisés.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={refresh} disabled={busy}>
          {busy ? 'Rafraîchissement…' : 'Rafraîchir'}
        </button>
        <button onClick={copyJson} disabled={!data}>
          Copier JSON
        </button>
      </div>

      {error && <div style={{ color: 'crimson' }}>Erreur: {error}</div>}

      {data && (
        <pre style={{ fontSize: 12, background: '#111', color: '#eee', padding: 12, borderRadius: 12, overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  )
}
