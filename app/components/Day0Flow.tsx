"use client"

import { useState, useEffect, useRef } from "react"
import { ChatMessage } from "./chat/ChatMessage"
import { ChatInput } from "./chat/ChatInput"
import { GoalOption } from "./chat/GoalOption"
import { ActionButtons } from "./chat/ActionButtons"
import { MockConversation } from "./chat/MockConversation"
import { InsightCard } from "./chat/InsightCard"
import { ManychatLogo } from "./ManychatLogo"
import content from "@/content/day0-content.json"

type Step =
  | 'welcome'
  | 'email'
  | 'instagram'
  | 'loading'
  | 'goal-question'
  | 'insights'
  | 'goal-suggestions'
  | 'setup-complete'

interface Message {
  id: string
  text: string
  type: 'ai' | 'user'
  timestamp?: string
}

export function Day0Flow() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<Step>('welcome')
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [selectedGoal, setSelectedGoal] = useState('')
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
  const [approvedGoals, setApprovedGoals] = useState<string[]>([])
  const [showInput, setShowInput] = useState(false)
  const [showGoalOptions, setShowGoalOptions] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [showCurrentSuggestion, setShowCurrentSuggestion] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, showInput, showGoalOptions, showInsights, showCurrentSuggestion])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Start welcome sequence only after component is mounted
      showWelcomeMessages()
    }
  }, [mounted])

  const addMessage = (text: string, type: 'ai' | 'user', id?: string) => {
    setMessages((prev) => [...prev, { id: id || `msg-${Date.now()}`, text, type }])
  }

  const showMessagesWithDelay = async (messageList: Array<{ id: string; text: string; delay: number }>) => {
    for (const msg of messageList) {
      setIsTyping(true)
      await new Promise((resolve) => setTimeout(resolve, msg.delay))
      setIsTyping(false)
      addMessage(msg.text, 'ai', msg.id)
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  const showWelcomeMessages = async () => {
    await showMessagesWithDelay(content.onboarding.welcome.messages)
    await new Promise((resolve) => setTimeout(resolve, 500))
    addMessage(content.onboarding.emailCollection.message, 'ai')
    setShowInput(true)
    setStep('email')
  }

  const handleEmailSubmit = async (email: string) => {
    setUserEmail(email)
    addMessage(email, 'user')
    setShowInput(false)

    await new Promise((resolve) => setTimeout(resolve, 800))
    await showMessagesWithDelay(content.onboarding.instagramConnection.messages)
    setStep('instagram')
  }

  const handleInstagramConnect = async () => {
    addMessage('Connect Instagram', 'user')
    setStep('loading')

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show goal question during loading
    addMessage(content.loading.goalQuestion.message, 'ai')
    setShowGoalOptions(true)
  }

  const handleGoalSelect = async (goalId: string) => {
    const selectedGoalOption = content.loading.goalQuestion.options.find(opt => opt.id === goalId)
    if (selectedGoalOption) {
      addMessage(selectedGoalOption.label, 'user')
      setSelectedGoal(goalId)
      setShowGoalOptions(false)

      // Continue loading simulation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Show insights
      await showMessagesWithDelay(content.insights.intro.messages)
      setShowInsights(true)

      await new Promise((resolve) => setTimeout(resolve, 2000))
      addMessage(content.insights.transition.message, 'ai')

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep('goal-suggestions')
      showNextSuggestion()
    }
  }

  const showNextSuggestion = async () => {
    if (currentSuggestionIndex >= content.goalSuggestions.length) {
      // All suggestions shown, move to completion
      await showSetupComplete()
      return
    }

    const suggestion = content.goalSuggestions[currentSuggestionIndex]

    await new Promise((resolve) => setTimeout(resolve, 500))
    addMessage(suggestion.question, 'ai')
    setShowCurrentSuggestion(true)
  }

  const handleSuggestionAction = async (action: string) => {
    const suggestion = content.goalSuggestions[currentSuggestionIndex]
    addMessage(action, 'user')
    setShowCurrentSuggestion(false)

    if (action.toLowerCase().includes('approve') || action.toLowerCase().includes('yes')) {
      setApprovedGoals([...approvedGoals, suggestion.id])
      await new Promise((resolve) => setTimeout(resolve, 500))
      addMessage(`Great! I've set up "${suggestion.title}" for you. ✓`, 'ai')
    } else if (action.toLowerCase().includes('edit')) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      addMessage("No problem! You can customize this later in settings.", 'ai')
    }

    await new Promise((resolve) => setTimeout(resolve, 800))
    setCurrentSuggestionIndex((prev) => prev + 1)

    // Show next suggestion or complete setup
    if (currentSuggestionIndex + 1 >= content.goalSuggestions.length) {
      await showSetupComplete()
    } else {
      showNextSuggestion()
    }
  }

  const showSetupComplete = async () => {
    setStep('setup-complete')
    await showMessagesWithDelay(content.setupComplete.messages)
    await new Promise((resolve) => setTimeout(resolve, 500))
    addMessage(content.setupComplete.notification.question, 'ai')
  }

  const handleNotificationChoice = async (choice: string) => {
    const option = content.setupComplete.notification.options.find(opt => opt.id === choice)
    if (option) {
      addMessage(option.label, 'user')
      await new Promise((resolve) => setTimeout(resolve, 800))
      addMessage(content.setupComplete.finalMessage.text, 'ai')
    }
  }

  const currentSuggestion = content.goalSuggestions[currentSuggestionIndex]

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-[760px] w-[380px] bg-[#2d3645] rounded-[48px] p-3 shadow-2xl">
          <div className="bg-[#232b39] rounded-[36px] h-full flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[#3d4757]">
              <ManychatLogo className="w-10 h-10" color="#6b4ce6" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-semibold text-sm">Manychat AI</span>
                  <div className="w-1.5 h-1.5 bg-[#0bcb6b] rounded-full"></div>
                </div>
                <div className="text-[#8592a3] text-xs">Setting up your account...</div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <ManychatLogo className="w-12 h-12 opacity-20" color="#8592a3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Phone Mockup Container */}
      <div className="h-[760px] w-[380px] bg-[#2d3645] rounded-[48px] p-3 shadow-2xl">
        <div className="bg-[#232b39] rounded-[36px] h-full flex flex-col relative overflow-hidden">

          {/* Phone Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-[#3d4757]">
            <ManychatLogo className="w-10 h-10" color="#6b4ce6" />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-white font-semibold text-sm">Manychat AI</span>
                <div className="w-1.5 h-1.5 bg-[#0bcb6b] rounded-full"></div>
              </div>
              <div className="text-[#8592a3] text-xs">Setting up your account...</div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ManychatLogo className="w-12 h-12 mx-auto mb-4 opacity-20" color="#8592a3" />
                  <p className="text-[#8592a3] text-sm px-8">
                    Ask me anything your followers might ask you
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    text={message.text}
                    type={message.type}
                    timestamp={message.timestamp}
                  />
                ))}

                {isTyping && <ChatMessage text="" type="ai" isTyping />}

                {showInsights && (
                  <div className="animate-fadeIn">
                    <InsightCard metrics={content.insights.metrics} />
                  </div>
                )}

                {showCurrentSuggestion && currentSuggestion && (
                  <div className="animate-fadeIn mt-4">
                    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4">
                      <h3 className="font-semibold text-white text-sm mb-2">
                        {currentSuggestion.title}
                      </h3>
                      <p className="text-xs text-[#8592a3] mb-3">
                        {currentSuggestion.description}
                      </p>
                      <div className="space-y-1.5 mb-3">
                        {currentSuggestion.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs text-[#cbd5e1]">
                            <span className="text-[#0bcb6b] mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <MockConversation
                        title={currentSuggestion.mockConversation.title}
                        messages={currentSuggestion.mockConversation.messages}
                      />
                      <ActionButtons
                        actions={currentSuggestion.actions}
                        onAction={handleSuggestionAction}
                      />
                    </div>
                  </div>
                )}

                {showGoalOptions && (
                  <div className="space-y-2.5 mt-4 animate-fadeIn">
                    {content.loading.goalQuestion.options.map((option) => (
                      <GoalOption
                        key={option.id}
                        label={option.label}
                        icon={option.icon}
                        description={option.description}
                        onClick={() => handleGoalSelect(option.id)}
                      />
                    ))}
                  </div>
                )}

                {step === 'setup-complete' && !showGoalOptions && !showCurrentSuggestion && (
                  <div className="flex flex-col gap-2 mt-4 animate-fadeIn">
                    {content.setupComplete.notification.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleNotificationChoice(option.id)}
                        className="w-full bg-[#6b4ce6] text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-[#5a3cc5] transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          {showInput && step === 'email' && (
            <div className="px-4 py-3 border-t border-[#3d4757]">
              <ChatInput
                placeholder={content.onboarding.emailCollection.placeholder}
                onSubmit={handleEmailSubmit}
                buttonText={content.onboarding.emailCollection.button}
                type="email"
              />
            </div>
          )}

          {step === 'instagram' && (
            <div className="px-4 py-3 border-t border-[#3d4757]">
              <button
                onClick={handleInstagramConnect}
                className="w-full bg-[#0084ff] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="6" r="1" fill="currentColor"/>
                </svg>
                {content.onboarding.instagramConnection.button}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
