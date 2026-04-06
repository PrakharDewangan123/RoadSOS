import { Shield, MapPin, Clock, Users } from "lucide-react";
import { motion } from "motion/react";

export function SafetyStats() {
  const stats = [
    {
      id: "1",
      icon: <Shield size={24} />,
      value: "100%",
      label: "Protected",
      color: "from-green-500 to-green-600",
    },
    {
      id: "2",
      icon: <MapPin size={24} />,
      value: "24/7",
      label: "Tracking",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "3",
      icon: <Clock size={24} />,
      value: "< 2s",
      label: "Response",
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "4",
      icon: <Users size={24} />,
      value: "3",
      label: "Contacts",
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs opacity-90">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
