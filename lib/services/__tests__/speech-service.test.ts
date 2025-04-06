import { SpeechService } from "../speech-service"
import { expect, jest, describe, beforeEach, afterEach, test } from "@jest/globals"

describe("SpeechService", () => {
  let speechService: SpeechService
  let originalSpeechSynthesis: any
  let mockSpeechSynthesis: any

  beforeEach(() => {
    speechService = new SpeechService()

    // Save original speechSynthesis
    originalSpeechSynthesis = global.speechSynthesis

    // Mock speechSynthesis
    mockSpeechSynthesis = {
      speak: jest.fn(),
    }

    // Mock SpeechSynthesisUtterance
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
      text,
      lang: "",
    }))

    // Replace global speechSynthesis with mock
    Object.defineProperty(global, "speechSynthesis", {
      value: mockSpeechSynthesis,
      writable: true,
    })
  })

  afterEach(() => {
    // Restore original speechSynthesis
    Object.defineProperty(global, "speechSynthesis", {
      value: originalSpeechSynthesis,
      writable: true,
    })
  })

  describe("speak", () => {
    test("should create utterance with correct text and language", () => {
      speechService.speak("ciao")

      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith("ciao")
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled()

      // Check that the language was set to Italian
      const utteranceArg = mockSpeechSynthesis.speak.mock.calls[0][0]
      expect(utteranceArg.lang).toBe("it-IT")
    })

    test("should handle speech synthesis not being supported", () => {
      // Remove speechSynthesis to simulate unsupported browser
      Object.defineProperty(global, "speechSynthesis", {
        value: undefined,
        writable: true,
      })

      // Mock console.warn
      const originalConsoleWarn = console.warn
      console.warn = jest.fn()

      speechService.speak("ciao")

      expect(console.warn).toHaveBeenCalledWith("Speech synthesis is not supported in this browser")

      // Restore console.warn
      console.warn = originalConsoleWarn
    })
  })
})

