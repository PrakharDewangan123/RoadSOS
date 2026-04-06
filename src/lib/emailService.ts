import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Sign up at: https://www.emailjs.com/
// REPLACE THESE WITH YOUR ACTUAL EMAILJS CREDENTIALS
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

interface EmergencyContact {
  name: string;
  email: string;
  phone: string;
  relationship: string;
}

interface SOSEmailData {
  userName: string;
  location?: {
    lat: number;
    lng: number;
  };
  timestamp: Date;
  sosType: 'manual' | 'voice' | 'shake' | 'panic';
  message?: string;
}

export async function sendSOSEmail(
  contacts: EmergencyContact[],
  sosData: SOSEmailData
): Promise<boolean> {
  // Check if EmailJS is configured
  if (
    EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
    EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
  ) {
    console.warn('EmailJS not configured. Email alerts disabled.');
    console.log('Would have sent emails to:', contacts);
    return false;
  }

  try {
    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Prepare email data
    const emailPromises = contacts.map((contact) => {
      const templateParams = {
        to_name: contact.name,
        to_email: contact.email,
        user_name: sosData.userName,
        sos_type: sosData.sosType,
        timestamp: sosData.timestamp.toLocaleString(),
        location: sosData.location
          ? `https://www.google.com/maps?q=${sosData.location.lat},${sosData.location.lng}`
          : 'Location not available',
        latitude: sosData.location?.lat || 'N/A',
        longitude: sosData.location?.lng || 'N/A',
        message: sosData.message || 'Emergency SOS alert triggered',
        phone: contact.phone,
      };

      return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
    });

    // Send all emails
    await Promise.all(emailPromises);
    console.log(`✅ SOS emails sent to ${contacts.length} contacts`);
    return true;
  } catch (error) {
    console.error('Error sending SOS emails:', error);
    return false;
  }
}

// Function to send test email
export async function sendTestEmail(email: string, name: string): Promise<boolean> {
  if (
    EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
    EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
  ) {
    console.warn('EmailJS not configured. Cannot send test email.');
    return false;
  }

  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      to_name: name,
      to_email: email,
      user_name: 'SilentSOS User',
      sos_type: 'test',
      timestamp: new Date().toLocaleString(),
      location: 'Test Location',
      latitude: '40.7580',
      longitude: '-73.9855',
      message: 'This is a test email from SilentSOS. Emergency alerts are working correctly.',
    };

    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.log('✅ Test email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
}

// EmailJS Template Example
// Create a template in EmailJS dashboard with these variables:
// 
// Subject: 🚨 EMERGENCY SOS Alert from {{user_name}}
//
// Body:
// Dear {{to_name}},
//
// This is an emergency alert from SilentSOS.
//
// {{user_name}} has triggered an SOS alert!
// 
// Alert Type: {{sos_type}}
// Time: {{timestamp}}
// Location: {{location}}
// Coordinates: {{latitude}}, {{longitude}}
//
// Message: {{message}}
//
// Please check on {{user_name}} immediately or contact local authorities.
//
// Emergency Contact: {{phone}}
//
// View Location: {{location}}
//
// This is an automated emergency alert from SilentSOS.
