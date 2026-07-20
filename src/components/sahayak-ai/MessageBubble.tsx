import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface Message {
  id: string;
  content: string | React.ReactNode;
  isAi: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean;
}

const parseMarkdownLinks = (content: string | React.ReactNode) => {
  if (typeof content !== "string") return content;
  
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
    }
    const linkText = match[1];
    const linkUrl = match[2];
    
    if (linkText.includes("Apply with Jansetu")) {
      parts.push(
        <div key={`btn-${match.index}`} className="my-3">
          <Link href={linkUrl}>
            <Button size="sm" className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90 font-semibold flex gap-2 items-center">
              {linkText}
            </Button>
          </Link>
        </div>
      );
    } else {
      parts.push(
        <a key={`link-${match.index}`} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
          {linkText}
        </a>
      );
    }
    
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < content.length) {
    parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
  }
  
  return parts.length > 0 ? <>{parts}</> : content;
};

export function MessageBubble({ message, isTyping }: MessageBubbleProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex gap-3 w-full ${message.isAi ? "" : "flex-row-reverse"}`}
    >
      <div 
        className={`p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 shadow-sm ${
          message.isAi ? "bg-primary/10 text-primary" : "bg-primary text-primary-foreground"
        }`}
      >
        {message.isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div 
        className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-[0_4px_12px_rgba(0,0,0,0.04)] ${
          message.isAi 
            ? "bg-card border rounded-tl-sm text-card-foreground" 
            : "bg-primary text-primary-foreground rounded-tr-sm"
        }`}
      >
        {isTyping ? (
          <div className="flex gap-1 items-center h-5">
            <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-current rounded-full" />
            <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-current rounded-full" />
            <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-current rounded-full" />
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{parseMarkdownLinks(message.content)}</div>
        )}
      </div>
    </motion.div>
  );
}
