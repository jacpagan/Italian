import type { ItalianNumberConverter } from "./italian-number-converter"
import type { NumberGenerator } from "./number-generator"
import type { ReviewManager } from "./review-manager"
import type { ReviewItem } from "../models/review-item"

export type DifficultyLevel = "easy" | "medium" | "hard"

export interface DifficultyRange {
  min: number
  max: number
}

export interface GameState {
  currentNumber: number
  correctAnswer: string
  isReviewMode: boolean
  currentReviewItem: ReviewItem | null
  grammarNote: string
}

/**
 * Service responsible for managing the game state
 */
export class GameStateManager {
  private readonly difficultyRanges: Record<DifficultyLevel, DifficultyRange> = {
    easy: { min: 1, max: 20 },
    medium: { min: 1, max: 100 },
    hard: { min: 1, max: 1000 },
  }

  private currentDifficulty: DifficultyLevel = "easy"
  private gameState: GameState = {
    currentNumber: 1,
    correctAnswer: "",
    isReviewMode: false,
    currentReviewItem: null,
    grammarNote: "",
  }

  constructor(
    private readonly numberGenerator: NumberGenerator,
    private readonly numberConverter: ItalianNumberConverter,
    private readonly reviewManager: ReviewManager,
  ) {}

  /**
   * Generates a new game state
   * @returns The new game state
   */
  public generateNewState(): GameState {
    // Check if we should show a review item
    if (this.reviewManager.shouldShowReview()) {
      return this.generateReviewState()
    } else {
      return this.generateNewNumberState()
    }
  }

  /**
   * Sets the difficulty level
   * @param difficulty The new difficulty level
   */
  public setDifficulty(difficulty: DifficultyLevel): void {
    this.currentDifficulty = difficulty
  }

  /**
   * Gets the current difficulty level
   * @returns The current difficulty level
   */
  public getDifficulty(): DifficultyLevel {
    return this.currentDifficulty
  }

  /**
   * Gets the current game state
   * @returns The current game state
   */
  public getState(): GameState {
    return this.gameState
  }

  /**
   * Adds an incorrect answer to the review list
   * @param number The number that was answered incorrectly
   * @param correctAnswer The correct answer
   */
  public addIncorrectAnswer(number: number, correctAnswer: string): void {
    this.reviewManager.addItem({
      number,
      correctAnswer,
      lastSeen: Date.now(),
    })
  }

  /**
   * Gets the count of review items
   * @returns The number of items in the review list
   */
  public getReviewCount(): number {
    return this.reviewManager.getCount()
  }

  private generateReviewState(): GameState {
    const reviewItem = this.reviewManager.getNextItem()

    if (!reviewItem) {
      return this.generateNewNumberState()
    }

    this.reviewManager.removeItem(reviewItem.number)

    this.gameState = {
      currentNumber: reviewItem.number,
      correctAnswer: reviewItem.correctAnswer,
      isReviewMode: true,
      currentReviewItem: reviewItem,
      grammarNote: this.numberConverter.getGrammarNote(reviewItem.number, reviewItem.correctAnswer),
    }

    return this.gameState
  }

  private generateNewNumberState(): GameState {
    const range = this.difficultyRanges[this.currentDifficulty]
    const newNumber = this.numberGenerator.generate(range.min, range.max)
    const answer = this.numberConverter.toItalianWord(newNumber)

    this.gameState = {
      currentNumber: newNumber,
      correctAnswer: answer,
      isReviewMode: false,
      currentReviewItem: null,
      grammarNote: this.numberConverter.getGrammarNote(newNumber, answer),
    }

    return this.gameState
  }
}

