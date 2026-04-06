import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Phone, MapPin, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

interface Helpline {
  country: string;
  emergency: string;
  police: string;
  ambulance: string;
}

const HELPLINES: Record<string, Helpline> = {
  IN: {
    country: "India",
    emergency: "112",
    police: "100",
    ambulance: "102",
  },
  US: {
    country: "United States",
    emergency: "911",
    police: "911",
    ambulance: "911",
  },
  UK: {
    country: "United Kingdom",
    emergency: "999",
    police: "101",
    ambulance: "999",
  },
  CA: {
    country: "Canada",
    emergency: "911",
    police: "911",
    ambulance: "911",
  },
  AU: {
    country: "Australia",
    emergency: "000",
    police: "000",
    ambulance: "000",
  },
};

interface PoliceHelplineProps {
  userLocation?: [number, number];
}

export function PoliceHelpline({ userLocation }: PoliceHelplineProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("IN");
  const [calling, setCalling] = useState<string | null>(null);

  const helpline = HELPLINES[selectedCountry];

  const handleCall = (number: string, type: string) => {
    setCalling(type);
    
    // Simulate call
    toast.warning(`📞 Calling ${type}`, {
      description: `Dialing ${number}...`,
      duration: 3000,
    });

    // In a real app, you would use:
    // window.location.href = `tel:${number}`;
    
    setTimeout(() => {
      setCalling(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Emergency Helplines</h3>
            <p className="text-xs text-gray-600">Quick access to local emergency services</p>
          </div>
        </div>

        {/* Country Selector */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-700 mb-2 block">Select Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
          >
            {Object.entries(HELPLINES).map(([code, data]) => (
              <option key={code} value={code}>
                {data.country}
              </option>
            ))}
          </select>
        </div>

        {/* Emergency Numbers */}
        <div className="space-y-3">
          {/* General Emergency */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-900">🚨 General Emergency</p>
                <p className="text-xl font-bold text-red-700 mt-1">{helpline.emergency}</p>
              </div>
              <Button
                onClick={() => handleCall(helpline.emergency, "Emergency")}
                disabled={calling === "Emergency"}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                {calling === "Emergency" ? "Calling..." : "Call"}
              </Button>
            </div>
          </div>

          {/* Police */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">🚔 Police</p>
                <p className="text-xl font-bold text-blue-700 mt-1">{helpline.police}</p>
              </div>
              <Button
                onClick={() => handleCall(helpline.police, "Police")}
                disabled={calling === "Police"}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                {calling === "Police" ? "Calling..." : "Call"}
              </Button>
            </div>
          </div>

          {/* Ambulance */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-900">🚑 Ambulance</p>
                <p className="text-xl font-bold text-green-700 mt-1">{helpline.ambulance}</p>
              </div>
              <Button
                onClick={() => handleCall(helpline.ambulance, "Ambulance")}
                disabled={calling === "Ambulance"}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                {calling === "Ambulance" ? "Calling..." : "Call"}
              </Button>
            </div>
          </div>
        </div>

        {userLocation && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>
                Your location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Share this location when calling emergency services
            </p>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Emergency Tips</p>
            <ul className="list-disc list-inside text-amber-800 space-y-1 text-xs">
              <li>Stay calm and speak clearly</li>
              <li>State your emergency and location</li>
              <li>Answer all questions from the operator</li>
              <li>Don't hang up until told to do so</li>
              <li>Keep your phone with you and on</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
