// Service Worker para Smartudy - Alertas en segundo plano
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Escuchar mensajes desde la página para mostrar notificaciones nativas en cualquier app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MOSTRAR_NOTIFICACION') {
        const { titulo, cuerpo } = event.data;
        
        self.registration.showNotification(titulo, {
            body: cuerpo,
            icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233500.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/3233/3233500.png',
            vibrate: [300, 100, 300, 100, 300], // Patrón de vibración de alarma
            tag: 'smartudy-alerta', // Evita que se amontonen las notificaciones
            renotify: true,
            requireInteraction: true // Mantiene el mensaje visible hasta que lo atiendas
        });
    }
});

// Al hacer clic en la notificación flotante, abre o trae Smartudy al frente
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('dashboard.html');
            }
        })
    );
});