export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  duration: number;
  uploadedBy: string;
  uploadedAt: Date;
  views: number;
  likes: number;
  category?: string;
  tags?: string[];
  resolution?: "480p" | "720p" | "1080p" | "4k";
  size: number; // in bytes,
  format: "mp4" | "webm" | "ogg";
}

export interface VideoPlaylist {
  id: string;
  name: string;
  description?: string;
  videos: Video[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
  thumbnail?: string;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  timestamp: number; // video timestamp in seconds,
  createdAt: Date;
  likes: number;
  replies?: VideoComment[];
}
