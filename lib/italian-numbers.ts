// Cardinal numbers (1-1000)
const cardinalNumbers: Record<number, string> = {
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

export function getCardinalName(num: number): string {
  // Direct lookup for numbers in the dictionary
  if (num in cardinalNumbers) {
    return cardinalNumbers[num]
  }

  // Handle numbers between 21-99
  if (num > 20 && num < 100) {
    const tens = Math.floor(num / 10) * 10
    const ones = num % 10

    if (ones === 0) {
      return cardinalNumbers[tens]
    }

    // Special case for 1 and 8 (drop the last vowel)
    if (ones === 1 || ones === 8) {
      return cardinalNumbers[tens].slice(0, -1) + cardinalNumbers[ones]
    }

    // For 3, add accent
    if (ones === 3) {
      return cardinalNumbers[tens] + "tré"
    }

    return cardinalNumbers[tens] + cardinalNumbers[ones]
  }

  // Handle numbers between 100-999
  if (num >= 100 && num < 1000) {
    const hundreds = Math.floor(num / 100)
    const remainder = num % 100

    const result = hundreds === 1 ? "cento" : cardinalNumbers[hundreds] + "cento"

    if (remainder === 0) {
      return result
    }

    return result + getCardinalName(remainder)
  }

  // Handle 1000
  if (num === 1000) {
    return "mille"
  }

  return "numero troppo grande" // Number too large
}

