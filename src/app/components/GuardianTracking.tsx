import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Users, MapPin, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";

interface Guardian {
  id: string;
  name: string;
  relationship: string;
  isTracking: boolean;
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  distance?: number;
}

interface GuardianTrackingProps {
  userLocation?: [number, number];
  onShareLocation?: (guardianId: string) => void;
}

export function GuardianTracking({ userLocation, onShareLocation }: GuardianTrackingProps) {
  const [guardians, setGuardians] = useState<Guardian[]>([
    {
      id: "1",
      name: "Mom",
      relationship: "Mother",
      isTracking: false,
    },
    {
      id: "2",
      name: "Sarah",
      relationship: "Best Friend",
      isTracking: false,
    },
  ]);

  const [sharingLocation, setSharingLocation] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleToggleTracking = (guardianId: string) => {
    setGuardians((prev) =>
      prev.map((g) => {
        if (g.id === guardianId) {
          const newTracking = !g.isTracking;
          
          if (newTracking) {
            toast.success(`🔗 Connected with ${g.name}`, {
              description: "You can now see each other's locations",
            });
            
            // Simulate receiving guardian's location
            setTimeout(() => {
              setGuardians((current) =>
                current.map((guardian) =>
                  guardian.id === guardianId
                    ? {
                        ...guardian,
                        lastLocation: {
                          lat: 40.7580 + Math.random() * 0.01,
                          lng: -73.9855 + Math.random() * 0.01,
                          timestamp: new Date(),
                        },
                      }
                    : guardian
                )
              );
            }, 1000);
          } else {
            toast.info(`Stopped tracking ${g.name}`);
          }

          return { ...g, isTracking: newTracking };
        }
        return g;
      })
    );
  };

  const handleShareWithAll = () => {
    if (!userLocation) {
      toast.error("Location not available");
      return;
    }

    setSharingLocation(true);
    toast.success("📍 Location shared with all guardians", {
      description: `Shared with ${guardians.length} guardians`,
    });

    setTimeout(() => {
      setSharingLocation(false);
    }, 2000);
  };

  // Update distances when user location changes
  useEffect(() => {
    if (!userLocation) return;

    setGuardians((prev) =>
      prev.map((g) => {
        if (g.lastLocation && g.isTracking) {
          const distance = calculateDistance(
            userLocation[0],
            userLocation[1],
            g.lastLocation.lat,
            g.lastLocation.lng
          );
          return { ...g, distance };
        }
        return g;
      })
    );
  }, [userLocation]);

  const activeGuardians = guardians.filter((g) => g.isTracking).length;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Guardian Network</h3>
            <p className="text-xs text-gray-600">
              {activeGuardians} {activeGuardians === 1 ? "guardian" : "guardians"} tracking
            </p>
          </div>
          <Button
            onClick={handleShareWithAll}
            disabled={!userLocation || sharingLocation || activeGuardians === 0}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {sharingLocation ? "Sharing..." : "Share Location"}
          </Button>
        </div>

        <div className="space-y-3">
          {guardians.map((guardian) => (
            <div
              key={guardian.id}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{guardian.name}</p>
                    <p className="text-xs text-gray-600">{guardian.relationship}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {guardian.isTracking ? (
                    <Badge className="bg-green-500">Tracking</Badge>
                  ) : (
                    <Badge variant="outline">Offline</Badge>
                  )}
                  <Button
                    onClick={() => handleToggleTracking(guardian.id)}
                    variant={guardian.isTracking ? "destructive" : "outline"}
                    size="sm"
                  >
                    {guardian.isTracking ? "Stop" : "Track"}
                  </Button>
                </div>
              </div>

              {guardian.isTracking && guardian.lastLocation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {guardian.lastLocation.lat.toFixed(4)}, {guardian.lastLocation.lng.toFixed(4)}
                    </div>
                    {guardian.distance && (
                      <div className="flex items-center gap-1">
                        <span>📏</span>
                        {guardian.distance.toFixed(2)} km away
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3" />
                    Last updated: {new Date(guardian.lastLocation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How Guardian Tracking Works</p>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-xs">
              <li>Enable tracking with trusted guardians (family/friends)</li>
              <li>See each other's real-time locations on the map</li>
              <li>Get distance updates and proximity alerts</li>
              <li>Share your location instantly with all guardians</li>
              <li>Guardians receive SOS alerts automatically</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
