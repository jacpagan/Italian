import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ItalianNumbersGame from "../italian-numbers-game"
import { GameProvider } from "@/lib/contexts/game-context"

// Mock the speech synthesis
global.SpeechSynthesisUtterance = jest.fn().mockImplementation(() => ({
  lang: "",
}))
global.speechSynthesis = {
  speak: jest.fn(),
}

describe("ItalianNumbersGame", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders the game with initial state", () => {
    render(
      <GameProvider>
        <ItalianNumbersGame />
      </GameProvider>,
    )

    // Check that the main elements are rendered
    expect(screen.getByText(/Italian Cardinal Numbers/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Type the Italian word/i)).toBeInTheDocument()
    expect(screen.getByText(/1-20/i)).toBeInTheDocument()
    expect(screen.getByText(/1-100/i)).toBeInTheDocument()
    expect(screen.getByText(/1-1000/i)).toBeInTheDocument()
  })

  test("allows user to input an answer", () => {
    render(
      <GameProvider>
        <ItalianNumbersGame />
      </GameProvider>,
    )

    const input = screen.getByPlaceholderText(/Type the Italian word/i)
    fireEvent.change(input, { target: { value: "uno" } })
    expect(input).toHaveValue("uno")
  })

  test("shows hint when hint button is clicked", async () => {
    render(
      <GameProvider>
        <ItalianNumbersGame />
      </GameProvider>,
    )

    const hintButton = screen.getByText(/Hint/i)
    fireEvent.click(hintButton)

    await waitFor(() => {
      expect(screen.getByText(/Hint:/i)).toBeInTheDocument()
    })
  })

  test("speaks the number when pronunciation button is clicked", () => {
    render(
      <GameProvider>
        <ItalianNumbersGame />
      </GameProvider>,
    )

    const speakButton = screen.getByTitle(/Hear pronunciation/i)
    fireEvent.click(speakButton)

    expect(global.speechSynthesis.speak).toHaveBeenCalled()
  })

  test("changes difficulty when difficulty buttons are clicked", () => {
    render(
      <GameProvider>
        <ItalianNumbersGame />
      </GameProvider>,
    )

    // Initially, easy should be selected
    const easyButton = screen.getByText(/1-20/i)
    const mediumButton = screen.getByText(/1-100/i)
    const hardButton = screen.getByText(/1-1000/i)

    expect(easyButton).toHaveClass("bg-primary")

    // Click medium
    fireEvent.click(mediumButton)
    expect(mediumButton).toHaveClass("bg-primary")
    expect(easyButton).not.toHaveClass("bg-primary")

    // Click hard
    fireEvent.click(hardButton)
    expect(hardButton).toHaveClass("bg-primary")
    expect(mediumButton).not.toHaveClass("bg-primary")
  })
})

