import React, { useState } from "react";
import { Shield, Phone, Map, Settings, User } from "lucide-react";

import { SOSButton } from "./components/SOSButton";
import { QuickActions } from "./components/QuickActions";
import { EmergencyContacts } from "./components/EmergencyContacts";
import { SafetyStats } from "./components/SafetyStats";
import { RecentActivity, Activity } from "./components/RecentActivity";
import { SafeMap } from "./components/SafeMap";
import { GuardianTracking } from "./components/GuardianTracking";
import { PoliceHelpline } from "./components/PoliceHelpline";
import { AdvancedSettings } from "./components/AdvancedSettings";

import { toast, Toaster } from "sonner";

type Tab = "home" | "contacts" | "map" | "profile";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Activity logger
  const addActivity = (type: Activity["type"], message: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // SOS
  const handleSOSActivate = () => {
    toast.error("🚨 SOS ALERT ACTIVATED!");
    addActivity("sos", "Emergency SOS triggered");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);

        window.open(`https://maps.google.com/?q=${lat},${lng}`);
      });
    }
  };

  // Share Location
  const shareLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setUserLocation([lat, lng]);

      navigator.clipboard.writeText(`https://maps.google.com/?q=${lat},${lng}`);
      toast.success("📍 Location copied!");
    });
  };

  // 🚨 Accident Mode (STEP 10 ADDED)
  const handleAccidentMode = () => {
    toast.error("🚨 Accident detected! Activating emergency mode...");

    // SOS
    handleSOSActivate();

    // Location + hospitals
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setUserLocation([lat, lng]);

        window.open(
          `https://maps.google.com/search/hospitals+near+me/@${lat},${lng},15z`
        );
      });
    }

    addActivity("sos", "🚨 Accident Mode activated");
  };

  // Quick Actions (STEP 4 UPDATED)
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "hospital":
        window.open("https://maps.google.com/search/hospitals+near+me");
        break;
      case "police":
        window.open("https://maps.google.com/search/police+station+near+me");
        break;
      case "repair":
        window.open("https://maps.google.com/search/vehicle+repair+near+me");
        break;
      case "share-location":
        shareLocation();
        break;
    }
  };

  const tabs = [
    { id: "home" as Tab, icon: <Shield size={24} />, label: "Home" },
    { id: "contacts" as Tab, icon: <Phone size={24} />, label: "Contacts" },
    { id: "map" as Tab, icon: <Map size={24} />, label: "Map" },
    { id: "profile" as Tab, icon: <User size={24} />, label: "Profile" },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />

      {/* HEADER */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">🚨 RoadSoS</h1>
          <p className="text-xs text-gray-500">
            Smart Road Accident Emergency System
          </p>
        </div>

        <button onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
          <Settings />
        </button>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-4">
        {showAdvancedSettings ? (
          <AdvancedSettings
            userLocation={userLocation || undefined}
            onSOSTriggered={handleSOSActivate}
          />
        ) : (
          <>
            {/* HOME */}
            {activeTab === "home" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <SOSButton onActivate={handleSOSActivate} />

                  {/* 🚨 Accident Mode Button */}
                  <button
                    onClick={handleAccidentMode}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4"
                  >
                    🚨 Accident Mode
                  </button>
                </div>

                <SafetyStats />

                <QuickActions onAction={handleQuickAction} />

                <RecentActivity activities={activities} />
              </div>
            )}

            {/* CONTACTS */}
            {activeTab === "contacts" && <EmergencyContacts />}

            {/* MAP */}
            {activeTab === "map" && (
              <SafeMap
                onLocationShare={(loc: [number, number]) => {
                 setUserLocation(loc);
                }}
              />
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <GuardianTracking userLocation={userLocation || undefined} />
                <PoliceHelpline userLocation={userLocation || undefined} />
              </div>
            )}
          </>
        )}
      </main>

      {/* NAV */}
      <nav className="bg-white border-t flex justify-around p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center ${
              activeTab === tab.id ? "text-blue-600" : "text-gray-500"
            }`}
          >
            {tab.icon}
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}