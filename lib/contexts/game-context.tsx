"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"

// Initialize speech synthesis voices
const initSpeechSynthesis = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    // Some browsers (especially Safari) need this to load voices
    window.speechSynthesis.getVoices()
  }
}

// Core Italian numbers with pedagogically organized structure
const italianNumbers: Record<string, string> = {
  // Base numbers (foundational vocabulary)
  "0": "zero",
  "1": "uno",
  "2": "due",
  "3": "tre",
  "4": "quattro",
  "5": "cinque",
  "6": "sei",
  "7": "sette",
  "8": "otto",
  "9": "nove",
  "10": "dieci",

  // Teen numbers (first pattern to learn)
  "11": "undici",
  "12": "dodici",
  "13": "tredici",
  "14": "quattordici",
  "15": "quindici",
  "16": "sedici",
  "17": "diciassette",
  "18": "diciotto",
  "19": "diciannove",

  // Tens (second pattern)
  "20": "venti",
  "30": "trenta",
  "40": "quaranta",
  "50": "cinquanta",
  "60": "sessanta",
  "70": "settanta",
  "80": "ottanta",
  "90": "novanta",
  "100": "cento",
  "1000": "mille",

  // Special cases (important exceptions)
  "21": "ventuno",
  "28": "ventotto",
  "33": "trentatré",
}

// Types for analytics
interface AttemptData {
  id: string // Unique ID for each attempt
  number: number
  answer: string
  correctAnswer: string
  isCorrect: boolean
  timeToAnswer: number // in milliseconds
  hintsUsed: boolean
  timestamp: number
  attemptType: "initial" | "correction" // Track if this was an initial attempt or correction
}

interface PerformanceMetrics {
  accuracy: number
  averageResponseTime: number
  totalAttempts: number
  correctAttempts: number
  incorrectAttempts: number
  mostChallenging: number[]
}

type Difficulty = "easy" | "medium" | "hard"

interface GameState {
  currentNumber: number
  correctAnswer: string
  isReviewMode: boolean
  grammarNote: string | null
  attemptCount: number // Track attempts for the current number
}

interface GameContextType {
  gameState: GameState
  userAnswer: string
  isCorrect: boolean | null
  showHint: boolean
  showTypeCorrectionMode: boolean
  difficulty: Difficulty
  reviewCount: number
  attemptHistory: AttemptData[]
  performanceMetrics: PerformanceMetrics
  setUserAnswer: (answer: string) => void
  checkAnswer: () => void
  generateNewNumber: () => void
  setDifficulty: (difficulty: Difficulty) => void
  setShowHint: (show: boolean) => void
  speakNumber: () => void
  getHint: () => string
  clearHistory: () => void
  isInputValid: boolean
  isSubmitting: boolean
}

// Create a unique ID for each attempt
const generateAttemptId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Core state
  const [gameState, setGameState] = useState<GameState>({
    currentNumber: 1,
    correctAnswer: "uno",
    isReviewMode: false,
    grammarNote: null,
    attemptCount: 0,
  })
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showTypeCorrectionMode, setShowTypeCorrectionMode] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("easy")
  // No longer tracking review items, just logging all attempts
  const [reviewCount] = useState<number>(0) // Keep this for interface compatibility but don't use it
  const [isInputValid, setIsInputValid] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Add a ref to track if voices have been loaded
  const voicesLoaded = useRef(false)

  // Analytics state
  const [attemptHistory, setAttemptHistory] = useState<AttemptData[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    accuracy: 0,
    averageResponseTime: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    mostChallenging: [],
  })

  // Timing references
  const startTimeRef = useRef<number>(Date.now())
  const autoProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate Italian number with pedagogical grammar notes
  const generateItalianNumber = (num: number): { word: string; note: string | null } => {
    // Direct lookup for numbers in our dictionary
    if (italianNumbers[num.toString()]) {
      return {
        word: italianNumbers[num.toString()],
        note: null,
      }
    }

    // Handle numbers 21-99 with pedagogical pattern recognition
    if (num > 20 && num < 100) {
      const tens = Math.floor(num / 10) * 10
      const ones = num % 10

      if (ones === 0) return { word: italianNumbers[tens.toString()], note: null }

      let word: string
      let note: string | null = null

      // Special cases with linguistic explanations
      if (ones === 1) {
        word = italianNumbers[tens.toString()].slice(0, -1) + "uno"
        note = "With 1, drop the final vowel of the tens (venti → ventuno)"
      } else if (ones === 8) {
        word = italianNumbers[tens.toString()].slice(0, -1) + "otto"
        note = "With 8, drop the final vowel of the tens (venti → ventotto)"
      } else if (ones === 3) {
        word = italianNumbers[tens.toString()] + "tré"
        note = "With 3, add an accent (trentatré)"
      } else {
        word = italianNumbers[tens.toString()] + italianNumbers[ones.toString()]
        note = "Combine tens + ones (trenta + due = trentadue)"
      }

      return { word, note }
    }

    // Simplified handling for larger numbers
    return { word: "unknown", note: null }
  }

  // Generate appropriate number based on difficulty level
  const generateRandomNumber = useCallback(() => {
    const max = difficulty === "easy" ? 20 : difficulty === "medium" ? 100 : 1000
    return Math.floor(Math.random() * max) + 1
  }, [difficulty])

  // Generate new number with spaced repetition for review items
  const generateNewNumber = useCallback(() => {
    // Clear any existing auto-progress timeout
    if (autoProgressTimeoutRef.current) {
      clearTimeout(autoProgressTimeoutRef.current)
      autoProgressTimeoutRef.current = null
    }

    setUserAnswer("")
    setIsCorrect(null)
    setShowHint(false)
    setShowTypeCorrectionMode(false)
    setIsInputValid(true)
    setIsSubmitting(false)

    // Reset the start time for timing the next answer
    startTimeRef.current = Date.now()

    // Generate a new random number without review logic
    const newNumber = generateRandomNumber()
    const { word, note } = generateItalianNumber(newNumber)

    setGameState({
      currentNumber: newNumber,
      correctAnswer: word,
      isReviewMode: false,
      grammarNote: note,
      attemptCount: 0,
    })
  }, [generateRandomNumber])

  // Initialize game
  useEffect(() => {
    // Initialize speech synthesis
    initSpeechSynthesis()

    generateNewNumber()

    // Try to load saved history from localStorage
    try {
      const savedHistory = localStorage.getItem("italianNumbersHistory")
      if (savedHistory) {
        setAttemptHistory(JSON.parse(savedHistory))
      }
    } catch (error) {
      console.error("Failed to load history:", error)
    }
  }, [generateNewNumber])

  // Update when difficulty changes
  useEffect(() => {
    generateNewNumber()
  }, [difficulty, generateNewNumber])

  // Save history to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("italianNumbersHistory", JSON.stringify(attemptHistory))
    } catch (error) {
      console.error("Failed to save history:", error)
    }
  }, [attemptHistory])

  // Calculate performance metrics when history changes
  useEffect(() => {
    if (attemptHistory.length === 0) {
      setPerformanceMetrics({
        accuracy: 0,
        averageResponseTime: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        mostChallenging: [],
      })
      return
    }

    // Calculate basic metrics
    const totalAttempts = attemptHistory.length
    const correctAttempts = attemptHistory.filter((a) => a.isCorrect).length
    const incorrectAttempts = totalAttempts - correctAttempts
    const accuracy = (correctAttempts / totalAttempts) * 100

    // Calculate average response time (only for the last 20 attempts to show recent performance)
    const recentAttempts = attemptHistory.slice(-20)
    const averageResponseTime = recentAttempts.reduce((sum, a) => sum + a.timeToAnswer, 0) / recentAttempts.length

    // Find most challenging numbers
    const numberCounts = {}
    attemptHistory.forEach((a) => {
      if (!a.isCorrect) {
        numberCounts[a.number] = (numberCounts[a.number] || 0) + 1
      }
    })

    // Sort by frequency of incorrect answers
    const mostChallenging = Object.entries(numberCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => Number.parseInt(entry[0]))

    setPerformanceMetrics({
      accuracy,
      averageResponseTime,
      totalAttempts,
      correctAttempts,
      incorrectAttempts,
      mostChallenging,
    })
  }, [attemptHistory])

  // Validate user input
  useEffect(() => {
    // Basic validation - only allow letters and accented characters
    const isValid = /^[a-zA-ZÀ-ÿ\s]*$/.test(userAnswer)
    setIsInputValid(isValid)
  }, [userAnswer])

  // Handle user answer changes
  const handleSetUserAnswer = (answer: string) => {
    setUserAnswer(answer)
  }

  // Log an attempt to the history
  const logAttempt = (attemptType: "initial" | "correction") => {
    const timeToAnswer = Date.now() - startTimeRef.current
    const isAnswerCorrect = userAnswer.trim().toLowerCase() === gameState.correctAnswer.toLowerCase()

    // Create attempt data
    const attemptData: AttemptData = {
      id: generateAttemptId(),
      number: gameState.currentNumber,
      answer: userAnswer,
      correctAnswer: gameState.correctAnswer,
      isCorrect: isAnswerCorrect,
      timeToAnswer,
      hintsUsed: showHint,
      timestamp: Date.now(),
      attemptType,
    }

    // Add to history
    setAttemptHistory((prev) => [...prev, attemptData])

    return isAnswerCorrect
  }

  // Handle post-attempt actions
  const handlePostAttempt = (isAnswerCorrect: boolean) => {
    if (isAnswerCorrect) {
      // Speak the correct word for auditory reinforcement
      speakNumber()

      // Auto-progress to next number after a short delay
      autoProgressTimeoutRef.current = setTimeout(() => {
        generateNewNumber()
      }, 1500)

      if (showTypeCorrectionMode) {
        setShowTypeCorrectionMode(false)
      }
    } else {
      if (!showTypeCorrectionMode) {
        setShowTypeCorrectionMode(true)
      }

      // Reset for next attempt
      setTimeout(() => {
        setUserAnswer("")
        setIsSubmitting(false)
        // Reset timer for next attempt
        startTimeRef.current = Date.now()
      }, 500)
    }
  }

  // Check answer with pedagogical feedback and data logging
  const checkAnswer = () => {
    // Don't process if input is empty or invalid
    if (userAnswer.trim() === "" || !isInputValid) {
      return
    }

    // Prevent multiple submissions while processing
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    // Increment attempt count for the current number
    setGameState((prev) => ({
      ...prev,
      attemptCount: prev.attemptCount + 1,
    }))

    // Log the attempt and get result
    const attemptType = showTypeCorrectionMode ? "correction" : "initial"
    const isAnswerCorrect = logAttempt(attemptType)

    // Update UI state
    setIsCorrect(isAnswerCorrect)

    // Handle post-attempt actions
    handlePostAttempt(isAnswerCorrect)
  }

  // Progressive hint system
  const getHint = (): string => {
    const answer = gameState.correctAnswer
    return answer.substring(0, Math.ceil(answer.length / 3)) + "..."
  }

  // Function to ensure voices are loaded
  const ensureVoicesLoaded = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve([])

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      voicesLoaded.current = true
      return Promise.resolve(voices)
    }

    return new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const voicesChangedHandler = () => {
        const voices = window.speechSynthesis.getVoices()
        voicesLoaded.current = true
        resolve(voices)
        window.speechSynthesis.removeEventListener("voiceschanged", voicesChangedHandler)
      }

      window.speechSynthesis.addEventListener("voiceschanged", voicesChangedHandler)
    })
  }

  // Authentic pronunciation
  const speakNumber = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(gameState.correctAnswer)
      utterance.lang = "it-IT"

      // If voices are already loaded, use them directly
      if (voicesLoaded.current) {
        const voices = window.speechSynthesis.getVoices()
        const italianVoice = voices.find(
          (voice) => voice.lang.includes("it-IT") || voice.lang.includes("it_IT") || voice.lang.includes("ita"),
        )

        if (italianVoice) {
          utterance.voice = italianVoice
        }

        window.speechSynthesis.speak(utterance)
      } else {
        // Otherwise, ensure voices are loaded first
        ensureVoicesLoaded().then((voices) => {
          const italianVoice = voices.find(
            (voice) => voice.lang.includes("it-IT") || voice.lang.includes("it_IT") || voice.lang.includes("ita"),
          )

          if (italianVoice) {
            utterance.voice = italianVoice
          }

          window.speechSynthesis.speak(utterance)
        })
      }
    }
  }

  // Clear history data
  const clearHistory = () => {
    setAttemptHistory([])
    localStorage.removeItem("italianNumbersHistory")
  }

  return (
    <GameContext.Provider
      value={{
        gameState,
        userAnswer,
        isCorrect,
        showHint,
        showTypeCorrectionMode,
        difficulty,
        reviewCount,
        attemptHistory,
        performanceMetrics,
        setUserAnswer: handleSetUserAnswer,
        checkAnswer,
        generateNewNumber,
        setDifficulty,
        setShowHint,
        speakNumber,
        getHint,
        clearHistory,
        isInputValid,
        isSubmitting,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

// Custom hook
export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

