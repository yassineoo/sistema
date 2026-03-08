self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('[SW] push received:', event.data?.text());

  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
  }

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Notification', {
      body: data.body ?? '',
      icon: '/logo.svg',
      data: { commande_id: data.commande_id, type: data.type },
    }).then(() => {
      console.log('[SW] showNotification succeeded');
    }).catch((err) => {
      console.error('[SW] showNotification FAILED:', err);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const commandeId = event.notification.data?.commande_id;
  event.waitUntil(
    clients.openWindow(commandeId ? `/commandes/${commandeId}` : '/')
  );
});
