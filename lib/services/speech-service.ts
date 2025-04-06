/**
 * Service responsible for text-to-speech functionality
 */
export class SpeechService {
  /**
   * Speaks the given text in Italian
   * @param text The text to speak
   */
  public speak(text: string): void {
    if (!this.isSpeechSupported()) {
      console.warn("Speech synthesis is not supported in this browser")
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "it-IT"
    window.speechSynthesis.speak(utterance)
  }

  /**
   * Checks if speech synthesis is supported in the browser
   * @returns True if speech synthesis is supported
   */
  private isSpeechSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window
  }
}

