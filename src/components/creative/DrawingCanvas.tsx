"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Eraser, Paintbrush, Undo2, Redo2, Trash2, Save, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#FF6B00", "#FFD700",
  "#00C853", "#2196F3", "#9C27B0", "#E91E63", "#795548",
  "#607D8B", "#00BCD4",
];

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
}

export function DrawingCanvas({ onSave }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    // Keep max 50 states
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([imageData]);
    setHistoryIndex(0);

    // Disable pinch zoom on canvas
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    canvas.addEventListener("touchmove", preventZoom, { passive: false });
    return () => canvas.removeEventListener("touchmove", preventZoom);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    setShowClearConfirm(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 bg-card border-b border-border flex-wrap">
        {/* Tools */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setTool("brush")}
            className={`p-2.5 rounded-xl transition-colors ${
              tool === "brush" ? "bg-accent-warm text-white" : "hover:bg-background"
            }`}
          >
            <Paintbrush className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2.5 rounded-xl transition-colors ${
              tool === "eraser" ? "bg-accent-warm text-white" : "hover:bg-background"
            }`}
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Brush size */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
            className="p-1.5 rounded-lg hover:bg-background"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div
            className="rounded-full bg-current mx-1"
            style={{
              width: Math.min(brushSize * 2, 24),
              height: Math.min(brushSize * 2, 24),
              color: tool === "eraser" ? "#ccc" : color,
            }}
          />
          <button
            onClick={() => setBrushSize(Math.min(20, brushSize + 1))}
            className="p-1.5 rounded-lg hover:bg-background"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Colors */}
        <div className="flex gap-1.5 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("brush");
              }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                color === c && tool === "brush" ? "scale-125 border-accent-warm" : "border-border hover:scale-110"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Actions */}
        <div className="flex gap-1.5">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2.5 rounded-xl hover:bg-background disabled:opacity-30 transition-colors"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2.5 rounded-xl hover:bg-background disabled:opacity-30 transition-colors"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="mr-auto" />

        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>שמור</span>
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="absolute inset-0 touch-none cursor-crosshair"
        />
      </div>

      {/* Clear confirmation */}
      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-2xl shadow-lg p-6 text-center max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold mb-2">למחוק הכל?</p>
            <p className="text-sm text-text-secondary mb-5">הציור יימחק לגמרי</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowClearConfirm(false)} className="flex-1">
                ביטול
              </Button>
              <Button variant="danger" onClick={clearCanvas} className="flex-1">
                מחק
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
