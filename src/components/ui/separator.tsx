import * as React from "react";

export interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const Separator: React.FC<SeparatorProps> = ({
  className = "",
  orientation = "horizontal",
}) => {
  return <hr className={className} />;
};





