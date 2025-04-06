"use client"

import { useState, useEffect } from "react"
import { Apple, Car, Cat, Dog, Fish, Gift, Heart, Home, Leaf, Star } from "lucide-react"
import React from "react"

interface ObjectsDisplayProps {
  count: number
}

export default function ObjectsDisplay({ count }: ObjectsDisplayProps) {
  const [objects, setObjects] = useState<JSX.Element[]>([])

  useEffect(() => {
    const icons = [
      <Apple key="apple" className="w-6 h-6 text-red-500" />,
      <Star key="star" className="w-6 h-6 text-yellow-500" />,
      <Heart key="heart" className="w-6 h-6 text-pink-500" />,
      <Car key="car" className="w-6 h-6 text-blue-500" />,
      <Home key="home" className="w-6 h-6 text-purple-500" />,
      <Cat key="cat" className="w-6 h-6 text-gray-500" />,
      <Dog key="dog" className="w-6 h-6 text-brown-500" />,
      <Leaf key="leaf" className="w-6 h-6 text-green-500" />,
      <Fish key="fish" className="w-6 h-6 text-cyan-500" />,
      <Gift key="gift" className="w-6 h-6 text-indigo-500" />,
    ]

    // Choose a random icon for this set
    const randomIcon = icons[Math.floor(Math.random() * icons.length)]

    // Create an array of the selected icon repeated 'count' times
    const newObjects = Array(count)
      .fill(null)
      .map((_, index) => {
        return (
          <div key={index} className="inline-block m-1">
            {React.cloneElement(randomIcon, { key: index })}
          </div>
        )
      })

    setObjects(newObjects)
  }, [count])

  return <div className="flex flex-wrap justify-center max-w-md mx-auto">{objects}</div>
}

