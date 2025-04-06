import { ItalianNumberConverter } from "../italian-number-converter"
import { describe, beforeEach, test, expect } from "@jest/globals"

describe("ItalianNumberConverter", () => {
  let converter: ItalianNumberConverter

  beforeEach(() => {
    converter = new ItalianNumberConverter()
  })

  describe("toItalianWord", () => {
    test("should convert single digits correctly", () => {
      expect(converter.toItalianWord(1)).toBe("uno")
      expect(converter.toItalianWord(5)).toBe("cinque")
      expect(converter.toItalianWord(9)).toBe("nove")
    })

    test("should convert teens correctly", () => {
      expect(converter.toItalianWord(11)).toBe("undici")
      expect(converter.toItalianWord(15)).toBe("quindici")
      expect(converter.toItalianWord(19)).toBe("diciannove")
    })

    test("should convert tens correctly", () => {
      expect(converter.toItalianWord(20)).toBe("venti")
      expect(converter.toItalianWord(50)).toBe("cinquanta")
      expect(converter.toItalianWord(90)).toBe("novanta")
    })

    test("should handle special cases with 1 and 8", () => {
      expect(converter.toItalianWord(21)).toBe("ventuno")
      expect(converter.toItalianWord(28)).toBe("ventotto")
      expect(converter.toItalianWord(81)).toBe("ottantuno")
      expect(converter.toItalianWord(88)).toBe("ottantotto")
    })

    test("should handle special case with 3", () => {
      expect(converter.toItalianWord(23)).toBe("ventitré")
      expect(converter.toItalianWord(33)).toBe("trentatré")
      expect(converter.toItalianWord(93)).toBe("novantatré")
    })

    test("should convert hundreds correctly", () => {
      expect(converter.toItalianWord(100)).toBe("cento")
      expect(converter.toItalianWord(101)).toBe("centouno")
      expect(converter.toItalianWord(110)).toBe("centodieci")
      expect(converter.toItalianWord(200)).toBe("duecento")
      expect(converter.toItalianWord(999)).toBe("novecentonovantanove")
    })

    test("should convert 1000 correctly", () => {
      expect(converter.toItalianWord(1000)).toBe("mille")
    })
  })

  describe("getGrammarNote", () => {
    test("should return note for numbers 11-16", () => {
      expect(converter.getGrammarNote(13, "tredici")).toContain("11-16")
    })

    test("should return note for numbers 17-19", () => {
      expect(converter.getGrammarNote(18, "diciotto")).toContain("17-19")
    })

    test("should return note for numbers ending with 1", () => {
      expect(converter.getGrammarNote(21, "ventuno")).toContain("drop the final vowel")
    })

    test("should return note for numbers ending with 8", () => {
      expect(converter.getGrammarNote(28, "ventotto")).toContain("drop the final vowel")
    })

    test("should return note for numbers ending with 3", () => {
      expect(converter.getGrammarNote(23, "ventitré")).toContain("accent")
    })

    test("should return empty string for other numbers", () => {
      expect(converter.getGrammarNote(22, "ventidue")).toBe("")
    })
  })

  describe("getHint", () => {
    test("should reveal only first two letters", () => {
      expect(converter.getHint("venti")).toBe("ve___")
      expect(converter.getHint("quaranta")).toBe("qu______")
      expect(converter.getHint("uno")).toBe("un_")
    })
  })
})

