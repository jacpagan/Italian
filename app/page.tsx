import ItalianNumbersGame from "@/components/italian-numbers-game"
import { GameProvider } from "@/lib/contexts/game-context"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl px-4 py-6 mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Learn Italian Cardinal Numbers</h1>
        </header>

        <main>
          <GameProvider>
            <ItalianNumbersGame />
          </GameProvider>
        </main>
      </div>
    </div>
  )
}

