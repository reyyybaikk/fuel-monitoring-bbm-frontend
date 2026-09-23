'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  // Zoom / pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
    // Directly use the src URL (can be a Supabase public URL or backend proxy)
    setImgUrl(src);
    setLoading(false);
  }, [src]);

  // Wheel zoom handler (clamped 1‑3×)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale(prev => {
      const next = Math.min(3, Math.max(1, prev * factor));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse panning handlers (only when zoomed > 1)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    setIsPanning(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !lastPosRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    lastPosRef.current = null;
  };

  if (loading) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-muted/10', className)}>
        <Loader2 className="h-5 w-5 animate-spin text-pln-cyan opacity-40" />
      </div>
    );
  }

  if (error || !imgUrl) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-muted/20 text-muted-foreground', className)}>
        <ImageIcon className="h-6 w-6 opacity-20 mb-1" />
        <span className="text-[10px] font-medium italic">Gagal memuat bukti</span>
      </div>
    );
  }

  const modalContent = isPreviewOpen && typeof window !== 'undefined' ? createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsPreviewOpen(false)}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          setIsPreviewOpen(false);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
      <img
        src={imgUrl}
        alt={`Preview of ${alt}`}
        className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          cursor: scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
        onClick={e => e.stopPropagation()}
      />
    </div>,
    document.body
  ) : null;

  return (
    <>
      <img
        src={imgUrl}
        alt={alt}
        className={cn('object-contain', enablePreview ? 'cursor-pointer hover:opacity-90 transition-opacity' : '', className)}
        onClick={() => {
          if (enablePreview) {
            setIsPreviewOpen(true);
            setScale(1);
            setOffset({ x: 0, y: 0 });
          }
        }}
      />
      {modalContent}
    </>
  );
}
