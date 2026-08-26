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
 * Allows panning, zooming, and centering the subject within Pokémon alignment guides.
 */
export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  onCropComplete,
  onCancel,
  t,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    // Center point
    ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
    ctx.scale(zoom, zoom);

    // Maintain aspect ratio
    const scale = Math.min(size / imageObj.width, size / imageObj.height);
    const w = imageObj.width * scale;
    const h = imageObj.height * scale;

    ctx.drawImage(imageObj, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Draw alignment guides (crosshairs and rule-of-thirds grid)
    ctx.strokeStyle = 'rgba(255, 203, 5, 0.4)';
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
    ctx.strokeStyle = 'rgba(42, 117, 187, 0.6)';
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

    // Render high-res output on offscreen canvas
    const outputCanvas = document.createElement('canvas');
    const outSize = Math.max(imageObj.width, imageObj.height, 1080);
    outputCanvas.width = outSize;
    outputCanvas.height = outSize;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    // Transparent background for seamless AI matting
    ctx.clearRect(0, 0, outSize, outSize);

    ctx.save();
    // Map offset from 600px preview scale to outSize
    const scaleFactor = outSize / 600;
    ctx.translate(outSize / 2 + offset.x * scaleFactor, outSize / 2 + offset.y * scaleFactor);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-200 rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-poke-yellow" />
            <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900">{t.cropTitle}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-950 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-700 dark:border-slate-700 light:border-slate-300 bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner">
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
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-poke-yellow"
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
            className="py-2.5 px-3 bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.cropReset}</span>
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="py-2.5 px-3 bg-poke-yellow hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{t.cropApply}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
