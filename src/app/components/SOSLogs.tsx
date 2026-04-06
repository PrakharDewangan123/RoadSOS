import { useEffect, useState } from "react";
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { AlertTriangle, MapPin, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export interface SOSLog {
  id?: string;
  type: "manual" | "voice" | "shake" | "panic";
  location?: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  userId?: string;
  contactsNotified?: number;
  status: "active" | "resolved" | "false-alarm";
  notes?: string;
}

interface SOSLogsProps {
  userId?: string;
}

export function SOSLogs({ userId = "demo-user" }: SOSLogsProps) {
  const [logs, setLogs] = useState<SOSLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      // Firebase not configured, use demo data
      setLogs([
        {
          id: "1",
          type: "manual",
          timestamp: new Date(Date.now() - 3600000),
          status: "resolved",
          contactsNotified: 3,
          location: { lat: 40.7580, lng: -73.9855 },
        },
        {
          id: "2",
          type: "shake",
          timestamp: new Date(Date.now() - 86400000),
          status: "false-alarm",
          contactsNotified: 3,
        },
      ]);
      setLoading(false);
      return;
    }

    // Subscribe to SOS logs from Firebase
    const logsRef = collection(db, "sosLogs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(20));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData: SOSLog[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          logsData.push({
            id: doc.id,
            type: data.type,
            location: data.location,
            timestamp: data.timestamp?.toDate() || new Date(),
            userId: data.userId,
            contactsNotified: data.contactsNotified,
            status: data.status,
            notes: data.notes,
          });
        });
        setLogs(logsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching SOS logs:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const getTypeIcon = (type: SOSLog["type"]) => {
    switch (type) {
      case "voice":
        return "🎤";
      case "shake":
        return "📱";
      case "panic":
        return "⚠️";
      default:
        return "🚨";
    }
  };

  const getStatusColor = (status: SOSLog["status"]) => {
    switch (status) {
      case "active":
        return "bg-red-500";
      case "resolved":
        return "bg-green-500";
      case "false-alarm":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-gray-600">Loading SOS logs...</p>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900">No SOS alerts yet</p>
          <p className="text-xs text-gray-600 mt-1">Your emergency history will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">SOS Alert History</h3>
        <button
          onClick={async () => {
            try {
              const snap = await getDocs(collection(db, "sosLogs"));
              const batchDeletes = snap.docs.map((doc) => deleteDoc(doc.ref));
              await Promise.all(batchDeletes);
              toast.success("All SOS logs cleared");
            } catch (err) {
              console.error("Error clearing SOS logs:", err);
              toast.error("Could not clear SOS logs");
            }
          }}
          className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Clear all
        </button>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(log.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {log.type} SOS
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <Clock className="h-3 w-3" />
                      {format(log.timestamp, "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(log.status)}>
                  {log.status}
                </Badge>
              </div>

              {log.location && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                  <MapPin className="h-3 w-3" />
                  Location: {log.location.lat.toFixed(4)}, {log.location.lng.toFixed(4)}
                </div>
              )}

              {log.contactsNotified && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <User className="h-3 w-3" />
                  {log.contactsNotified} contacts notified
                </div>
              )}

              {log.notes && (
                <p className="text-xs text-gray-600 mt-2 italic">{log.notes}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

// Function to add SOS log to Firebase
export async function addSOSLog(log: Omit<SOSLog, "id" | "timestamp">) {
  try {
    const docRef = await addDoc(collection(db, "sosLogs"), {
      type: log.type,
      status: log.status,
      timestamp: Timestamp.now(),
    });
    console.log("SOS log saved with ID:", docRef.id);
    toast.success("SOS event saved to history");
    return docRef.id;
  } catch (error) {
    console.error("Error saving SOS log:", error);
    toast.error("Could not save SOS log", {
      description: "Check Firestore rules and connection.",
    });
    return null;
  }
}
