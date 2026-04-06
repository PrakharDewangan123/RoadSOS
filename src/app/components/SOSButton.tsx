import { AlertTriangle, Phone } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface SOSButtonProps {
  onActivate: () => void;
}

export function SOSButton({ onActivate }: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handlePressStart = () => {
    setIsPressed(true);
    let progress = 0;
    const timer = setInterval(() => {
      progress += 5;
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        onActivate();
        setHoldProgress(0);
        setIsPressed(false);
      }
    }, 50);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearInterval(pressTimer);
      setPressTimer(null);
    }
    setIsPressed(false);
    setHoldProgress(0);
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      <motion.button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-2xl flex items-center justify-center"
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: isPressed
            ? "0 0 0 0 rgba(239, 68, 68, 0.7)"
            : "0 0 0 10px rgba(239, 68, 68, 0)",
        }}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="8"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${2 * Math.PI * 88 * (1 - holdProgress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
        <div className="flex flex-col items-center gap-2 text-white z-10">
          <AlertTriangle size={48} />
          <span className="text-xl font-semibold">SOS</span>
        </div>
      </motion.button>
      <p className="text-sm text-gray-600 text-center max-w-xs">
        Hold for 2 seconds to activate emergency alert
      </p>
    </div>
  );
}
