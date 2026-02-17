"use client"

import { useState, useEffect } from "react"
import { ManychatLogo } from "./ManychatLogo"

interface Step {
  id: number
  text: string
  duration: number
}

const steps: Step[] = [
  { id: 1, text: "Scanning your Instagram bio...", duration: 7000 },
  { id: 2, text: "Analyzing your Instagram posts...", duration: 7000 },
  { id: 3, text: "Reading your Instagram messages...", duration: 8000 },
  { id: 4, text: "Setting up your AI assistant...", duration: 8000 },
]

export function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (currentStep >= steps.length) return

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep((prev) => prev + 1)
    }, steps[currentStep].duration)

    return () => clearTimeout(timer)
  }, [currentStep])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background">
      <div className="text-center max-w-[480px]">
        <div className="w-16 h-16 mx-auto mb-8 animate-pulse">
          <ManychatLogo className="w-full h-full" color="var(--foreground)" />
        </div>

        <h2 className="text-[28px] font-bold text-foreground mb-12">
          Getting your AI ready...
        </h2>

        <div className="flex flex-col gap-6 max-w-[400px] mx-auto">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index)
            const isActive = currentStep === index
            const isVisible = index <= currentStep

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 text-left transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-full h-full rounded-full bg-chart-1 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 12 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 5L4.5 8.5L11 1.5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : isActive ? (
                    <div className="w-full h-full rounded-full bg-primary animate-pulse" />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-border" />
                  )}
                </div>
                <div
                  className={`text-base font-medium ${
                    isVisible ? "text-foreground" : "text-muted-foreground"
                  } ${isCompleted ? "font-semibold" : ""}`}
                >
                  {step.text}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
