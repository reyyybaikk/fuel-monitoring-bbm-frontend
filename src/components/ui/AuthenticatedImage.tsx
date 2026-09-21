'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  enablePreview?: boolean;
}

export default function AuthenticatedImage({ src, alt, className, enablePreview = false }: AuthenticatedImageProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        // Mengunduh gambar melalui Axios yang sudah memiliki Header Authorization
        const response = await api.get(src, { responseType: 'blob' });
        objectUrl = URL.createObjectURL(response.data);
        setImgUrl(objectUrl);
      } catch (err) {
        console.error('Gagal memuat gambar terproteksi:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (src) {
      fetchImage();
    }

    // Membersihkan memori saat komponen dilepas
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-muted/10", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-pln-cyan opacity-40" />
      </div>
    );
  }

  if (error || !imgUrl) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-muted/20 text-muted-foreground", className)}>
        <ImageIcon className="h-6 w-6 opacity-20 mb-1" />
        <span className="text-[10px] font-medium italic">Gagal memuat bukti</span>
      </div>
    );
  }

  return (
    <>
      <img
        src={imgUrl}
        alt={alt}
        className={cn("object-contain", enablePreview ? "cursor-pointer hover:opacity-90 transition-opacity" : "", className)}
        onClick={() => {
          if (enablePreview) setIsPreviewOpen(true);
        }}
      />
      
      {/* Fullscreen Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreviewOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <img
            src={imgUrl}
            alt={`Preview of ${alt}`}
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
