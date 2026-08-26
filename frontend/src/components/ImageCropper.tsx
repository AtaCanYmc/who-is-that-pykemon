import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Move } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

/**
 * Interactive Image Cropper & Alignment Tool.
 * Allows panning, zooming, and centering the subject within Pokémon alignment guides.
 */
export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  onCropComplete,
  onCancel,
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
    const drawW = imageObj.width * scale;
    const drawH = imageObj.height * scale;

    ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw Pokémon Target Alignment Overlay
    ctx.save();
    ctx.strokeStyle = '#FFCB05';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);

    // Center focal circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    // Center crosshair
    ctx.strokeStyle = 'rgba(255, 203, 5, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(size / 2 - 20, size / 2);
    ctx.lineTo(size / 2 + 20, size / 2);
    ctx.moveTo(size / 2, size / 2 - 20);
    ctx.lineTo(size / 2, size / 2 + 20);
    ctx.stroke();

    ctx.restore();
  }, [imageObj, zoom, offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

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

  const handleTouchEnd = () => setIsDragging(false);

  const handleApplyCrop = () => {
    if (!canvasRef.current || !imageObj) return;
    const outputCanvas = document.createElement('canvas');
    const outSize = 800;
    outputCanvas.width = outSize;
    outputCanvas.height = outSize;
    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outSize, outSize);

    const ratio = outSize / 600;
    ctx.save();
    ctx.translate(outSize / 2 + offset.x * ratio, outSize / 2 + offset.y * ratio);
    ctx.scale(zoom * ratio, zoom * ratio);

    const scale = Math.min(600 / imageObj.width, 600 / imageObj.height);
    const drawW = imageObj.width * scale;
    const drawH = imageObj.height * scale;

    ctx.drawImage(imageObj, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    outputCanvas.toBlob((blob) => {
      if (blob) onCropComplete(blob);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-poke-yellow" />
            <h3 className="font-bold text-sm text-white">Görseli Konumlandır & Yakınlaştır</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner">
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
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-poke-yellow"
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
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="py-2.5 px-3 bg-poke-yellow hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Onayla</span>
          </button>
        </div>
      </div>
    </div>
  );
};
