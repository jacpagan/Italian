"use client"

import { useGame } from "@/lib/contexts/game-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart, PieChart, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function ProgressDashboard() {
  const { attemptHistory, performanceMetrics, clearHistory } = useGame()
  const [activeTab, setActiveTab] = useState<"summary" | "history" | "trends">("summary")

  // Format time in seconds with 1 decimal place
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1)
  }

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get recent progress trend (last 10 attempts)
  const getRecentAccuracy = () => {
    if (attemptHistory.length < 10) return "Not enough data"

    const recent = attemptHistory.slice(-10)
    const correctCount = recent.filter((a) => a.isCorrect).length
    return `${((correctCount / 10) * 100).toFixed(0)}%`
  }

  // Get improvement percentage
  const getImprovement = () => {
    if (attemptHistory.length < 20) return "Not enough data"

    const older = attemptHistory.slice(-20, -10)
    const newer = attemptHistory.slice(-10)

    const olderCorrect = older.filter((a) => a.isCorrect).length / older.length
    const newerCorrect = newer.filter((a) => a.isCorrect).length / newer.length

    const improvement = ((newerCorrect - olderCorrect) / olderCorrect) * 100

    if (isNaN(improvement)) return "N/A"

    return improvement > 0 ? `+${improvement.toFixed(0)}%` : `${improvement.toFixed(0)}%`
  }

  // Get response time trend
  const getResponseTimeTrend = () => {
    if (attemptHistory.length < 20) return "Not enough data"

    const older = attemptHistory.slice(-20, -10)
    const newer = attemptHistory.slice(-10)

    const olderTime = older.reduce((sum, a) => sum + a.timeToAnswer, 0) / older.length
    const newerTime = newer.reduce((sum, a) => sum + a.timeToAnswer, 0) / newer.length

    const improvement = ((olderTime - newerTime) / olderTime) * 100

    if (isNaN(improvement)) return "N/A"

    return improvement > 0 ? `${improvement.toFixed(0)}% faster` : `${Math.abs(improvement).toFixed(0)}% slower`
  }

  // Get today's attempts
  const getTodayAttempts = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return attemptHistory.filter((a) => a.timestamp >= today.getTime()).length
  }

  // Get today's accuracy
  const getTodayAccuracy = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAttempts = attemptHistory.filter((a) => a.timestamp >= today.getTime())
    if (todayAttempts.length === 0) return "No attempts"

    const correct = todayAttempts.filter((a) => a.isCorrect).length
    return `${((correct / todayAttempts.length) * 100).toFixed(0)}%`
  }

  // Get attempts per number
  const getAttemptsPerNumber = () => {
    const counts = {}

    attemptHistory.forEach((attempt) => {
      if (!counts[attempt.number]) {
        counts[attempt.number] = {
          total: 0,
          correct: 0,
          incorrect: 0,
        }
      }

      counts[attempt.number].total += 1
      if (attempt.isCorrect) {
        counts[attempt.number].correct += 1
      } else {
        counts[attempt.number].incorrect += 1
      }
    })

    return counts
  }

  // Get numbers with multiple attempts
  const getMultipleAttemptNumbers = () => {
    const counts = getAttemptsPerNumber()

    return Object.entries(counts)
      .filter(([_, data]) => data.total > 1)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([number, data]) => ({
        number: Number.parseInt(number),
        attempts: data.total,
        correct: data.correct,
        incorrect: data.incorrect,
      }))
  }

  // Get exam-like statistics
  const getExamStats = () => {
    // Group attempts by number
    const attemptsByNumber = {}

    attemptHistory.forEach((attempt) => {
      if (!attemptsByNumber[attempt.number]) {
        attemptsByNumber[attempt.number] = []
      }
      attemptsByNumber[attempt.number].push(attempt)
    })

    // Calculate first-attempt success rate
    let totalNumbers = 0
    let firstAttemptCorrect = 0

    Object.values(attemptsByNumber).forEach((attempts: any) => {
      totalNumbers++
      // Sort by timestamp to ensure we're looking at the first attempt
      const sortedAttempts = [...attempts].sort((a, b) => a.timestamp - b.timestamp)
      if (sortedAttempts[0].isCorrect) {
        firstAttemptCorrect++
      }
    })

    const firstAttemptRate = totalNumbers > 0 ? (firstAttemptCorrect / totalNumbers) * 100 : 0

    // Calculate average attempts per number
    const attemptsPerNumber = Object.values(attemptsByNumber).map((attempts: any) => attempts.length)
    const avgAttemptsPerNumber =
      attemptsPerNumber.length > 0
        ? attemptsPerNumber.reduce((sum, count) => sum + count, 0) / attemptsPerNumber.length
        : 0

    return {
      totalUniqueNumbers: totalNumbers,
      firstAttemptSuccessRate: firstAttemptRate,
      averageAttemptsPerNumber: avgAttemptsPerNumber,
      perfectNumbers: firstAttemptCorrect,
      challengingNumbers: totalNumbers - firstAttemptCorrect,
    }
  }

  const examStats = getExamStats()

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Learning Progress</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "summary" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("summary")}
            >
              <PieChart className="h-4 w-4 mr-1" />
              Summary
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("history")}
            >
              <BarChart className="h-4 w-4 mr-1" />
              History
            </Button>
            <Button
              variant={activeTab === "trends" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("trends")}
            >
              <LineChart className="h-4 w-4 mr-1" />
              Trends
            </Button>
          </div>
        </div>
        <CardDescription>Track your progress learning Italian numbers</CardDescription>
      </CardHeader>
      <CardContent>
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                <div className="text-2xl font-bold mt-1">{performanceMetrics.accuracy.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {performanceMetrics.correctAttempts} correct / {performanceMetrics.totalAttempts} total
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Average Response Time</div>
                <div className="text-2xl font-bold mt-1">{formatTime(performanceMetrics.averageResponseTime)}s</div>
                <div className="text-xs text-muted-foreground mt-1">Recent trend: {getResponseTimeTrend()}</div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Recent Performance</div>
                <div className="text-2xl font-bold mt-1">{getRecentAccuracy()}</div>
                <div className="text-xs text-muted-foreground mt-1">Improvement: {getImprovement()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Today's Progress</div>
                <div className="flex justify-between mt-2">
                  <div>
                    <div className="text-sm font-medium">Attempts</div>
                    <div className="text-xl font-bold">{getTodayAttempts()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Accuracy</div>
                    <div className="text-xl font-bold">{getTodayAccuracy()}</div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Numbers Requiring Multiple Attempts</div>
                <div className="mt-2 space-y-1">
                  {getMultipleAttemptNumbers().length > 0 ? (
                    getMultipleAttemptNumbers().map((item) => (
                      <div key={item.number} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{item.number}</span>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">{item.correct} ✓</span>
                          <span className="text-red-600">{item.incorrect} ✗</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No data yet</div>
                  )}
                </div>
              </div>
            </div>

            {performanceMetrics.mostChallenging.length > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Most Challenging Numbers</div>
                <div className="flex gap-2 mt-2">
                  {performanceMetrics.mostChallenging.map((num) => (
                    <div key={num} className="bg-background px-3 py-1 rounded-full text-sm">
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">First Attempt Success Rate</div>
                <div className="text-2xl font-bold mt-1">{examStats.firstAttemptSuccessRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {examStats.perfectNumbers} perfect / {examStats.totalUniqueNumbers} total numbers
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Average Attempts Per Number</div>
                <div className="text-2xl font-bold mt-1">{examStats.averageAttemptsPerNumber.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">Lower is better (1.0 is perfect)</div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Attempt Distribution</div>
              <div className="flex items-center gap-2 mt-4">
                <div
                  className="bg-green-500 h-4 rounded-sm"
                  style={{ width: `${examStats.firstAttemptSuccessRate}%` }}
                />
                <div
                  className="bg-red-500 h-4 rounded-sm"
                  style={{ width: `${100 - examStats.firstAttemptSuccessRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>First attempt correct</span>
                <span>Required multiple attempts</span>
              </div>
            </div>

            {attemptHistory.length > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  Clear History
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Recent Attempts</div>
            {attemptHistory.length === 0 ? (
              <div className="text-muted-foreground text-sm">No attempts recorded yet</div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {[...attemptHistory]
                  .reverse()
                  .slice(0, 20)
                  .map((attempt) => (
                    <div
                      key={attempt.id}
                      className={`p-2 rounded-md text-sm flex justify-between ${
                        attempt.isCorrect ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                      }`}
                    >
                      <div className="flex items-center">
                        {attempt.isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
                        )}
                        <span className="font-medium">{attempt.number}</span>
                        <span className="mx-2">→</span>
                        <span
                          className={
                            attempt.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          }
                        >
                          {attempt.answer || "(empty)"}
                        </span>
                        {!attempt.isCorrect && (
                          <span className="text-muted-foreground ml-2">(correct: {attempt.correctAnswer})</span>
                        )}
                        {attempt.attemptType === "correction" && (
                          <span className="ml-2 text-blue-500 text-xs">(correction)</span>
                        )}
                        {attempt.hintsUsed && (
                          <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" title="Hint used" />
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(attempt.timeToAnswer)}s
                        <span className="ml-2 text-xs">{formatDate(attempt.timestamp)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "trends" && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Learning Trends</div>
            {attemptHistory.length < 10 ? (
              <div className="text-muted-foreground text-sm">Need more attempts to show trends (at least 10)</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Response Time Improvement</div>
                  <div className="h-[100px] flex items-end gap-1">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const segment = attemptHistory.slice(
                        Math.max(0, attemptHistory.length - 10 + i),
                        Math.max(0, attemptHistory.length - 9 + i),
                      )

                      if (segment.length === 0) return null

                      const avgTime = segment.reduce((sum, a) => sum + a.timeToAnswer, 0) / segment.length
                      const maxTime = 5000 // 5 seconds max for scaling
                      const height = Math.min(100, (avgTime / maxTime) * 100)

                      return (
                        <div
                          key={i}
                          className="bg-primary w-full rounded-t-sm"
                          style={{ height: `${height}%` }}
                          title={`${formatTime(avgTime)}s average`}
                        />
                      )
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Last 10 attempts (newest right)</div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Accuracy Trend</div>
                  <div className="h-[100px] flex items-end gap-1">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const segment = attemptHistory.slice(
                        Math.max(0, attemptHistory.length - 10 + i),
                        Math.max(0, attemptHistory.length - 9 + i),
                      )

                      if (segment.length === 0) return null

                      const correct = segment.filter((a) => a.isCorrect).length
                      const height = (correct / segment.length) * 100

                      return (
                        <div
                          key={i}
                          className={`${correct ? "bg-green-500" : "bg-red-500"} w-full rounded-t-sm`}
                          style={{ height: `${height}%` }}
                          title={`${(height).toFixed(0)}% correct`}
                        />
                      )
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Last 10 attempts (newest right)</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

