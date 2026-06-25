import React from "react";

export interface LocationValue {
  city: string;
  region: string;
  country: string;
  address: string;
}

interface Props {
  value: LocationValue;
  onChange: (location: LocationValue) => void;
  required?: boolean;
}

const LocationSelector: React.FC<Props> = ({ value, onChange }) => {
  function handleChange(field: keyof LocationValue, val: string) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Address"
        value={value.address}
        onChange={(e) => handleChange("address", e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="City"
        value={value.city}
        onChange={(e) => handleChange("city", e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Region"
        value={value.region}
        onChange={(e) => handleChange("region", e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="text"
        placeholder="Country"
        value={value.country}
        onChange={(e) => handleChange("country", e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
};

export default LocationSelector;
