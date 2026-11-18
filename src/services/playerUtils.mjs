export function getNextTrackIndex(currentIndex, queueLength, shuffle = false, random = Math.random) {
  if (!Number.isInteger(queueLength) || queueLength < 1) return -1;
  if (!shuffle || queueLength === 1) return (currentIndex + 1) % queueLength;
  const candidate = Math.floor(random() * (queueLength - 1));
  return candidate >= currentIndex ? candidate + 1 : candidate;
}

export function getPreviousTrackIndex(currentIndex, queueLength, shuffle = false, random = Math.random) {
  if (!Number.isInteger(queueLength) || queueLength < 1) return -1;
  if (!shuffle || queueLength === 1) return (currentIndex - 1 + queueLength) % queueLength;
  const candidate = Math.floor(random() * (queueLength - 1));
  return candidate >= currentIndex ? candidate + 1 : candidate;
}

export function shouldAdvanceAfterEnd(currentIndex, queueLength, repeatMode) {
  if (repeatMode === "one") return false;
  if (repeatMode === "all") return queueLength > 0;
  return currentIndex < queueLength - 1;
}
