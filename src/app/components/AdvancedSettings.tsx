import { useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { VoiceSOSControl, VoiceSOSDetection } from "./VoiceSOSDetection";
import { ShakeDetectionControl, ShakeDetection } from "./ShakeDetection";
import { SOSLogs } from "./SOSLogs";
import { ActivityLogs } from "./ActivityLogs";
import { GuardianTracking } from "./GuardianTracking";
import { PoliceHelpline } from "./PoliceHelpline";

interface AdvancedSettingsProps {
  userLocation?: [number, number];
  onSOSTriggered: (type: "voice" | "shake") => void;
}

export function AdvancedSettings({ userLocation, onSOSTriggered }: AdvancedSettingsProps) {
  const [voiceSOSEnabled, setVoiceSOSEnabled] = useState(false);
  const [shakeSOSEnabled, setShakeSOSEnabled] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Emergency Features</h2>
        <p className="text-sm text-gray-600">Enhanced protection with voice detection, shake alerts, and guardian tracking</p>
      </div>

      <Tabs defaultValue="detection" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
          <TabsTrigger value="helplines">Helplines</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="detection" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto SOS Detection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enable automatic SOS triggers for hands-free emergency alerts
            </p>

            <div className="space-y-3">
              {/* Voice SOS */}
              <VoiceSOSControl
                enabled={voiceSOSEnabled}
                onToggle={(enabled) => {
                  setVoiceSOSEnabled(enabled);
                  if (enabled) {
                    onSOSTriggered("voice");
                  }
                }}
              />
              <VoiceSOSDetection
                enabled={voiceSOSEnabled}
                onSOSDetected={() => onSOSTriggered("voice")}
              />

              {/* Shake SOS */}
              <ShakeDetectionControl
                enabled={shakeSOSEnabled}
                onToggle={(enabled) => {
                  setShakeSOSEnabled(enabled);
                }}
              />
              <ShakeDetection
                enabled={shakeSOSEnabled}
                onShakeDetected={() => onSOSTriggered("shake")}
              />
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">🛡️ How Auto-Detection Works</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-blue-800">
                <li><strong>Voice SOS:</strong> Say "help", "emergency", or "SOS" to trigger alert</li>
                <li><strong>Shake SOS:</strong> Shake your phone 3 times rapidly to activate</li>
                <li>Both methods work even when screen is locked</li>
                <li>Immediate notification to all emergency contacts</li>
                <li>Location automatically shared with alerts</li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="guardians" className="space-y-4">
          <GuardianTracking
            userLocation={userLocation}
            onShareLocation={(guardianId) => {
              console.log(`Shared location with guardian: ${guardianId}`);
            }}
          />
        </TabsContent>

        <TabsContent value="helplines" className="space-y-4">
          <PoliceHelpline userLocation={userLocation} />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <SOSLogs />
          <ActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
