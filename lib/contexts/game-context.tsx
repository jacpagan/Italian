"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { GameStateManager, type DifficultyLevel, type GameState } from "../services/game-state-manager"
import { ItalianNumberConverter } from "../services/italian-number-converter"
import { NumberGenerator } from "../services/number-generator"
import { ReviewManager } from "../services/review-manager"
import { SpeechService } from "../services/speech-service"

interface GameContextType {
  gameState: GameState
  userAnswer: string
  isCorrect: boolean | null
  showHint: boolean
  showTypeCorrectionMode: boolean
  difficulty: DifficultyLevel
  reviewCount: number
  setUserAnswer: (answer: string) => void
  checkAnswer: () => void
  generateNewNumber: () => void
  setDifficulty: (difficulty: DifficultyLevel) => void
  setShowHint: (show: boolean) => void
  speakNumber: () => void
  getHint: () => string
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Initialize services
  const numberGenerator = new NumberGenerator()
  const numberConverter = new ItalianNumberConverter()
  const reviewManager = new ReviewManager()
  const speechService = new SpeechService()
  const gameStateManager = new GameStateManager(numberGenerator, numberConverter, reviewManager)

  // State
  const [gameState, setGameState] = useState<GameState>(gameStateManager.getState())
  const [userAnswer, setUserAnswer] = useState("")
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showTypeCorrectionMode, setShowTypeCorrectionMode] = useState(false)
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(gameStateManager.getDifficulty())
  const [reviewCount, setReviewCount] = useState(0)

  // Initialize game
  useEffect(() => {
    generateNewNumber()
  }, [])

  // Update review count
  useEffect(() => {
    setReviewCount(gameStateManager.getReviewCount())
  }, [gameState])

  // Handle difficulty change
  const setDifficulty = (newDifficulty: DifficultyLevel) => {
    gameStateManager.setDifficulty(newDifficulty)
    setDifficultyState(newDifficulty)
    generateNewNumber()
  }

  // Generate a new number
  const generateNewNumber = () => {
    const newState = gameStateManager.generateNewState()
    setGameState(newState)
    setUserAnswer("")
    setIsCorrect(null)
    setShowHint(false)
    setShowTypeCorrectionMode(false)
  }

  // Check the user's answer
  const checkAnswer = () => {
    if (showTypeCorrectionMode) {
      // In correction mode, check if they typed the correct answer
      const isAnswerCorrect = userAnswer.trim().toLowerCase() === gameState.correctAnswer.toLowerCase()
      if (isAnswerCorrect) {
        setIsCorrect(true)
        speakNumber()
        setTimeout(() => {
          generateNewNumber()
        }, 1500)
      }
      return
    }

    const isAnswerCorrect = userAnswer.trim().toLowerCase() === gameState.correctAnswer.toLowerCase()
    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      // Speak the word when answer is correct
      speakNumber()
      setTimeout(() => {
        generateNewNumber()
      }, 1500)
    } else {
      // Add to review items if incorrect
      gameStateManager.addIncorrectAnswer(gameState.currentNumber, gameState.correctAnswer)

      // Show correction mode
      setTimeout(() => {
        setShowTypeCorrectionMode(true)
        setUserAnswer("")
      }, 1000)
    }
  }

  // Speak the current number
  const speakNumber = () => {
    speechService.speak(gameState.correctAnswer)
  }

  // Get a hint for the current number
  const getHint = () => {
    return numberConverter.getHint(gameState.correctAnswer)
  }

  const value: GameContextType = {
    gameState,
    userAnswer,
    isCorrect,
    showHint,
    showTypeCorrectionMode,
    difficulty,
    reviewCount,
    setUserAnswer,
    checkAnswer,
    generateNewNumber,
    setDifficulty,
    setShowHint,
    speakNumber,
    getHint,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}

