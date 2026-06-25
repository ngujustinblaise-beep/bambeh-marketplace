/**
 * src/components/ui/SwipeableCard.tsx
 * Bambeh Marketplace — Swipeable Card with Action Reveal
 * © 2026 Bambeh Marketplace. All rights reserved.
 */

import React, { useRef, useState, useCallback } from "react";

export interface SwipeAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  actionWidth?: number;
  disabled?: boolean;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const ACTION_WIDTH = 72;
const THRESHOLD = 30;

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  actionWidth = ACTION_WIDTH,
  disabled = false,
  className = "",
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const currentOffset = useRef(0);
  const isDragging = useRef(false);

  const maxLeft = leftActions.length * actionWidth;
  const maxRight = rightActions.length * actionWidth;

  const snapToPosition = useCallback((targetOffset: number) => {
    currentOffset.current = targetOffset;
    setOffset(targetOffset);
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      startX.current = e.touches[0].clientX;
      isDragging.current = true;
    },
    [disabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || startX.current === null) return;

      const delta = e.touches[0].clientX - startX.current;
      const next = Math.max(-maxRight, Math.min(maxLeft, currentOffset.current + delta));
      setOffset(next);
    },
    [maxLeft, maxRight]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    startX.current = null;

    if (offset > THRESHOLD && maxLeft > 0) {
      snapToPosition(maxLeft);
      onSwipeRight?.();
    } else if (offset < -THRESHOLD && maxRight > 0) {
      snapToPosition(-maxRight);
      onSwipeLeft?.();
    } else {
      snapToPosition(0);
    }
  }, [offset, maxLeft, maxRight, snapToPosition, onSwipeLeft, onSwipeRight]);

  const handleActionClick = useCallback(
    (action: SwipeAction) => {
      action.onAction();
      snapToPosition(0);
    },
    [snapToPosition]
  );

  const closeSwipe = useCallback(() => snapToPosition(0), [snapToPosition]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 flex"
          style={{ width: maxLeft }}
        >
          {leftActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action)}
              className={`flex flex-col items-center justify-center gap-1 ${action.color} text-white`}
              style={{ width: actionWidth }}
              aria-label={action.label}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex"
          style={{ width: maxRight }}
        >
          {rightActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action)}
              className={`flex flex-col items-center justify-center gap-1 ${action.color} text-white`}
              style={{ width: actionWidth }}
              aria-label={action.label}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card content */}
      <div
        className="relative bg-white touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? "none" : "transform 0.25s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Invisible overlay to close when tapping on card while open */}
        {offset !== 0 && (
          <div
            className="absolute inset-0 z-10"
            onClick={closeSwipe}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;




