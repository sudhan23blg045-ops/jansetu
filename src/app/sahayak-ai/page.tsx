"use client";

import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/sahayak-ai/LanguageSelector";
import { InputMethodSelector } from "@/components/sahayak-ai/InputMethodSelector";
import { ChatWindow } from "@/components/sahayak-ai/ChatWindow";
import { Message } from "@/components/sahayak-ai/MessageBubble";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Step = "language" | "method" | "chat";
type InputMethod = "text" | "voice";

const LANGUAGES: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
  ta: "தமிழ்",
  te: "తెలుగు",
  ml: "മലയാളം",
};

export default function SahayakAIPage() {
  const [step, setStep] = useState<Step>("language");
  const [language, setLanguage] = useState<string>("");
  const [inputMethod, setInputMethod] = useState<InputMethod>("text");
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome-1",
        content: t("ai.welcome"),
        isAi: true,
      }
    ]);
  }, [t]);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setStep("method");
  };

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    setStep("chat");
  };

  const handleChangeLanguage = () => {
    setStep("language");
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      content: content,
      isAi: false,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Map frontend messages to the format expected by our API, filtering out the welcome message
      const apiMessages = [...messages, userMsg]
        .filter((msg) => msg.id !== "welcome-1")
        .map((msg) => ({
          role: msg.isAi ? "assistant" : "user",
          content: msg.content as string, // Safe cast as we know it's a string from our inputs
        }));

      // Call our Next.js API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          languageCode: language,
        }),
      });

      let data;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Unable to connect to Mistral AI.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to connect to Mistral AI.");
      }

      const aiMsg: Message = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        content: data.content,
        isAi: true,
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: unknown) {
      console.error("Chat Error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorMsg: Message = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        content: errorMessage === "AI service is currently unconfigured (Missing API Key)." 
          ? "I'm sorry, but my AI services are currently unconfigured (Missing API Key). Please try again later."
          : "I'm having trouble connecting right now. Please try again later.",
        isAi: true,
      };
      
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionSelect = (actionTitle: string) => {
    handleSendMessage(`Tell me about ${actionTitle}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {step === "language" && (
        <LanguageSelector onSelect={handleLanguageSelect} />
      )}
      
      {step === "method" && (
        <InputMethodSelector onSelect={handleMethodSelect} />
      )}
      
      {step === "chat" && (
        <ChatWindow 
          messages={messages}
          isTyping={isTyping}
          inputMethod={inputMethod}
          languageName={LANGUAGES[language] || language.toUpperCase()}
          languageCode={language}
          onSendMessage={handleSendMessage}
          onActionSelect={handleActionSelect}
          onChangeLanguage={handleChangeLanguage}
        />
      )}
    </div>
  );
}
