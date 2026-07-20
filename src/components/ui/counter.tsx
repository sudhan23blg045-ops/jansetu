"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface CounterProps {
  value: number;
  suffix?: string;
}

export function Counter({ value, suffix = "" }: CounterProps) {
  const [hasInView, setHasInView] = useState(false);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    duration: 2000
  });
  
  const rounded = useTransform(springValue, (latest) => Math.round(latest));
  
  useEffect(() => {
    if (hasInView) {
      motionValue.set(value);
    }
  }, [hasInView, value, motionValue]);

  return (
    <motion.span
      onViewportEnter={() => setHasInView(true)}
      viewport={{ once: true, margin: "-100px" }}
    >
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  );
}
