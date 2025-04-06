import type { ReviewItem } from "../models/review-item"

/**
 * Service responsible for managing review items
 */
export class ReviewManager {
  private reviewItems: ReviewItem[] = []

  /**
   * Adds a new item to the review list
   * @param item The review item to add
   */
  public addItem(item: ReviewItem): void {
    // Only add if not already in the list
    if (!this.reviewItems.some((existing) => existing.number === item.number)) {
      this.reviewItems.push(item)
    }
  }

  /**
   * Gets the next item for review, prioritizing items that haven't been seen recently
   * @returns The next review item, or null if there are none
   */
  public getNextItem(): ReviewItem | null {
    if (this.reviewItems.length === 0) {
      return null
    }

    // Sort by last seen time (oldest first)
    const sortedItems = [...this.reviewItems].sort((a, b) => a.lastSeen - b.lastSeen)
    return sortedItems[0]
  }

  /**
   * Removes an item from the review list
   * @param number The number to remove
   */
  public removeItem(number: number): void {
    this.reviewItems = this.reviewItems.filter((item) => item.number !== number)
  }

  /**
   * Gets the count of review items
   * @returns The number of items in the review list
   */
  public getCount(): number {
    return this.reviewItems.length
  }

  /**
   * Checks if there should be a review based on probability
   * @param probability The probability of showing a review item (0-1)
   * @returns True if a review should be shown
   */
  public shouldShowReview(probability = 0.3): boolean {
    return this.reviewItems.length > 0 && Math.random() < probability
  }
}

