'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface ImageUploaderProps {
  bucket: string;
  folder?: string;
  currentImageUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export default function ImageUploader({
  bucket,
  folder = 'uploads',
  currentImageUrl,
  onUpload,
  onRemove,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!acceptedFormats.includes(file.type)) {
      setError('Invalid file format. Please use JPEG, PNG, GIF, or WebP.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);

    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const extension = file.name.split('.').pop();
      const filePath = `${folder}/${timestamp}-${randomId}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {currentImageUrl ? (
        <div className="relative group">
          <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden">
            <Image
              src={currentImageUrl}
              alt="Uploaded image"
              fill
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`
            relative flex flex-col items-center justify-center w-full h-40 
            border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${dragOver ? 'border-[#1a237e] bg-[#1a237e]/5' : 'border-slate-200 hover:border-slate-300'}
            ${uploading ? 'pointer-events-none' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#1a237e] animate-spin mb-2" />
              <p className="text-sm text-slate-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600 mb-1">
                <span className="text-[#1a237e] font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-400">
                JPEG, PNG, GIF, WebP (max {maxSizeMB}MB)
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
