/**
 * Service responsible for generating random numbers within a range
 */
export class NumberGenerator {
  /**
   * Generates a random number within the specified range
   * @param min The minimum value (inclusive)
   * @param max The maximum value (inclusive)
   * @returns A random number within the range
   */
  public generate(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

