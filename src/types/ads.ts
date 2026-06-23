export type AdPlacement =
  | "banner_top" | "banner_bottom" | "sidebar" | "feed" | "spotlight";

export type AdDuration = "7d" | "14d" | "30d" | "60d" | "90d";

export interface AdPricingOption {
  placement: AdPlacement;
  price: number;
  label: string;
  description: string;
  duration: number;
  subscriberPrice: number;
  nonSubscriberPrice: number;
  multiplier: number;
  discount?: number;
}

export interface AdCreationData {
  itemId: string;
  title: string;
  placement: AdPlacement;
  budget: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  duration?: AdDuration | string;
}

export type AdCreationFormData = AdCreationData;

export const AD_PRICING_LIST: AdPricingOption[] = [
  { placement: "banner_top",    price: 5000,  label: "Top Banner",    description: "Prominent top placement",  duration: 7,  subscriberPrice: 4000,  nonSubscriberPrice: 5000,  multiplier: 1.5 },
  { placement: "banner_bottom", price: 3000,  label: "Bottom Banner", description: "Footer banner placement",  duration: 7,  subscriberPrice: 2500,  nonSubscriberPrice: 3000,  multiplier: 1.0 },
  { placement: "sidebar",       price: 4000,  label: "Sidebar",       description: "Side column placement",    duration: 14, subscriberPrice: 3200,  nonSubscriberPrice: 4000,  multiplier: 1.2 },
  { placement: "feed",          price: 6000,  label: "In-Feed",       description: "Inside listing feed",      duration: 14, subscriberPrice: 5000,  nonSubscriberPrice: 6000,  multiplier: 1.8 },
  { placement: "spotlight",     price: 10000, label: "Spotlight",     description: "Hero spotlight section",   duration: 30, subscriberPrice: 8000,  nonSubscriberPrice: 10000, multiplier: 2.5 },
];

export const AD_PRICING: Record<AdPlacement, AdPricingOption> = Object.fromEntries(
  AD_PRICING_LIST.map(p => [p.placement, p])
) as Record<AdPlacement, AdPricingOption>;

export const PLACEMENT_PRICING = AD_PRICING_LIST;
