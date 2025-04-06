import { ReviewManager } from "../review-manager"
import type { ReviewItem } from "../../models/review-item"
import { describe, beforeEach, test, expect } from "@jest/globals"

describe("ReviewManager", () => {
  let reviewManager: ReviewManager

  beforeEach(() => {
    reviewManager = new ReviewManager()
  })

  describe("addItem", () => {
    test("should add item to review list", () => {
      const item: ReviewItem = {
        number: 42,
        correctAnswer: "quarantadue",
        lastSeen: Date.now(),
      }

      reviewManager.addItem(item)
      expect(reviewManager.getCount()).toBe(1)
    })

    test("should not add duplicate items", () => {
      const item: ReviewItem = {
        number: 42,
        correctAnswer: "quarantadue",
        lastSeen: Date.now(),
      }

      reviewManager.addItem(item)
      reviewManager.addItem(item)
      expect(reviewManager.getCount()).toBe(1)
    })
  })

  describe("getNextItem", () => {
    test("should return null when no items", () => {
      expect(reviewManager.getNextItem()).toBeNull()
    })

    test("should return item with oldest lastSeen", () => {
      const now = Date.now()

      const item1: ReviewItem = {
        number: 42,
        correctAnswer: "quarantadue",
        lastSeen: now - 1000, // Older
      }

      const item2: ReviewItem = {
        number: 21,
        correctAnswer: "ventuno",
        lastSeen: now, // Newer
      }

      reviewManager.addItem(item2)
      reviewManager.addItem(item1)

      const nextItem = reviewManager.getNextItem()
      expect(nextItem).not.toBeNull()
      expect(nextItem?.number).toBe(42)
    })
  })

  describe("removeItem", () => {
    test("should remove item from review list", () => {
      const item: ReviewItem = {
        number: 42,
        correctAnswer: "quarantadue",
        lastSeen: Date.now(),
      }

      reviewManager.addItem(item)
      expect(reviewManager.getCount()).toBe(1)

      reviewManager.removeItem(42)
      expect(reviewManager.getCount()).toBe(0)
    })

    test("should not error when removing non-existent item", () => {
      expect(() => reviewManager.removeItem(99)).not.toThrow()
    })
  })

  describe("shouldShowReview", () => {
    test("should return false when no items", () => {
      // Force probability to 1 to ensure it would return true if there were items
      expect(reviewManager.shouldShowReview(1)).toBe(false)
    })

    test("should respect probability", () => {
      const item: ReviewItem = {
        number: 42,
        correctAnswer: "quarantadue",
        lastSeen: Date.now(),
      }

      reviewManager.addItem(item)

      // Force probability to 1 to ensure it returns true
      expect(reviewManager.shouldShowReview(1)).toBe(true)

      // Force probability to 0 to ensure it returns false
      expect(reviewManager.shouldShowReview(0)).toBe(false)
    })
  })
})

