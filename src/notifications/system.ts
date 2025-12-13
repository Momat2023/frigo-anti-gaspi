export async function showSystemNotification(
  title: string,
  options: NotificationOptions & { data?: any } = {}
): Promise<'shown' | 'no-permission' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'

  if (Notification.permission !== 'granted') return 'no-permission'

  // Prefer SW notification when possible (more robust in PWAs)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return 'shown'
    }
  } catch {
    // fallback below
  }

  try {
    new Notification(title, options)
    return 'shown'
  } catch {
    return 'unsupported'
  }
}
