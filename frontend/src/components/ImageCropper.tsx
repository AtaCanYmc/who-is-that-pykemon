import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move } from 'lucide-react';
import { Translations } from '../i18n/translations';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  t: Translations;
}

/**
 * Interactive Image Cropper & Alignment Tool.
 * Implemented with the native HTML5 <dialog> modal per Modern Web Guidance standards.
 */
export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  onCropComplete,
  onCancel,
  t,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Open native modal dialog on mount
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // Intercept native Escape key and close requests
  const handleDialogCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onCancel();
  };

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImageObj(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!imageObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 600;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
    ctx.scale(zoom, zoom);

    const scale = Math.min(size / imageObj.width, size / imageObj.height);
    const w = imageObj.width * scale;
    const h = imageObj.height * scale;

    ctx.drawImage(imageObj, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Alignment guides
    ctx.strokeStyle = 'rgba(255, 203, 5, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Center crosshair
    ctx.beginPath();
    ctx.moveTo(size / 2, 40);
    ctx.lineTo(size / 2, size - 40);
    ctx.moveTo(40, size / 2);
    ctx.lineTo(size - 40, size / 2);
    ctx.stroke();

    // Center target oval
    ctx.beginPath();
    ctx.ellipse(size / 2, size / 2, size * 0.38, size * 0.42, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.stroke();
  }, [imageObj, zoom, offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    if (!imageObj) return;

    const outSize = 800;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = outSize;
    outputCanvas.height = outSize;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(outSize / 2 + (offset.x * (outSize / 600)), outSize / 2 + (offset.y * (outSize / 600)));
    ctx.scale(zoom, zoom);

    const baseScale = Math.min(outSize / imageObj.width, outSize / imageObj.height);
    const w = imageObj.width * baseScale;
    const h = imageObj.height * baseScale;

    ctx.drawImage(imageObj, -w / 2, -h / 2, w, h);
    ctx.restore();

    outputCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/png');
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleDialogCancel}
      aria-labelledby="crop-dialog-title"
      className="p-0 bg-transparent border-0 max-w-sm w-full outline-none backdrop:bg-slate-950/80 m-auto"
    >
      <div className="studio-deck-card rounded-2xl p-5 w-full flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-poke-yellow" />
            <h2 id="crop-dialog-title" className="font-bold text-sm tracking-wide text-slate-100 dark:text-slate-100 light:text-slate-900">
              {t.cropTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-slate-900 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-poke-yellow"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden studio-monitor-bezel flex items-center justify-center cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {/* Zoom Slider */}
        <div className="w-full flex items-center gap-3 my-4">
          <ZoomOut className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={zoom}
            aria-label="Image Zoom Level"
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-poke-yellow focus-visible:outline-2 focus-visible:outline-poke-yellow"
          />
          <ZoomIn className="w-4 h-4 text-slate-400" />
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="btn-tactile py-2.5 px-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 dark:border-slate-700 light:border-slate-300 focus-visible:outline-2 focus-visible:outline-poke-yellow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.cropReset}</span>
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="btn-tactile py-2.5 px-3 bg-poke-yellow hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md focus-visible:outline-2 focus-visible:outline-slate-950"
          >
            <Check className="w-4 h-4" />
            <span>{t.cropApply}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
};
