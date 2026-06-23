/**
 * IMAGE UPLOADER COMPONENT - FULLY FUNCTIONAL
 * FILE LOCATION: src/components/common/ImageUploader.tsx
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import imageCompression from 'browser-image-compression';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const UploadIcon = () => (
  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const XIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const LoaderIcon = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

interface ImageFile { file: File; preview: string; order: number; }

interface ImageUploaderProps {
  maxImages?: number;
  maxSizeMB?: number;
  onImagesChange: (urls: string[]) => void;
  existingImages?: string[];
  storagePath?: string;
  showHelperText?: boolean;
}

export default function ImageUploader({
  maxImages = 10,
  maxSizeMB = 5,
  onImagesChange,
  existingImages = [],
  storagePath = 'listings',
  showHelperText = true,
}: ImageUploaderProps) {
  const [images, setImages]       = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setError(null);

    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const validFiles: ImageFile[] = [];
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) { setError(`"${file.name}" is not an image file`); continue; }
      if (file.size / (1024 * 1024) > maxSizeMB) { setError(`"${file.name}" exceeds the ${maxSizeMB}MB limit`); continue; }
      validFiles.push({ file, preview: URL.createObjectURL(file), order: images.length + validFiles.length });
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setImages(prev => {
      const newImages = [...prev];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      return newImages.map((img, i) => ({ ...img, order: i }));
    });
  };

  const compressAndUpload = async () => {
    if (images.length === 0) { setError('Please select at least one image'); return; }
    setUploading(true);
    setError(null);
    try {
      const storage = getStorage();
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/jpeg' as const };
        let compressedFile: File;
        try {
          compressedFile = await imageCompression(images[i].file, options);
        } catch {
          compressedFile = images[i].file;
        }
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = compressedFile.type === 'image/jpeg' ? 'jpg' : 'png';
        const storageRef = ref(storage, `${storagePath}/${timestamp}_${randomStr}_${i}.${ext}`);
        await uploadBytes(storageRef, compressedFile);
        uploadedUrls.push(await getDownloadURL(storageRef));
      }
      onImagesChange([...existingImages, ...uploadedUrls]);
      setImages([]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Images {!existingImages.length && '*'}</label>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-500 hover:bg-gray-50'}`}
      >
        <UploadIcon />
        <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
        {showHelperText && <p className="text-xs text-gray-500 mt-1">PNG, JPG up to {maxSizeMB}MB (max {maxImages} images)</p>}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleInputChange} className="hidden" />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Images ({images.length}/{maxImages})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('index', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); reorderImages(parseInt(e.dataTransfer.getData('index')), index); }}
                className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-teal-500 transition cursor-move"
              >
                <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <XIcon />
                </button>
                {index === 0 && <div className="absolute bottom-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">Main</div>}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">{index + 1}</div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={compressAndUpload}
            disabled={uploading}
            className="mt-4 w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium transition"
          >
            {uploading ? (
              <><LoaderIcon /><span className="ml-2">Uploading {images.length} image{images.length > 1 ? 's' : ''}...</span></>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload {images.length} Image{images.length > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {existingImages.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images ({existingImages.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                <img src={url} alt={`Uploaded ${index + 1}`} className="w-full h-32 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'; }}
                />
                {index === 0 && <div className="absolute bottom-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">Main</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showHelperText && images.length === 0 && existingImages.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">📸 Image Upload Tips:</p>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Use high-quality images (minimum 1600×1600 pixels)</li>
            <li>First image will be the main/cover image</li>
            <li>White or light background works best</li>
            <li>Show your item from multiple angles</li>
            <li>Images will be automatically compressed</li>
          </ul>
        </div>
      )}
    </div>
  );
}






