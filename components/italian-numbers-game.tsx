"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, RefreshCw, Volume2, RotateCcw } from "lucide-react"
import ObjectsDisplay from "@/components/objects-display"
import { LearningRules } from "@/components/learning-rules"
import { useGame } from "@/lib/contexts/game-context"

export default function ItalianNumbersGame() {
  const {
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
  } = useGame()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer()
    }
  }

  return (
    <div className="space-y-6">
      <LearningRules />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Italian Cardinal Numbers
              {gameState.isReviewMode && <span className="ml-2 text-sm text-orange-500">(Review)</span>}
            </CardTitle>
            {reviewCount > 0 && <div className="text-sm text-gray-500">Review items: {reviewCount}</div>}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold mb-4">{gameState.currentNumber}</div>
              {gameState.currentNumber <= 20 && (
                <div className="my-4">
                  <ObjectsDisplay count={gameState.currentNumber} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder={showTypeCorrectionMode ? "Type the correct answer..." : "Type the Italian word..."}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`text-lg ${
                  isCorrect === true ? "border-green-500" : isCorrect === false ? "border-red-500" : ""
                }`}
              />
              <Button onClick={speakNumber} variant="outline" size="icon" title="Hear pronunciation">
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>

            {isCorrect === true && (
              <div className="flex items-center text-green-600">
                <Check className="mr-2" /> Correct!
              </div>
            )}

            {isCorrect === false && !showTypeCorrectionMode && (
              <div className="flex items-center text-red-600">
                <X className="mr-2" /> The correct answer is:{" "}
                <span className="font-bold ml-1">{gameState.correctAnswer}</span>
              </div>
            )}

            {showTypeCorrectionMode && (
              <div className="space-y-2">
                <div className="flex items-center text-blue-600">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Now type: <span className="font-bold ml-1">{gameState.correctAnswer}</span>
                </div>
                {gameState.grammarNote && (
                  <div className="text-sm bg-blue-50 p-2 rounded-md">
                    <strong>Tip:</strong> {gameState.grammarNote}
                  </div>
                )}
              </div>
            )}

            {showHint && !showTypeCorrectionMode && <div className="text-blue-600 font-medium">Hint: {getHint()}</div>}
          </div>

          <div className="flex justify-between">
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDifficulty("easy")}
                className={difficulty === "easy" ? "bg-primary text-primary-foreground" : ""}
              >
                1-20
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDifficulty("medium")}
                className={difficulty === "medium" ? "bg-primary text-primary-foreground" : ""}
              >
                1-100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDifficulty("hard")}
                className={difficulty === "hard" ? "bg-primary text-primary-foreground" : ""}
              >
                1-1000
              </Button>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint || showTypeCorrectionMode}>
                Hint
              </Button>
              <Button onClick={checkAnswer}>{showTypeCorrectionMode ? "Verify" : "Check"}</Button>
              <Button variant="outline" onClick={generateNewNumber}>
                <RefreshCw className="mr-2 h-4 w-4" /> New
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

