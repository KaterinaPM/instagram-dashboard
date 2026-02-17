interface ChatMessageProps {
  text: string
  type: 'ai' | 'user'
  timestamp?: string
  isTyping?: boolean
}

export function ChatMessage({ text, type, timestamp, isTyping = false }: ChatMessageProps) {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-3 animate-fadeIn`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
          type === 'ai'
            ? 'bg-secondary text-secondary-foreground rounded-bl-md'
            : 'bg-primary text-primary-foreground rounded-br-md'
        }`}
      >
        {isTyping ? (
          <div className="flex gap-1 py-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed">{text}</p>
            {timestamp && (
              <p className="text-xs opacity-60 mt-1">{timestamp}</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
