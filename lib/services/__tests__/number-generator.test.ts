import { NumberGenerator } from "../number-generator"
import { describe, beforeEach, test, expect } from "@jest/globals"

describe("NumberGenerator", () => {
  let generator: NumberGenerator

  beforeEach(() => {
    generator = new NumberGenerator()
  })

  describe("generate", () => {
    test("should generate number within range", () => {
      // Test with multiple ranges
      for (let i = 0; i < 100; i++) {
        const min = 1
        const max = 10
        const result = generator.generate(min, max)

        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
      }
    })

    test("should handle min equal to max", () => {
      const min = 5
      const max = 5
      const result = generator.generate(min, max)

      expect(result).toBe(5)
    })

    test("should handle large ranges", () => {
      const min = 1
      const max = 1000
      const result = generator.generate(min, max)

      expect(result).toBeGreaterThanOrEqual(min)
      expect(result).toBeLessThanOrEqual(max)
    })
  })
})

