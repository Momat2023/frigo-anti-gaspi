import { supabase } from '../lib/supabase'
import { getDb } from '../data/db'

export async function syncData() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return

  const user = session.user
  const db = await getDb()
  
  try {
    const localItems = await db.getAll('items')
    const itemsToUpload = localItems.map(item => ({
      ...item,
      user_id: user.id
    }))

    const { error: uploadError } = await supabase
      .from('items')
      .upsert(itemsToUpload, { onConflict: 'id' })

    if (uploadError) throw uploadError

    const { data: remoteItems, error: downloadError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)

    if (downloadError) throw downloadError

    if (remoteItems) {
      for (const item of remoteItems) {
        await db.put('items', item)
      }
    }
    console.log('✅ Sync Cloud réussie');
  } catch (error) {
    console.error('❌ Échec Sync:', error)
  }
}

export function initSyncOnReconnect() {
  window.addEventListener('online', syncData)
}
