"use client"

import { useState } from "react"

interface ChatInputProps {
  placeholder: string
  onSubmit: (value: string) => void
  buttonText: string
  type?: 'email' | 'text'
  disabled?: boolean
}

export function ChatInput({
  placeholder,
  onSubmit,
  buttonText,
  type = 'text',
  disabled = false
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!value.trim()) {
      setError('This field is required')
      return
    }

    if (type === 'email' && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address')
      return
    }

    setError('')
    onSubmit(value)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError('')
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-secondary text-secondary-foreground placeholder:text-muted-foreground px-3 py-2.5 rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-colors text-sm"
        />
        {error && (
          <p className="text-xs text-destructive px-1">{error}</p>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </div>
    </form>
  )
}
