/**
 * ════════════════════════════════════════════════════════════════
 * src/components/posting/ImageUploadStep.tsx
 * Universal image upload step — drop into any posting form.
 * © 2026 BAMBEH SARL / Bambeh. All rights reserved.
 * ════════════════════════════════════════════════════════════════
 */

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Image, X, AlertCircle, CheckCircle2, Upload } from 'lucide-react';

interface UploadedImage {
  file:    File;
  preview: string;
  id:      string;
}

interface ImageUploadStepProps {
  title?:     string;
  subtitle?:  string;
  maxImages?: number;
  minImages?: number;
  required?:  boolean;
  initialImages?: string[];
  onNext: (files: File[], previews: string[]) => void;
  onBack?: () => void;
}

const ImageUploadStep: React.FC<ImageUploadStepProps> = ({
  title     = 'Add Photos',
  subtitle  = 'Better photos = more responses. First photo is the cover.',
  maxImages = 5,
  minImages = 1,
  required  = true,
  initialImages = [],
  onNext,
  onBack
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images,   setImages]   = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const totalCount = images.length + initialImages.length;
  const canAddMore = totalCount < maxImages;

  const readAsDataURL = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = () => res(r.result as string);
      r.onerror = () => rej(new Error('Failed to read file'));
      r.readAsDataURL(file);
    });

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setLoading(true);
    setError('');
    const arr     = Array.from(files);
    const allowed = arr.filter(f => f.type.startsWith('image/'));

    if (allowed.length === 0) {
      setError('Please select image files only (JPG, PNG, WEBP).');
      setLoading(false);
      return;
    }

    const remaining = maxImages - totalCount;
    const toProcess = allowed.slice(0, remaining);

    const newImages: UploadedImage[] = [];
    for (const file of toProcess) {
      try {
        const preview = await readAsDataURL(file);
        newImages.push({ file, preview, id: `${Date.now()}_${Math.random()}` });
      } catch { /* skip bad file */ }
    }

    setImages(prev => [...prev, ...newImages]);
    setLoading(false);
  }, [maxImages, totalCount]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files);
    e.target.value = '';
  };

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      const removed = prev.find(img => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };

  const handleContinue = () => {
    if (required && images.length < minImages) {
      setError(`Please add at least ${minImages} photo${minImages > 1 ? 's' : ''}.`);
      return;
    }
    setError('');
    const files    = images.map(img => img.file);
    const previews = images.map(img => img.preview);
    setTimeout(() => onNext(files, previews), 0);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-5 h-5 text-teal-600" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Upload area */}
      {canAddMore && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-teal-400 bg-teal-50'
              : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileChange}
            className="sr-only"
          />
          <Upload className="w-10 h-10 text-teal-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">
            Tap to take photo or choose from gallery
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalCount} / {maxImages} photos added
          </p>
          {loading && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-teal-600">
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              Processing images...
            </div>
          )}
        </div>
      )}

      {/* Image grid */}
      {(images.length > 0 || initialImages.length > 0) && (
        <div className="grid grid-cols-3 gap-2.5">
          {initialImages.map((url, i) => (
            <div key={`init_${i}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && !images.length && (
                <div className="absolute bottom-0 left-0 right-0 bg-teal-600 text-white text-xs text-center py-1 font-semibold">
                  Cover
                </div>
              )}
            </div>
          ))}
          {images.map((img, i) => {
            const isCover = i === 0 && initialImages.length === 0;
            return (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                <img src={img.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {isCover && (
                  <div className="absolute bottom-0 left-0 right-0 bg-teal-600 text-white text-xs text-center py-1 font-semibold">
                    Cover
                  </div>
                )}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            );
          })}
          {canAddMore && images.length > 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-teal-400 hover:bg-teal-50 transition-all"
            >
              <Image className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">Add more</span>
            </button>
          )}
        </div>
      )}

      {/* Photo tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-semibold text-blue-800">📸 Tips for better photos:</p>
        {[
          'Good lighting — natural light is best',
          'Show all angles (front, back, sides)',
          'Clean the item before photographing',
          'First photo = cover — make it count!',
        ].map(tip => (
          <div key={tip} className="flex items-center gap-2 text-xs text-blue-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {tip}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl font-bold shadow-lg hover:from-teal-400 hover:to-teal-600 transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {required && images.length === 0 && minImages > 0
            ? 'Add at least 1 photo'
            : 'Continue →'
          }
        </button>
      </div>
    </div>
  );
};

export default ImageUploadStep;



