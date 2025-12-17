import { useEffect, useState } from 'react'
import Header from '../ui/Header'
import { getLocalStats, getMAU, getDAU } from '../services/analytics'

export default function AdminStats() {
  const [stats, setStats] = useState<any>(null)
  const [mau, setMau] = useState(0)
  const [dau, setDau] = useState(0)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const data = await getLocalStats()
    const mauCount = await getMAU()
    const dauCount = await getDAU()
    
    setStats(data)
    setMau(mauCount)
    setDau(dauCount)
  }

  if (!stats) return (
    <>
      <Header />
      <div style={{ padding: 20, textAlign: 'center' }}>Chargement...</div>
    </>
  )

  return (
    <>
      <Header />
      <main style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>📊 Statistiques Analytics</h1>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 20,
          marginBottom: 40
        }}>
          <div style={{ 
            padding: 24, 
            backgroundColor: '#f0f9ff', 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#0369a1' }}>
              {stats.totalEvents}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              Total d'événements
            </div>
          </div>
          
          <div style={{ 
            padding: 24, 
            backgroundColor: '#f0fdf4', 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#16a34a' }}>
              {stats.user?.totalSessions || 0}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              Sessions totales
            </div>
          </div>
          
          <div style={{ 
            padding: 24, 
            backgroundColor: '#fef3c7', 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#d97706' }}>
              {stats.last24Hours.length}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              Dernières 24h
            </div>
          </div>

          <div style={{ 
            padding: 24, 
            backgroundColor: '#ede9fe', 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#7c3aed' }}>
              {stats.last7Days.length}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              Derniers 7 jours
            </div>
          </div>

          <div style={{ 
            padding: 24, 
            backgroundColor: '#fce7f3', 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#db2777' }}>
              {mau}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              MAU (utilisateurs actifs)
            </div>
          </div>

          <div style={{ 
            padding: 24, 
            backgroundColor: '#ffedd5', 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: '#ea580c' }}>
              {dau}
            </div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
              DAU (aujourd'hui)
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>📈 Événements par type</h2>
          
          {Object.keys(stats.eventCounts).length === 0 ? (
            <p style={{ color: '#6b7280' }}>Aucun événement enregistré</p>
          ) : (
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>
                    Événement
                  </th>
                  <th style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>
                    Nombre
                  </th>
                  <th style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>
                    %
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.eventCounts)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .map(([event, count]) => (
                    <tr key={event} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: 12 }}>
                        <span style={{ 
                          fontFamily: 'monospace',
                          backgroundColor: '#f3f4f6',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 13
                        }}>
                          {event}
                        </span>
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>
                        {count as number}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', color: '#6b7280' }}>
                        {((count as number / stats.totalEvents) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ 
          marginTop: 24,
          padding: 16,
          backgroundColor: '#eff6ff',
          borderRadius: 8,
          fontSize: 14
        }}>
          <strong>💡 Info :</strong> Les données sont stockées localement dans votre navigateur.
          Chaque utilisateur verra ses propres statistiques.
        </div>
      </main>
    </>
  )
}
