export function playTTS(text: string) {
  if (!window.speechSynthesis) return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  if (!text.trim()) return

  const utterance = new SpeechSynthesisUtterance(text)
  // Optional: You could allow configuring the voice/speed
  utterance.rate = 1.0
  utterance.pitch = 1.0

  window.speechSynthesis.speak(utterance)
}

export function stopTTS() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
