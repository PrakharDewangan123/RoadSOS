import React, { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";

type AuthMode = "signup" | "login";

type Gender = "female" | "male" | "other" | "prefer_not_to_say";

type EmergencyContact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
};

type StoredUser = {
  fullName: string;
  dob?: string; // YYYY-MM-DD
  age?: string;
  gender?: Gender;
  photoDataUrl?: string; // optional, stored locally
  phone: string;
  alternatePhone?: string;
  email: string;
  presentAddress?: string;
  permanentAddress?: string;
  homeAddress?: string; // legacy
  emergencyContacts: EmergencyContact[];
  primaryGuardianContactId?: string;
  medicalInfo?: string;
  sosTemplate?: string;
  lastKnownLocation?: {
    lat: number;
    lng: number;
    timestamp: number;
  };
  password: string;
};

const STORAGE_KEY = "safeguard_user_profile";

function encodeQueryComponent(value: string) {
  return encodeURIComponent(value);
}

function makeGoogleMapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

async function getBatteryInfo(): Promise<string | undefined> {
  try {
    const navAny = navigator as any;
    if (typeof navAny.getBattery !== "function") return undefined;
    const battery = await navAny.getBattery();
    const pct = Math.round((battery.level ?? 0) * 100);
    const charging = battery.charging ? "charging" : "not charging";
    return `${pct}% (${charging})`;
  } catch {
    return undefined;
  }
}

export function UserAuth() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [permanentSameAsPresent, setPermanentSameAsPresent] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    age: "",
    gender: "prefer_not_to_say" as Gender,
    photoDataUrl: "",
    phone: "",
    alternatePhone: "",
    email: "",
    presentAddress: "",
    permanentAddress: "",
    medicalInfo: "",
    sosTemplate:
      "SOS! I need help.\nName: {{name}}\nPhone: {{phone}}\nLocation: {{location}}\nTime: {{time}}",
    password: "",
  });

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: "primary", name: "", relation: "", phone: "", email: "" },
  ]);
  const [primaryGuardianId, setPrimaryGuardianId] = useState("primary");

  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as StoredUser;
        setStoredUser(parsed);
        setMode("login");
        setLoginForm({ identifier: parsed.phone || parsed.email || "", password: "" });
        if (Array.isArray(parsed.emergencyContacts) && parsed.emergencyContacts.length > 0) {
          setContacts(parsed.emergencyContacts);
          setPrimaryGuardianId(parsed.primaryGuardianContactId || parsed.emergencyContacts[0]?.id);
        }
      } catch (error) {
        console.error("Failed to parse stored user profile", error);
      }
    }
  }, []);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.phone || !form.password) {
      toast.error("Please fill in name, phone and password");
      return;
    }

    const cleanedContacts = contacts
      .map((c) => ({
        ...c,
        name: c.name.trim(),
        relation: c.relation.trim(),
        phone: c.phone.trim(),
        email: (c.email || "").trim(),
      }))
      .filter((c) => c.name || c.phone || c.email);

    const payload: StoredUser = {
      fullName: form.fullName.trim(),
      dob: form.dob.trim() || undefined,
      age: form.age.trim() || undefined,
      gender: form.gender,
      photoDataUrl: form.photoDataUrl || undefined,
      phone: form.phone.trim(),
      alternatePhone: form.alternatePhone.trim() || undefined,
      email: form.email.trim(),
      presentAddress: form.presentAddress.trim() || undefined,
      permanentAddress: form.permanentAddress.trim() || undefined,
      emergencyContacts: cleanedContacts,
      primaryGuardianContactId: primaryGuardianId || undefined,
      medicalInfo: form.medicalInfo.trim() || undefined,
      sosTemplate: form.sosTemplate.trim() || undefined,
      password: form.password,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setStoredUser(payload);
      setIsLoggedIn(true);
      setMode("login");
      setLoginForm({ identifier: payload.phone || payload.email || "", password: "" });
      toast.success("Profile created", {
        description: "Your details are saved on this device only.",
      });
    } catch (error) {
      console.error("Failed to save user profile", error);
      toast.error("Could not save your profile");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storedUser) {
      toast.error("No profile found. Please sign up first.");
      setMode("signup");
      return;
    }

    const identifier = loginForm.identifier.trim();
    const matchesPhone =
      identifier !== "" && identifier === storedUser.phone.trim();
    const matchesEmail =
      identifier !== "" &&
      storedUser.email &&
      identifier.toLowerCase() === storedUser.email.toLowerCase().trim();

    if (
      (matchesPhone || matchesEmail) &&
      loginForm.password === storedUser.password
    ) {
      setIsLoggedIn(true);
      toast.success("Logged in");
    } else {
      toast.error("Invalid phone or password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.info("Logged out");
  };

  const handleDeleteAccount = () => {
    if (
      !window.confirm(
        "This will delete your profile and emergency contacts saved on this device. You can create a new profile again later. Do you want to continue?"
      )
    ) {
      return;
    }

    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }

    setStoredUser(null);
    setIsLoggedIn(false);
    setForm({
      fullName: "",
      dob: "",
      age: "",
      gender: "prefer_not_to_say",
      photoDataUrl: "",
      phone: "",
      alternatePhone: "",
      email: "",
      presentAddress: "",
      permanentAddress: "",
      medicalInfo: "",
      sosTemplate:
        "SOS! I need help.\nName: {{name}}\nPhone: {{phone}}\nLocation: {{location}}\nTime: {{time}}",
      password: "",
    });
    setContacts([{ id: "primary", name: "", relation: "", phone: "", email: "" }]);
    setPrimaryGuardianId("primary");
    setPermanentSameAsPresent(false);
    setLoginForm({ identifier: "", password: "" });

    toast.success("Account deleted", {
      description: "Your profile data has been removed from this device. You can sign up again anytime.",
    });
  };

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleTextareaChange =
    (field: "presentAddress" | "permanentAddress" | "medicalInfo" | "sosTemplate") =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => {
        if (field === "presentAddress" && permanentSameAsPresent) {
          return { ...prev, presentAddress: value, permanentAddress: value };
        }
        return { ...prev, [field]: value };
      });
    };

  const handleLoginChange =
    (field: keyof typeof loginForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, gender: e.target.value as Gender }));
  };

  const updateContact =
    (id: string, field: keyof Omit<EmergencyContact, "id">) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      );
    };

  const addContact = () => {
    const id = `c_${Date.now()}`;
    setContacts((prev) => [...prev, { id, name: "", relation: "", phone: "", email: "" }]);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => {
      const next = prev.filter((c) => c.id !== id);
      const nextPrimary = next[0]?.id;
      if (primaryGuardianId === id && nextPrimary) setPrimaryGuardianId(nextPrimary);
      return next.length > 0 ? next : [{ id: "primary", name: "", relation: "", phone: "", email: "" }];
    });
  };

  const requestAndSaveLocation = async () => {
    if (!storedUser) {
      toast.error("Please sign up first to save location.");
      return;
    }
    if (!("geolocation" in navigator)) {
      toast.error("Location not supported on this device/browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const updated: StoredUser = {
          ...storedUser,
          lastKnownLocation: { lat, lng, timestamp: Date.now() },
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setStoredUser(updated);
        toast.success("Location saved", {
          description: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        });
      },
      () => {
        toast.error("Could not get location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const primaryGuardian = useMemo(() => {
    const user = storedUser;
    if (!user) return undefined;
    const list = user.emergencyContacts || [];
    return (
      list.find((c) => c.id === user.primaryGuardianContactId) ||
      list[0]
    );
  }, [storedUser]);

  const buildSOSMessage = async () => {
    if (!storedUser) return "SOS! I need help.";

    const now = new Date();
    let locationText = "Not available";

    const last = storedUser.lastKnownLocation;
    if (last) {
      locationText = makeGoogleMapsLink(last.lat, last.lng);
    }

    const batteryInfo = await getBatteryInfo();
    const onlineInfo = typeof navigator !== "undefined" ? (navigator.onLine ? "online" : "offline") : undefined;

    const template =
      storedUser.sosTemplate ||
      "SOS! I need help.\nName: {{name}}\nPhone: {{phone}}\nLocation: {{location}}\nTime: {{time}}";

    const msg = template
      .replaceAll("{{name}}", storedUser.fullName)
      .replaceAll("{{phone}}", storedUser.phone)
      .replaceAll("{{altPhone}}", storedUser.alternatePhone || "")
      .replaceAll("{{email}}", storedUser.email || "")
      .replaceAll(
        "{{presentAddress}}",
        storedUser.presentAddress || storedUser.homeAddress || ""
      )
      .replaceAll("{{permanentAddress}}", storedUser.permanentAddress || "")
      .replaceAll("{{location}}", locationText)
      .replaceAll("{{time}}", now.toLocaleString())
      .replaceAll("{{battery}}", batteryInfo || "")
      .replaceAll("{{network}}", onlineInfo || "")
      .replaceAll("{{medical}}", storedUser.medicalInfo || "");

    return msg.trim();
  };

  const sendVia = async (channel: "sms" | "email" | "whatsapp" | "call") => {
    if (!storedUser) {
      toast.error("Please create a profile first.");
      return;
    }
    const guardian = primaryGuardian;
    if (!guardian) {
      toast.error("Please add at least one emergency contact.");
      return;
    }

    const message = await buildSOSMessage();
    const phone = guardian.phone?.trim();
    const email = (guardian.email || "").trim();

    if (channel === "call") {
      if (!phone) return toast.error("Primary guardian phone is missing.");
      window.location.href = `tel:${phone}`;
      return;
    }

    if (channel === "sms") {
      if (!phone) return toast.error("Primary guardian phone is missing.");
      window.location.href = `sms:${phone}?body=${encodeQueryComponent(message)}`;
      return;
    }

    if (channel === "email") {
      if (!email) return toast.error("Primary guardian email is missing.");
      const subject = "SOS Alert";
      window.location.href = `mailto:${email}?subject=${encodeQueryComponent(subject)}&body=${encodeQueryComponent(message)}`;
      return;
    }

    if (channel === "whatsapp") {
      if (!phone) return toast.error("Primary guardian phone is missing.");
      const digits = phone.replace(/[^\d]/g, "");
      window.location.href = `https://wa.me/${digits}?text=${encodeQueryComponent(message)}`;
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, photoDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your Profile</h2>
          <p className="text-xs text-gray-600">
            We use these details to contact your guardians and include in SOS messages.
          </p>
        </div>
        {storedUser && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          >
            {mode === "signup" ? "Have an account?" : "Edit profile"}
          </Button>
        )}
      </div>

      {!storedUser || mode === "signup" ? (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-24 ring-4 ring-white shadow-md">
                <AvatarImage src={form.photoDataUrl || undefined} alt="Profile photo" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  {(form.fullName || "U")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                {storedUser ? "Update profile" : "Create your profile"}
              </h3>
              <p className="text-xs text-gray-600 max-w-md">
                Add your details once. We’ll use them to prepare SOS messages and help your
                guardians identify you instantly.
              </p>
              <div className="mt-4">
                <Label htmlFor="photo" className="sr-only">
                  Upload photo
                </Label>
                <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>
            </div>
          </Card>

          <form className="space-y-4" onSubmit={handleSignupSubmit}>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">General details</p>
                  <p className="text-xs text-gray-600">Identity information for SOS.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="dob">DOB (optional)</Label>
                    <Input id="dob" type="date" value={form.dob} onChange={handleChange("dob")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="age">Age (optional)</Label>
                    <Input
                      id="age"
                      inputMode="numeric"
                      value={form.age}
                      onChange={handleChange("age")}
                      placeholder="e.g. 21"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gender">Gender (optional)</Label>
                    <select
                      id="gender"
                      value={form.gender}
                      onChange={handleGenderChange}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="prefer_not_to_say">Prefer not to say</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Contact & address</p>
                <p className="text-xs text-gray-600">How people can reach you.</p>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="phone">Primary phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="alternatePhone">Alternate phone (optional)</Label>
                  <Input
                    id="alternatePhone"
                    value={form.alternatePhone}
                    onChange={handleChange("alternatePhone")}
                    placeholder="+91 ..."
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="presentAddress">Present address (optional)</Label>
                  <Textarea
                    id="presentAddress"
                    value={form.presentAddress}
                    onChange={handleTextareaChange("presentAddress")}
                    placeholder="Hostel/PG/current address"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="permanentAddress">Permanent address (optional)</Label>
                    <label className="flex items-center gap-2 text-xs text-gray-700 select-none">
                      <Checkbox
                        id="permanentSameAsPresent"
                        checked={permanentSameAsPresent}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setPermanentSameAsPresent(isChecked);
                          if (isChecked) {
                            setForm((prev) => ({
                              ...prev,
                              permanentAddress: prev.presentAddress,
                            }));
                          }
                        }}
                      />
                      Same as present
                    </label>
                  </div>
                  <Textarea
                    id="permanentAddress"
                    value={form.permanentAddress}
                    onChange={handleTextareaChange("permanentAddress")}
                    placeholder="Home town/permanent address"
                    disabled={permanentSameAsPresent}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Emergency contacts</p>
                  <p className="text-xs text-gray-600">
                    Add multiple contacts and choose a primary guardian.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addContact}>
                  Add contact
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {contacts.map((c, idx) => (
                  <Card key={c.id} className="p-4 bg-gray-50">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-700">Contact {idx + 1}</p>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-gray-700 select-none">
                          <input
                            type="radio"
                            name="primaryGuardian"
                            checked={primaryGuardianId === c.id}
                            onChange={() => setPrimaryGuardianId(c.id)}
                          />
                          Primary
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeContact(c.id)}
                          disabled={contacts.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`cname_${c.id}`}>Name</Label>
                        <Input
                          id={`cname_${c.id}`}
                          value={c.name}
                          onChange={updateContact(c.id, "name")}
                          placeholder="Contact name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`crel_${c.id}`}>Relation</Label>
                        <Input
                          id={`crel_${c.id}`}
                          value={c.relation}
                          onChange={updateContact(c.id, "relation")}
                          placeholder="Mother / Friend / etc."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`cphone_${c.id}`}>Phone</Label>
                        <Input
                          id={`cphone_${c.id}`}
                          value={c.phone}
                          onChange={updateContact(c.id, "phone")}
                          placeholder="+91 ..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`cemail_${c.id}`}>Email (optional)</Label>
                        <Input
                          id={`cemail_${c.id}`}
                          type="email"
                          value={c.email || ""}
                          onChange={updateContact(c.id, "email")}
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Medical info</p>
                <p className="text-xs text-gray-600">Optional but helpful in emergencies.</p>
              </div>
              <div className="mt-4 space-y-1">
                <Label htmlFor="medicalInfo">Medical info (optional)</Label>
                <Textarea
                  id="medicalInfo"
                  value={form.medicalInfo}
                  onChange={handleTextareaChange("medicalInfo")}
                  placeholder="Allergies, blood group, conditions..."
                />
              </div>
            </Card>

            <Card className="p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">SOS message</p>
                <p className="text-xs text-gray-600">Customize what gets shared.</p>
              </div>
              <div className="mt-4 space-y-1">
                <Label htmlFor="sosTemplate">Template</Label>
                <Textarea
                  id="sosTemplate"
                  value={form.sosTemplate}
                  onChange={handleTextareaChange("sosTemplate")}
                />
                <p className="text-[11px] text-gray-500">
                  Placeholders:{" "}
                  <span className="font-medium">{`{{name}} {{phone}} {{altPhone}} {{email}} {{presentAddress}} {{permanentAddress}} {{location}} {{time}} {{battery}} {{network}} {{medical}}`}</span>
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">Security</p>
                <p className="text-xs text-gray-600">Used only for login on this device.</p>
              </div>
              <div className="mt-4 space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="Choose a simple PIN or password"
                  required
                />
              </div>
            </Card>

            <div className="space-y-2">
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {storedUser ? "Save changes" : "Create profile"}
              </Button>
              <p className="text-[11px] text-gray-500 text-center">
                Your data is stored only on this phone/browser. It is not uploaded to any server yet.
              </p>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            {!isLoggedIn ? (
              <>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Login</p>
                  <p className="text-xs text-gray-600">Use your phone or email with your password.</p>
                </div>
                <form className="space-y-3 mt-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-1">
                    <Label htmlFor="loginIdentifier">Phone or email</Label>
                    <Input
                      id="loginIdentifier"
                      value={loginForm.identifier}
                      onChange={handleLoginChange("identifier")}
                      placeholder={
                        storedUser.email
                          ? `${storedUser.phone || ""} or ${storedUser.email}`
                          : storedUser.phone || "Enter phone or email"
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      value={loginForm.password}
                      onChange={handleLoginChange("password")}
                      placeholder="Your password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Login
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-24 ring-4 ring-white shadow-md">
                  <AvatarImage src={storedUser.photoDataUrl || undefined} alt="Profile photo" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                    {(storedUser.fullName || "U")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((s) => s[0]?.toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 text-base font-semibold text-gray-900">{storedUser.fullName}</h3>
                <p className="text-xs text-gray-600">Your SOS profile is ready</p>
                <div className="mt-4 w-full flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                    onClick={handleDeleteAccount}
                  >
                    Delete account & data
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {isLoggedIn && (
            <>
              <Card className="p-5">
                <p className="text-sm font-semibold text-gray-900">General details</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">DOB / Age</p>
                    <p className="font-medium text-gray-900">
                      {[storedUser.dob, storedUser.age ? `${storedUser.age} yrs` : ""].filter(Boolean).join(" • ") || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">{storedUser.gender || "—"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <p className="text-sm font-semibold text-gray-900">Contact & address</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">Primary phone</p>
                    <p className="font-medium text-gray-900">{storedUser.phone || "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">Alternate phone</p>
                    <p className="font-medium text-gray-900">{storedUser.alternatePhone || "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 md:col-span-2">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{storedUser.email || "—"}</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 md:col-span-2">
                    <p className="text-xs text-gray-500">Present address</p>
                    <p className="font-medium text-gray-900">
                      {storedUser.presentAddress || storedUser.homeAddress || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-white p-3 md:col-span-2">
                    <p className="text-xs text-gray-500">Permanent address</p>
                    <p className="font-medium text-gray-900">{storedUser.permanentAddress || "—"}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Emergency contacts</p>
                    <p className="text-xs text-gray-600">Primary guardian gets the SOS first.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={requestAndSaveLocation}>
                    Save current location
                  </Button>
                </div>
                <div className="mt-4">
                  {(storedUser.emergencyContacts || []).length === 0 ? (
                    <p className="text-xs text-gray-600">No contacts saved.</p>
                  ) : (
                    <div className="space-y-3">
                      {storedUser.emergencyContacts.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-lg border bg-white p-3 flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {c.name || "Unnamed"}{" "}
                              <span className="text-gray-600 font-normal">
                                {c.relation ? `(${c.relation})` : ""}
                              </span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {c.phone ? `Phone: ${c.phone}` : ""}{c.email ? ` • Email: ${c.email}` : ""}
                            </p>
                          </div>
                          {storedUser.primaryGuardianContactId === c.id && (
                            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {storedUser.lastKnownLocation && (
                  <p className="mt-3 text-[11px] text-gray-500">
                    Last location saved: {new Date(storedUser.lastKnownLocation.timestamp).toLocaleString()} •{" "}
                    {makeGoogleMapsLink(storedUser.lastKnownLocation.lat, storedUser.lastKnownLocation.lng)}
                  </p>
                )}
              </Card>

              <Card className="p-5">
                <p className="text-sm font-semibold text-gray-900">Medical info</p>
                <div className="mt-4 rounded-lg border bg-white p-3 text-sm">
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="font-medium text-gray-900 whitespace-pre-wrap">
                    {storedUser.medicalInfo || "—"}
                  </p>
                </div>
              </Card>

              <Card className="p-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Send test SOS</p>
                  <p className="text-xs text-gray-600">This opens the respective app with pre-filled content.</p>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" onClick={() => sendVia("call")}>
                    Call
                  </Button>
                  <Button variant="outline" onClick={() => sendVia("sms")}>
                    SMS
                  </Button>
                  <Button variant="outline" onClick={() => sendVia("whatsapp")}>
                    WhatsApp
                  </Button>
                  <Button variant="outline" onClick={() => sendVia("email")}>
                    Email
                  </Button>
                </div>
                <p className="mt-3 text-[11px] text-gray-500">
                  These details can be included in SOS messages (SMS, email, WhatsApp) so your guardians know who you are.
                </p>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

