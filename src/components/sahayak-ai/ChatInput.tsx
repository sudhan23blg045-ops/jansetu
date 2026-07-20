import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

// Add TypeScript support for the Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

interface ChatInputProps {
  onSend: (message: string) => void;
  inputMethod: "text" | "voice";
  disabled?: boolean;
  languageCode: string;
}

export function ChatInput({ onSend, inputMethod, disabled, languageCode }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue((prev) => (prev ? prev + " " + transcript : transcript));
          setIsListening(false);
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Map language code to proper BCP 47 format for Speech API if needed
      // Most of our internal codes match the first part, but providing standard ones is safer
      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        kn: "kn-IN",
        ta: "ta-IN",
        te: "te-IN",
        ml: "ml-IN"
      };
      recognitionRef.current.lang = langMap[languageCode] || languageCode;
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start speech recognition", e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center bg-card p-4 border-t">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={
          isListening 
            ? "Listening..." 
            : inputMethod === 'voice' 
              ? "Tap the microphone to speak..." 
              : "Type your message here..."
        }
        className="flex-1 bg-background shadow-sm border-primary/20 focus-visible:ring-primary/30"
        disabled={disabled}
      />
      
      <div className="relative shrink-0">
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-400"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          />
        )}
        <Button 
          type="button" 
          onClick={handleMicClick}
          size="icon" 
          variant="outline" 
          className={`relative rounded-full h-10 w-10 shrink-0 transition-colors ${
            isListening 
              ? "bg-red-100 text-red-600 border-red-600" 
              : "text-primary border-primary hover:bg-primary/10 shadow-[0_2px_8px_rgba(22,163,74,0.1)]"
          }`}
          disabled={disabled}
          title={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          <span className="sr-only">Voice Input</span>
        </Button>
      </div>
      
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full h-10 w-10 shrink-0 shadow-[0_4px_12px_rgba(22,163,74,0.3)] hover:shadow-[0_6px_16px_rgba(22,163,74,0.4)] transition-shadow"
          disabled={disabled || !inputValue.trim()}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </motion.div>
    </form>
  );
}
