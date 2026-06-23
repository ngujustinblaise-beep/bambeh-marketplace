// @ts-nocheck
import React, { useState } from "react";

interface ContactFormProps {
  propertyTitle?: string;
  onClose?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ propertyTitle, onClose }) => {
  const [msg, setMsg] = useState("");
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">
        Contact about {propertyTitle ?? "this listing"}
      </h2>
      <textarea
        value={msg}
        onChange={e => setMsg(e.target.value)}
        className="w-full border rounded p-2 min-h-[120px]"
        placeholder="Write your message..."
      />
      <div className="flex gap-2 mt-3">
        <button className="flex-1 bg-teal-600 text-white px-4 py-2 rounded">
          Send Message
        </button>
        {onClose && (
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactForm;






