import { useEffect, useState } from "react";
import { Smartphone, SmartphoneNfc } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

interface ShakeDetectionProps {
  onShakeDetected: () => void;
  enabled?: boolean;
}

export function ShakeDetection({ onShakeDetected, enabled = false }: ShakeDetectionProps) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if DeviceMotionEvent is supported
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isSupported) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeCount = 0;
    let lastShakeTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;
      
      // Calculate the change in acceleration
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      // Check if the change is significant (shake detected)
      const shakeThreshold = 15;
      if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
        const now = Date.now();
        
        // Count rapid shakes within 1 second
        if (now - lastShakeTime < 1000) {
          shakeCount++;
        } else {
          shakeCount = 1;
        }
        
        lastShakeTime = now;

        // Trigger SOS if shaken 3+ times rapidly
        if (shakeCount >= 3) {
          console.log('Shake SOS detected!');
          toast.warning('📱 Shake detected!', {
            description: 'Emergency SOS triggered by phone shake',
          });
          onShakeDetected();
          shakeCount = 0; // Reset to prevent multiple triggers
        }
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    // Request permission for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          } else {
            toast.error('Motion access denied', {
              description: 'Please allow motion sensors for shake detection',
            });
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS devices
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled, isSupported, onShakeDetected]);

  return null; // Component works in background
}

// Shake Detection Control Panel
export function ShakeDetectionControl({ enabled, onToggle }: { enabled: boolean; onToggle: (enabled: boolean) => void }) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleToggle = async () => {
    if (!enabled) {
      // Request permission on iOS
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            onToggle(true);
          } else {
            toast.error('Permission denied', {
              description: 'Motion sensor access is required',
            });
          }
        } catch (error) {
          console.error('Permission request error:', error);
        }
      } else {
        onToggle(true);
      }
    } else {
      onToggle(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Shake to SOS</p>
            <p className="text-xs text-gray-600">Not supported on this device</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <SmartphoneNfc className="h-5 w-5 text-purple-600 animate-pulse" />
          ) : (
            <Smartphone className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">Shake to SOS</p>
            <p className="text-xs text-gray-600">
              {enabled ? 'Shake phone 3 times rapidly' : 'Tap to activate'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleToggle}
          variant={enabled ? "default" : "outline"}
          size="sm"
          className={enabled ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          {enabled ? "Active" : "Enable"}
        </Button>
      </div>
    </Card>
  );
}
