import React, { useState } from "react";
import { Phone, Plus, Edit2, Trash2, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Mom",
      phone: "+1 (555) 123-4567",
      relationship: "Mother",
      isPrimary: true,
    },
    {
      id: "2",
      name: "Best Friend",
      phone: "+1 (555) 987-6543",
      relationship: "Friend",
      isPrimary: false,
    },
    {
      id: "3",
      name: "Sister",
      phone: "+1 (555) 456-7890",
      relationship: "Sibling",
      isPrimary: false,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelationship, setNewRelationship] = useState("");

  const handleCall = (contact: Contact) => {
    alert(`Calling ${contact.name} at ${contact.phone}`);
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const togglePrimary = (id: string) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === id ? !c.isPrimary : c.isPrimary,
      }))
    );
  };

  const handleSaveNew = () => {
    if (!newName.trim() || !newPhone.trim()) {
      alert("Please enter at least a name and phone number.");
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      relationship: newRelationship.trim() || "Emergency contact",
      isPrimary: contacts.length === 0,
    };

    setContacts((prev) => [...prev, newContact]);
    setNewName("");
    setNewPhone("");
    setNewRelationship("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600 transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-xl p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Relationship"
            value={newRelationship}
            onChange={(e) => setNewRelationship(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveNew}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewName("");
                setNewPhone("");
                setNewRelationship("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                    {contact.isPrimary && (
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{contact.relationship}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePrimary(contact.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Star
                      size={16}
                      className={
                        contact.isPrimary
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  <button
                    onClick={() => handleCall(contact)}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <Phone size={16} className="text-green-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
