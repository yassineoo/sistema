import { axiosAPI } from "@/lib/constant";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("[webPush] Notification permission:", permission);
    return null;
  }

  await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
  const reg = await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    const { data } = await axiosAPI.get<{ vapid_public_key: string }>("/notifications/push/vapid-public-key/");
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        data.vapid_public_key || "BG1vulrZXNgtpLHrbm26mG8mHYnWbY6mHdtoFp1msYjOckQFWrUHgghL_FThNOAnPUwjJfzUAgLdp7rXcknXYBE",
      ) as BufferSource,
    });
  }

  const p256dh = sub.getKey("p256dh");
  const auth = sub.getKey("auth");

  await axiosAPI.post("/notifications/push/subscribe/", {
    endpoint: sub.endpoint,
    keys: {
      p256dh: p256dh ? arrayBufferToBase64(p256dh) : "",
      auth: auth ? arrayBufferToBase64(auth) : "",
    },
  });

  return sub;
}

export async function unsubscribeFromPush(): Promise<void> {
  if (typeof window === "undefined") return;

  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;

  await axiosAPI.delete("/notifications/push/unsubscribe/", {
    data: { endpoint: sub.endpoint },
  });

  await sub.unsubscribe();
}
