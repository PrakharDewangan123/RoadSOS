import React from "react";
import { MapPin, Phone, Navigation } from "lucide-react";
import { motion } from "motion/react";

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
}

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: "hospital",
      icon: <MapPin size={24} />,
      label: "Hospital",
      color: "from-red-500 to-red-600",
      action: () => onAction("hospital"),
    },
    {
      id: "police",
      icon: <Phone size={24} />,
      label: "Police",
      color: "from-blue-500 to-blue-600",
      action: () => onAction("police"),
    },
    {
      id: "repair",
      icon: <Navigation size={24} />,
      label: "Repair",
      color: "from-yellow-500 to-yellow-600",
      action: () => onAction("repair"),
    },
    {
      id: "share-location",
      icon: <MapPin size={24} />,
      label: "Share Location",
      color: "from-green-500 to-green-600",
      action: () => onAction("share-location"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={action.action}
          className={`flex flex-col items-center justify-center p-4 rounded-xl text-white bg-gradient-to-br ${action.color} shadow-md hover:scale-105 transition`}
        >
          {action.icon}
          <span className="text-sm mt-2">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}