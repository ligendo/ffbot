'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  initDataUnsafe: {
    user?: {
      id: number;
    };
  };
  MainButton: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
}

const useTelegramWebApp = (): TelegramWebApp | null => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Telegram' in window && 'WebApp' in (window as any).Telegram) {
      setWebApp((window as any).Telegram.WebApp)
    }
  }, [])

  return webApp
}

export default function FeniksFinanceTapGame() {
  const [count, setCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [totalTaps, setTotalTaps] = useState(0)
  const webApp = useTelegramWebApp()
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    if (webApp) {
      webApp.ready()
      webApp.expand()
      webApp.MainButton.setText('Start Game')
      webApp.MainButton.show()
      webApp.MainButton.onClick(startGame)

      // Set user ID and load user data
      const user = webApp.initDataUnsafe.user
      if (user) {
        setUserId(user.id)
        const userData = loadUserData(user.id)
        setHighScore(userData.highScore)
        setTotalTaps(userData.totalTaps)
      }

      return () => {
        webApp.MainButton.offClick(startGame)
      }
    }
  }, [webApp])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0) {
      endGame()
    }
    return () => clearTimeout(timer)
  }, [isPlaying, timeLeft])

  const loadUserData = (userId: number) => {
    const storedData = localStorage.getItem(`userData_${userId}`)
    if (storedData) {
      return JSON.parse(storedData)
    }
    return { highScore: 0, totalTaps: 0 }
  }

  const saveUserData = (userId: number, highScore: number, totalTaps: number) => {
    localStorage.setItem(`userData_${userId}`, JSON.stringify({ highScore, totalTaps }))
  }

  const startGame = () => {
    setCount(0)
    setTimeLeft(10)
    setIsPlaying(true)
    if (webApp) {
      webApp.MainButton.hide()
    }
  }

  const endGame = () => {
    setIsPlaying(false)
    if (userId) {
      const newTotalTaps = totalTaps + count
      setTotalTaps(newTotalTaps)
      if (count > highScore) {
        setHighScore(count)
        saveUserData(userId, count, newTotalTaps)
      } else {
        saveUserData(userId, highScore, newTotalTaps)
      }
    }
    if (webApp) {
      webApp.MainButton.setText('Play Again')
      webApp.MainButton.show()
    }
  }

  const handleTap = () => {
    if (isPlaying) {
      setCount(count + 1)
    }
  }

  return (
    <div className="min-h-screen w-full bg-cover bg-center" style={{ backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6973-pGlCSWVwvU7rgKiUL0mdJZPpUdCKH1.png')" }}>
      <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-orange-500">Feniks Finance Tap Game</CardTitle>
          <CardDescription className="text-center text-orange-700">Tap as fast as you can!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="text-4xl font-bold text-orange-600">{count}</div>
          <Progress value={(timeLeft / 10) * 100} className="w-full" />
          <div className="text-lg text-orange-700">Time left: {timeLeft}s</div>
          <button 
            onClick={handleTap} 
            disabled={!isPlaying}
            className="w-48 h-48 rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-orange-500 transition-transform transform active:scale-95"
            style={{ 
              backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6972-s3NOhCXopUX2KBbS7GR9Hm6DqFDwz8.jpeg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <span className="sr-only">Tap</span>
          </button>
          <div className="text-lg text-orange-700">High Score: {highScore}</div>
          <div className="text-lg text-orange-700">Total Taps: {totalTaps}</div>
          {!webApp && !isPlaying && (
            <button 
              onClick={startGame} 
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              Start Game
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
