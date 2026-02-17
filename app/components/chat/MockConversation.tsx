import { ChatMessage } from './ChatMessage'

interface Message {
  type: 'ai' | 'user'
  text: string
  timestamp: string
}

interface MockConversationProps {
  title: string
  messages: Message[]
}

export function MockConversation({ title, messages }: MockConversationProps) {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 mt-3 mb-2">
      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#1e293b]">
        <div className="w-1.5 h-1.5 bg-[#0bcb6b] rounded-full"></div>
        <h4 className="font-medium text-[#cbd5e1] text-xs">{title}</h4>
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
