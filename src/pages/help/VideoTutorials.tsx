import { useState } from "react";

export default function VideoTutorials() {
  const [videoUrl, setVideoUrl] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        <h1 className="text-3xl font-bold mb-6">Video Tutorials</h1>

        <input
          type="text"
          placeholder="Paste YouTube embed URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4"
        />

        {videoUrl && (
          <div className="aspect-video">
            <iframe
              src={videoUrl}
              className="w-full h-full rounded-xl"
              allowFullScreen
            />
          </div>
        )}

      </div>
    </div>
  );
}
