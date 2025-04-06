/**
 * Service responsible for converting numbers to Italian words
 */
export class ItalianNumberConverter {
  private static readonly cardinalNumbers: Record<number, string> = {
    0: "zero",
    1: "uno",
    2: "due",
    3: "tre",
    4: "quattro",
    5: "cinque",
    6: "sei",
    7: "sette",
    8: "otto",
    9: "nove",
    10: "dieci",
    11: "undici",
    12: "dodici",
    13: "tredici",
    14: "quattordici",
    15: "quindici",
    16: "sedici",
    17: "diciassette",
    18: "diciotto",
    19: "diciannove",
    20: "venti",
    30: "trenta",
    40: "quaranta",
    50: "cinquanta",
    60: "sessanta",
    70: "settanta",
    80: "ottanta",
    90: "novanta",
    100: "cento",
    1000: "mille",
  }

  /**
   * Converts a number to its Italian word representation
   * @param num The number to convert
   * @returns The Italian word for the number
   */
  public toItalianWord(num: number): string {
    // Direct lookup for numbers in the dictionary
    if (num in ItalianNumberConverter.cardinalNumbers) {
      return ItalianNumberConverter.cardinalNumbers[num]
    }

    // Handle numbers between 21-99
    if (num > 20 && num < 100) {
      return this.handleTensRange(num)
    }

    // Handle numbers between 100-999
    if (num >= 100 && num < 1000) {
      return this.handleHundredsRange(num)
    }

    // Handle 1000
    if (num === 1000) {
      return "mille"
    }

    return "numero troppo grande" // Number too large
  }

  /**
   * Generates a grammar note for the given number and its Italian word
   * @param number The number
   * @param italianWord The Italian word for the number
   * @returns A grammar note explaining the rule used
   */
  public getGrammarNote(number: number, italianWord: string): string {
    if (number >= 11 && number <= 16) {
      return `Numbers 11-16 add "dici" after the root number.`
    } else if (number >= 17 && number <= 19) {
      return `Numbers 17-19 add the root number after "dici".`
    } else if (number % 10 === 1 && number > 20) {
      return `When adding 1 to tens, drop the final vowel (${italianWord.slice(0, -3)} + uno → ${italianWord}).`
    } else if (number % 10 === 8 && number > 20) {
      return `When adding 8 to tens, drop the final vowel (${italianWord.slice(0, -4)} + otto → ${italianWord}).`
    } else if (number % 10 === 3 && number > 20) {
      return `When adding 3 to tens, the e takes an accent (${italianWord}).`
    }
    return ""
  }

  /**
   * Generates a hint for the given Italian word
   * @param word The Italian word
   * @returns A hint with the first two letters revealed
   */
  public getHint(word: string): string {
    return word
      .split("")
      .map((char, i) => (i === 0 || i === 1 ? char : "_"))
      .join("")
  }

  private handleTensRange(num: number): string {
    const tens = Math.floor(num / 10) * 10
    const ones = num % 10

    if (ones === 0) {
      return ItalianNumberConverter.cardinalNumbers[tens]
    }

    // Special case for 1 and 8 (drop the last vowel)
    if (ones === 1 || ones === 8) {
      return ItalianNumberConverter.cardinalNumbers[tens].slice(0, -1) + ItalianNumberConverter.cardinalNumbers[ones]
    }

    // For 3, add accent
    if (ones === 3) {
      return ItalianNumberConverter.cardinalNumbers[tens] + "tré"
    }

    return ItalianNumberConverter.cardinalNumbers[tens] + ItalianNumberConverter.cardinalNumbers[ones]
  }

  private handleHundredsRange(num: number): string {
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100

    const result = hundreds === 1 ? "cento" : ItalianNumberConverter.cardinalNumbers[hundreds] + "cento"

    if (remainder === 0) {
      return result
    }

    return result + this.toItalianWord(remainder)
  }
}

