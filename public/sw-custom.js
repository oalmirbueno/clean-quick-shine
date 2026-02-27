// Push notification handler
self.addEventListener("push", (event) => {
  let data = { title: "JáLimpo", body: "Você tem uma nova notificação" };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("Push parse error:", e);
  }

  const options = {
    body: data.body || data.message || "",
    icon: data.icon || "/pwa-192x192.png",
    badge: data.badge || "/pwa-72x72.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "default",
    renotify: true,
    data: data.data || { url: "/" },
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
