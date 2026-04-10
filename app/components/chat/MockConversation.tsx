import { ChatMessage } from './ChatMessage'

interface Message {
  type: string  // accepts 'ai' | 'user' from JSON (TypeScript infers string from JSON imports)
  text: string
  timestamp: string
}

interface MockConversationProps {
  title: string
  messages: Message[]
}

export function MockConversation({ title, messages }: MockConversationProps) {
  return (
    <div className="bg-secondary border border-border rounded-xl p-3 mt-3 mb-2">
      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-border">
        <div className="w-1.5 h-1.5 bg-chart-1 rounded-full"></div>
        <h4 className="font-medium text-muted-foreground text-xs">{title}</h4>
      </div>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            text={message.text}
            type={message.type}
            timestamp={message.timestamp}
          />
        ))}
      </div>
    </div>
  )
}
