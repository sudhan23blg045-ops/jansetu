import { useEffect, useRef } from "react";
import { QuickActionGrid } from "./QuickActionGrid";
import { MessageBubble, Message } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  inputMethod: "text" | "voice";
  languageName: string;
  languageCode: string;
  onSendMessage: (msg: string) => void;
  onActionSelect: (action: string) => void;
  onChangeLanguage: () => void;
}

export function ChatWindow({ 
  messages, 
  isTyping, 
  inputMethod, 
  languageName, 
  languageCode,
  onSendMessage, 
  onActionSelect,
  onChangeLanguage 
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <Card className="flex flex-col h-full overflow-hidden border shadow-sm animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl">
            🤖
          </div>
          <div>
            <h2 className="font-bold tracking-tight">Sahayak AI</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Online
            </p>
          </div>
        </div>
        <button 
          onClick={onChangeLanguage}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-background px-3 py-1.5 rounded-md border shadow-sm"
        >
          <Globe className="h-4 w-4" />
          {languageName} ▼
        </button>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-muted/10 relative"
      >
        {messages.length === 1 && (
          <QuickActionGrid onActionSelect={onActionSelect} />
        )}
        
        <div className="space-y-6 flex flex-col justify-end min-h-full">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isTyping && (
            <MessageBubble 
              message={{ id: "typing", content: "", isAi: true }} 
              isTyping={true} 
            />
          )}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={onSendMessage} 
        inputMethod={inputMethod} 
        disabled={isTyping} 
        languageCode={languageCode}
      />
    </Card>
  );
}
