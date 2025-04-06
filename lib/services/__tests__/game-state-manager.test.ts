import { GameStateManager } from "../game-state-manager"
import { NumberGenerator } from "../number-generator"
import { ItalianNumberConverter } from "../italian-number-converter"
import { ReviewManager } from "../review-manager"

// Mock dependencies
jest.mock("../number-generator")
jest.mock("../italian-number-converter")
jest.mock("../review-manager")

describe("GameStateManager", () => {
  let gameStateManager: GameStateManager
  let numberGenerator: jest.Mocked<NumberGenerator>
  let numberConverter: jest.Mocked<ItalianNumberConverter>
  let reviewManager: jest.Mocked<ReviewManager>

  beforeEach(() => {
    // Setup mocks
    numberGenerator = new NumberGenerator() as jest.Mocked<NumberGenerator>
    numberConverter = new ItalianNumberConverter() as jest.Mocked<ItalianNumberConverter>
    reviewManager = new ReviewManager() as jest.Mocked<ReviewManager>

    // Default mock implementations
    numberGenerator.generate = jest.fn().mockReturnValue(5)
    numberConverter.toItalianWord = jest.fn().mockReturnValue("cinque")
    numberConverter.getGrammarNote = jest.fn().mockReturnValue("")
    reviewManager.shouldShowReview = jest.fn().mockReturnValue(false)
    reviewManager.getNextItem = jest.fn().mockReturnValue(null)
    reviewManager.getCount = jest.fn().mockReturnValue(0)

    gameStateManager = new GameStateManager(numberGenerator, numberConverter, reviewManager)
  })

  describe("generateNewState", () => {
    test("should generate new number state when not in review mode", () => {
      const state = gameStateManager.generateNewState()

      expect(state.currentNumber).toBe(5)
      expect(state.correctAnswer).toBe("cinque")
      expect(state.isReviewMode).toBe(false)
      expect(state.currentReviewItem).toBeNull()
      expect(numberGenerator.generate).toHaveBeenCalledWith(1, 20) // Default is easy
    })

    test("should generate review state when review is available", () => {
      // Setup review mode
      reviewManager.shouldShowReview = jest.fn().mockReturnValue(true)
      reviewManager.getNextItem = jest.fn().mockReturnValue({
        number: 42,
        correctAnswer: "quarantadue",
        lastSeen: Date.now(),
      })

      const state = gameStateManager.generateNewState()

      expect(state.currentNumber).toBe(42)
      expect(state.correctAnswer).toBe("quarantadue")
      expect(state.isReviewMode).toBe(true)
      expect(state.currentReviewItem).not.toBeNull()
      expect(reviewManager.removeItem).toHaveBeenCalledWith(42)
    })
  })

  describe("setDifficulty", () => {
    test("should update difficulty", () => {
      gameStateManager.setDifficulty("medium")
      expect(gameStateManager.getDifficulty()).toBe("medium")

      // Generate new state should use new difficulty
      gameStateManager.generateNewState()
      expect(numberGenerator.generate).toHaveBeenCalledWith(1, 100)
    })
  })

  describe("addIncorrectAnswer", () => {
    test("should add incorrect answer to review manager", () => {
      gameStateManager.addIncorrectAnswer(42, "quarantadue")
      expect(reviewManager.addItem).toHaveBeenCalledWith({
        number: 42,
        correctAnswer: "quarantadue",
        lastSeen: expect.any(Number),
      })
    })
  })
})

