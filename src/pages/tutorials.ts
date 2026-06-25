export type Tutorial = {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  category?: string;
  duration?: string;
  tags?: string[];
};

export const tutorials: Tutorial[] = [
  {
    id: "marketplace-basics",
    title: "How to Use the Marketplace",
    description: "Learn how to browse, post, and manage marketplace listings safely.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Getting Started",
    duration: "5 min",
    tags: ["marketplace", "basics"],
  },
  {
    id: "njangi-guide",
    title: "Understanding Njangi Groups",
    description: "A simple walkthrough for joining and managing Njangi groups.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    category: "Community",
    duration: "7 min",
    tags: ["njangi", "community"],
  },
  {
    id: "how-to-post-ad",
    title: "How to Post an Ad on Bambeh",
    description: "A beginner walkthrough for creating and publishing a new ad on Bambeh Marketplace.",
    embedUrl: "https://www.youtube.com/embed/HYOafHysHGY?si=DcQHXuz-DU-8_X02",
    category: "Getting Started",
    duration: "2 min",
    tags: ["ads", "tutorial"],
  },
];

