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
          className="w-full bg-[#2d3645] text-white placeholder:text-[#8592a3] px-3 py-2.5 rounded-lg border border-[#3d4757] focus:outline-none focus:border-[#6b4ce6] transition-colors text-sm caret-white"
        />
        {error && (
          <p className="text-xs text-red-400 px-1">{error}</p>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="w-full bg-[#0084ff] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonText}
        </button>
      </div>
    </form>
  )
}
