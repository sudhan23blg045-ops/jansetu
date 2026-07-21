"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function VoiceGuide() {
  const pathname = usePathname();
  const { t, language } = useTranslation();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setHasMounted(true);
    const storedPref = localStorage.getItem("jansetu_voice_guide");
    if (storedPref === "enabled") {
      setIsEnabled(true);
    }
  }, []);

  const getVoiceKey = (path: string) => {
    if (path === "/") return "voice.home";
    if (path.startsWith("/schemes")) return "voice.schemes";
    if (path.startsWith("/nomadic-communities")) return "voice.communities";
    if (path.startsWith("/ngos")) return "voice.ngos";
    if (path.startsWith("/livelihoods")) return "voice.livelihoods";
    if (path.startsWith("/resources")) return "voice.resources";
    if (path === "/applications/new") return "voice.applications_new";
    if (path.startsWith("/applications")) return "voice.applications";
    if (path.startsWith("/volunteer")) return "voice.volunteer";
    if (path.startsWith("/contact")) return "voice.contact";
    return "voice.default";
  };

  const getLangTag = (lang: string) => {
    const map: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      te: "te-IN"
    };
    return map[lang] || "en-US";
  };

  // Stop currently playing audio on route change
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
    
    // Auto-play on route change if enabled
    if (isEnabled && hasMounted && !isMuted) {
      // Small timeout to allow page translation to render
      setTimeout(() => {
        play();
      }, 500);
    }
  }, [pathname, isEnabled]);

  // Handle language change mid-playback
  useEffect(() => {
    if (isPlaying && hasMounted) {
      stop();
      setTimeout(play, 200);
    }
  }, [language]);

  const toggleEnable = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem("jansetu_voice_guide", newState ? "enabled" : "disabled");
    
    if (newState) {
      toast.success("Voice Guide Enabled");
      if (!isMuted) play();
    } else {
      stop();
      toast.info("Voice Guide Disabled");
    }
  };

  const play = () => {
    if (typeof window === "undefined" || !window.speechSynthesis || isMuted) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const key = getVoiceKey(pathname);
    const textToSpeak = t(key);
    
    // Fallback if translation key is missing or same as key
    if (textToSpeak === key) return; 

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = getLangTag(language);
    
    // Try to find a voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || 
                        voices.find(v => v.default);
                        
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stop();
    } else if (isEnabled) {
      play();
    }
  };

  // Ensure getVoices is triggered on load (Chrome quirk)
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  if (!hasMounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10 shrink-0 ${isEnabled ? 'text-primary' : 'text-muted-foreground'} ${isPlaying && !isPaused ? 'animate-pulse' : ''}`}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        <span className="sr-only">Voice Guide Controls</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sahayak Voice Guide</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={toggleEnable} className="justify-between cursor-pointer">
          {isEnabled ? "Disable Voice Guide" : "Enable Voice Guide"}
          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="flex justify-between items-center px-2 py-2 gap-1">
          <Button 
            variant={isPlaying && !isPaused ? "secondary" : "ghost"} 
            size="icon" 
            onClick={play} 
            disabled={!isEnabled || isMuted || (isPlaying && !isPaused)}
            title="Play"
          >
            <Play className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={isPaused ? "secondary" : "ghost"} 
            size="icon" 
            onClick={pause} 
            disabled={!isEnabled || isMuted || (!isPlaying && !isPaused)}
            title="Pause"
          >
            <Pause className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={stop} 
            disabled={!isEnabled || isMuted || (!isPlaying && !isPaused)}
            title="Stop"
          >
            <Square className="h-4 w-4" />
          </Button>
          
          <Button 
            variant={isMuted ? "secondary" : "ghost"} 
            size="icon" 
            onClick={toggleMute}
            title={isMuted ? "Unmute" : "Mute"}
          >
            <VolumeX className="h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
