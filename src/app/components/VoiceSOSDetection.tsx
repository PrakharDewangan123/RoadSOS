import { useEffect, useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";

interface VoiceSOSDetectionProps {
  onSOSDetected: () => void;
  enabled?: boolean;
}

export function VoiceSOSDetection({ onSOSDetected, enabled = false }: VoiceSOSDetectionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('')
          .toLowerCase();

        // Check for SOS keywords (English + common Indian languages)
        const sosKeywords = [
          // English
          'help',
          'help me',
          'emergency',
          'sos',
          'danger',
          'police',
          'save me',
          'someone help',
          'call for help',
          'i am in danger',
          'i am unsafe',
          'please help',
          // Hindi / Urdu (Latin script)
          'bachao',
          'bachaao',
          'bachao mujhe',
          'bachao mujhe please',
          'madad',
          'madad karo',
          'mujhe bachao',
          'mujhe bachaao',
          // Other common Indian phrases (Latin script)
          'sahayata',
          'sahayta',
          'raksha karo',
        ];
        const detected = sosKeywords.some((keyword) =>
          transcript.includes(keyword)
        );

        if (detected) {
          console.log('SOS keyword detected:', transcript);
          toast.warning('🎤 Voice SOS detected!', {
            description: 'Emergency alert triggered by voice command',
          });
          onSOSDetected();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied', {
            description: 'Please allow microphone access for voice SOS',
          });
        }
      };

      recognition.onend = () => {
        if (enabled && isListening) {
          // Restart if still enabled
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Speech Recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (enabled && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('🎤 Voice SOS activated', {
          description: 'Say "help", "emergency", or "SOS" to trigger alert',
        });
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    } else if (!enabled && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Voice SOS deactivated');
    }
  }, [enabled, isSupported]);

  if (!isSupported) {
    return null;
  }

  return null; // Component works in background
}

// Voice SOS Control Panel
export function VoiceSOSControl({ enabled, onToggle }: { enabled: boolean; onToggle: (enabled: boolean) => void }) {
  const isSupported = typeof window !== 'undefined' && 
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  if (!isSupported) {
    return (
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-3">
          <MicOff className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Voice SOS Detection</p>
            <p className="text-xs text-gray-600">Not supported in this browser</p>
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
            <Mic className="h-5 w-5 text-purple-600" />
          ) : (
            <MicOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">Voice SOS Detection</p>
            <p className="text-xs text-gray-600">
              {enabled ? 'Listening for "help", "emergency", "SOS"' : 'Tap to activate'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => onToggle(!enabled)}
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
