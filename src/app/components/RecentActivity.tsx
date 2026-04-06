import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  MapPin,
  Phone,
  Camera,
  Volume2,
  Navigation,
  AlertTriangle,
  MessageCircle,
  Clock,
  X,
} from "lucide-react";

export interface Activity {
  id: string;
  type:
    | "sos"
    | "location"
    | "fake-call"
    | "record"
    | "alarm"
    | "safe-check"
    | "safe-route"
    | "chat";
  message: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: Activity[];
  onClearActivity?: (id: string) => void;
  onClearAll?: () => void;
}

export function RecentActivity({
  activities,
  onClearActivity,
  onClearAll,
}: RecentActivityProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    const iconProps = { size: 16 };
    switch (type) {
      case "sos":
        return <AlertTriangle {...iconProps} />;
      case "location":
        return <MapPin {...iconProps} />;
      case "fake-call":
        return <Phone {...iconProps} />;
      case "record":
        return <Camera {...iconProps} />;
      case "alarm":
        return <Volume2 {...iconProps} />;
      case "safe-check":
        return <Shield {...iconProps} />;
      case "safe-route":
        return <Navigation {...iconProps} />;
      case "chat":
        return <MessageCircle {...iconProps} />;
      default:
        return <Shield {...iconProps} />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "sos":
        return "bg-red-500";
      case "location":
        return "bg-green-500";
      case "fake-call":
        return "bg-blue-500";
      case "record":
        return "bg-red-500";
      case "alarm":
        return "bg-orange-500";
      case "safe-check":
        return "bg-green-500";
      case "safe-route":
        return "bg-teal-500";
      case "chat":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No recent activity</p>
          <p className="text-gray-400 text-xs mt-1">
            Your safety actions will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        {activities.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 hover:bg-gray-100 rounded"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.slice(0, 10).map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              className="group relative"
            >
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div
                  className={`w-8 h-8 rounded-full ${getActivityColor(
                    activity.type
                  )} flex items-center justify-center text-white flex-shrink-0`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>

                {onClearActivity && (
                  <button
                    onClick={() => onClearActivity(activity.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded flex-shrink-0"
                  >
                    <X size={14} className="text-gray-500" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activities.length > 10 && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Showing 10 of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  );
}
