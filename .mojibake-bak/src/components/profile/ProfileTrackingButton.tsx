// @ts-nocheck
import React, { useState } from "react";

interface TrackingCardProps {
  orderId: string;
  status: string;
  estimatedDelivery?: string;
}

interface DeliveryStatusProps {
  status: "pending" | "picked_up" | "in_transit" | "delivered" | "failed";
  updatedAt?: string;
}

const TrackingCard: React.FC<TrackingCardProps> = ({ orderId, status, estimatedDelivery }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border">
    <p className="font-semibold text-sm">Order #{orderId}</p>
    <p className="text-teal-600 text-sm font-medium mt-1">{status}</p>
    {estimatedDelivery && (
      <p className="text-xs text-gray-500 mt-1">ETA: {estimatedDelivery}</p>
    )}
  </div>
);

const DeliveryStatus: React.FC<DeliveryStatusProps> = ({ status, updatedAt }) => {
  const icons: Record<DeliveryStatusProps["status"], string> = {
    pending:    "ðŸ“¦",
    picked_up:  "ðŸšš",
    in_transit: "ðŸ›£ï¸",
    delivered:  "âœ…",
    failed:     "âŒ",
  };
  return (
    <div className="flex items-center gap-2">
      <span>{icons[status]}</span>
      <div>
        <p className="text-sm font-medium capitalize">{status.replace("_", " ")}</p>
        {updatedAt && <p className="text-xs text-gray-400">{updatedAt}</p>}
      </div>
    </div>
  );
};

interface ProfileTrackingButtonProps {
  orderId?: string;
  onTrack?: (orderId: string) => void;
}

const ProfileTrackingButton: React.FC<ProfileTrackingButtonProps> = ({ orderId, onTrack }) => {
  const [open, setOpen] = useState(false);

  if (!orderId) return null;

  return (
    <div>
      <button onClick={() => { setOpen(!open); onTrack?.(orderId); }}
        className="flex items-center gap-2 text-teal-600 text-sm font-medium
          hover:text-teal-700 transition-colors">
        ðŸšš Track Order
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <TrackingCard orderId={orderId} status="In Transit" estimatedDelivery="Tomorrow" />
          <DeliveryStatus status="in_transit" updatedAt={new Date().toLocaleDateString()} />
        </div>
      )}
    </div>
  );
};

export default ProfileTrackingButton;
export { TrackingCard, DeliveryStatus };
export type { TrackingCardProps, DeliveryStatusProps };


