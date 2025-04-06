"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

export function LearningRules() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-gray-50 rounded-lg border p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Italian Cardinal Numbers</h2>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Numbers 1-10</h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>uno</strong> (1)
              </li>
              <li>
                <strong>due</strong> (2)
              </li>
              <li>
                <strong>tre</strong> (3)
              </li>
              <li>
                <strong>quattro</strong> (4)
              </li>
              <li>
                <strong>cinque</strong> (5)
              </li>
              <li>
                <strong>sei</strong> (6)
              </li>
              <li>
                <strong>sette</strong> (7)
              </li>
              <li>
                <strong>otto</strong> (8)
              </li>
              <li>
                <strong>nove</strong> (9)
              </li>
              <li>
                <strong>dieci</strong> (10)
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Numbers 11-20</h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>undici</strong> (11)
              </li>
              <li>
                <strong>dodici</strong> (12)
              </li>
              <li>
                <strong>tredici</strong> (13)
              </li>
              <li>
                <strong>quattordici</strong> (14)
              </li>
              <li>
                <strong>quindici</strong> (15)
              </li>
              <li>
                <strong>sedici</strong> (16)
              </li>
              <li>
                <strong>diciassette</strong> (17)
              </li>
              <li>
                <strong>diciotto</strong> (18)
              </li>
              <li>
                <strong>diciannove</strong> (19)
              </li>
              <li>
                <strong>venti</strong> (20)
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Key Rules</h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                Numbers 11-16: add <strong>dici</strong> after root (tre + dici = tredici)
              </li>
              <li>
                Numbers 17-19: add root after <strong>dici</strong> (dici + otto = diciotto)
              </li>
              <li>Numbers 21-99: add root after tens (venti + due = ventidue)</li>
              <li>Special cases: drop final vowel with 1 and 8 (ventuno, ventotto)</li>
              <li>With 3, add accent: trentatré</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Tens</h3>
            <ul className="list-disc list-inside ml-4">
              <li>
                <strong>venti</strong> (20)
              </li>
              <li>
                <strong>trenta</strong> (30)
              </li>
              <li>
                <strong>quaranta</strong> (40)
              </li>
              <li>
                <strong>cinquanta</strong> (50)
              </li>
              <li>
                <strong>sessanta</strong> (60)
              </li>
              <li>
                <strong>settanta</strong> (70)
              </li>
              <li>
                <strong>ottanta</strong> (80)
              </li>
              <li>
                <strong>novanta</strong> (90)
              </li>
              <li>
                <strong>cento</strong> (100)
              </li>
              <li>
                <strong>mille</strong> (1000)
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

