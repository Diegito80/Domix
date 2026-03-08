"use client";

import { motion } from "framer-motion";
import { Trash2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  emoji?: string | null;
  pointsValue: number;
  completed: boolean;
  isRecurring: boolean;
  category: string;
  assignedTo: {
    id: string;
    name: string;
    nameHe: string;
    color: string;
  };
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  isKidsMode?: boolean;
}

export function TaskCard({ task, onToggle, onDelete, isKidsMode = false }: TaskCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all",
        task.completed && "opacity-60",
        isKidsMode ? "py-5" : "py-3"
      )}
      style={{ borderColor: task.assignedTo.color + "40" }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={cn(
          "shrink-0 rounded-xl border-2 flex items-center justify-center transition-all active:scale-90",
          isKidsMode ? "w-12 h-12" : "w-8 h-8",
          task.completed
            ? "bg-success border-success text-white"
            : "border-border hover:border-success"
        )}
      >
        {task.completed && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={isKidsMode ? "text-2xl" : "text-base"}
          >
            ✓
          </motion.span>
        )}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {task.emoji && (
            <span className={isKidsMode ? "text-2xl" : "text-lg"}>{task.emoji}</span>
          )}
          <span
            className={cn(
              "font-semibold truncate",
              isKidsMode ? "text-lg" : "text-sm",
              task.completed && "line-through text-text-secondary"
            )}
          >
            {task.title}
          </span>
        </div>
        {!isKidsMode && (
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: task.assignedTo.color + "20",
                color: task.assignedTo.color,
              }}
            >
              {task.assignedTo.nameHe}
            </span>
            {task.isRecurring && (
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                חוזרת
              </span>
            )}
          </div>
        )}
      </div>

      {/* Points badge */}
      {task.pointsValue > 0 && (
        <div
          className={cn(
            "shrink-0 rounded-xl font-bold flex items-center gap-1",
            isKidsMode
              ? "bg-warning/20 text-warning px-3 py-2 text-lg"
              : "bg-warning/10 text-warning px-2 py-1 text-sm"
          )}
        >
          ⭐ {task.pointsValue}
        </div>
      )}

      {/* Delete (parent mode only) */}
      {onDelete && !isKidsMode && (
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
