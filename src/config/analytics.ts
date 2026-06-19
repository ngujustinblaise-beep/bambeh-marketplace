// src/config/analytics.ts
import ReactGA from "react-ga4";

export const initGA = () => {
  // Replace with your actual GA4 Measurement ID
  ReactGA.initialize("G-XXXXXXXXXX");

}
export const logPageView = (page: string) => {
  ReactGA.send({ hitType: "pageview", page });

}
export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label
  });
}
