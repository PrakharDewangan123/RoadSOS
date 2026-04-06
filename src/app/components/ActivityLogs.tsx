import { useEffect, useState } from "react";
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ActivityType =
  | "login"
  | "logout"
  | "sos"
  | "location"
  | "fake-call"
  | "record"
  | "alarm"
  | "safe-check"
  | "safe-route"
  | "chat";

export interface ActivityLog {
  id?: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
}

export async function logActivity(type: ActivityType, message: string) {
  try {
    await addDoc(collection(db, "activityLogs"), {
      type,
      message,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving activity log:", error);
  }
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsRef = collection(db, "activityLogs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ActivityLog[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            type: data.type,
            message: data.message,
            timestamp: data.timestamp?.toDate() || new Date(),
          });
        });
        setLogs(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching activity logs:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-600">Loading activity history...</p>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No activity yet</p>
          <p className="text-xs text-gray-600 mt-1">
            Your logins, SOS events, SOS alerts, location sharing, and emergency actions will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Full Activity Log</h3>
        <button
          onClick={() => {
            // simple viewer-only for now, avoiding destructive clear here
            toast.info("Activity is stored in Firebase under 'activityLogs' collection.");
          }}
          className="text-[11px] px-2 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Info
        </button>
      </div>
      <ScrollArea className="h-[260px]">
        <div className="space-y-2 text-xs">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between rounded-lg border border-gray-100 px-3 py-2 bg-white/80"
            >
              <div className="flex-1 pr-3">
                <p className="font-medium text-gray-900 capitalize">{log.type}</p>
                <p className="text-gray-600 mt-0.5">{log.message}</p>
              </div>
              <div className="flex flex-col items-end gap-1 text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{format(log.timestamp, "MMM dd, HH:mm")}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

