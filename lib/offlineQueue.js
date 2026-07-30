const KEY = "workout-log-offline-queue";

function readQueue() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export function enqueueWorkout(payload) {
  const queue = readQueue();
  queue.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...payload });
  writeQueue(queue);
  return queue.length;
}

export function getQueue() {
  return readQueue();
}

export function getQueueCount() {
  return readQueue().length;
}

export function removeFromQueue(id) {
  writeQueue(readQueue().filter((q) => q.id !== id));
}

export function isNetworkError(err) {
  const msg = (err?.message || "").toLowerCase();
  return (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    msg.includes("failed to fetch") ||
    msg.includes("load failed") ||
    msg.includes("network")
  );
}
