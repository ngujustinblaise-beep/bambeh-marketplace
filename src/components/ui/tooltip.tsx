import * as React from "react";

export interface TooltipProps { children: React.ReactNode;  }

export const TooltipProvider: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipTrigger: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<
  TooltipProps & { className?: string }
> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};






