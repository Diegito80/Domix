"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Star, Users } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { TaskCard } from "@/components/tasks/TaskCard";
import { AddTaskModal } from "@/components/tasks/AddTaskModal";
import { PointsBadge } from "@/components/tasks/PointsBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { TASK_CATEGORIES } from "@/lib/constants";
import { useAudioFeedback } from "@/lib/hooks/useAudioFeedback";

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
    points?: number;
  } | null;
}

interface FamilyMember {
  id: string;
  name: string;
  nameHe: string;
  color: string;
  role: string;
  points: number;
}

export default function TasksPage() {
  const activeMember = useAppStore((s) => s.activeMember);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [poolTasks, setPoolTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);

  const { play } = useAudioFeedback();
  const isParent = activeMember?.role === "parent";
  const isKidsMode = !isParent;

  const fetchTasks = useCallback(() => {
    const params = new URLSearchParams();
    if (isKidsMode && activeMember) {
      params.set("memberId", activeMember.id);
    }
    fetch(`/api/tasks?${params}`)
      .then((r) => r.json())
      .then(setTasks);

    // Also fetch shared pool tasks for kids
    if (isKidsMode) {
      fetch("/api/tasks?pool=true")
        .then((r) => r.json())
        .then(setPoolTasks);
    }
  }, [activeMember, isKidsMode]);

  const fetchMembers = useCallback(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((all: FamilyMember[]) => {
        setMembers(all);
        if (activeMember) {
          const me = all.find((m) => m.id === activeMember.id);
          if (me) setCurrentMember(me);
        }
      });
  }, [activeMember]);

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [fetchTasks, fetchMembers]);

  const handleToggle = async (id: string, completed: boolean) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    const updated = await res.json();

    if (completed && updated.assignedTo?.points !== undefined) {
      play("task-complete");
      const task = tasks.find((t) => t.id === id);
      if (task) {
        setLastAdded(task.pointsValue);
        setTimeout(() => setLastAdded(null), 2000);
      }
    }

    fetchTasks();
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const handleAddTask = async (data: Record<string, unknown>) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchTasks();
  };

  const handleClaim = async (taskId: string) => {
    if (!activeMember) return;
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: true, memberId: activeMember.id }),
    });
    fetchTasks();
  };

  const filteredTasks = filterCategory
    ? tasks.filter((t) => t.category === filterCategory)
    : tasks;

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {isKidsMode ? "המשימות שלי" : "ניהול משימות"}
            </h1>
            {isKidsMode && currentMember && (
              <div className="mt-2">
                <PointsBadge points={currentMember.points} added={lastAdded} />
              </div>
            )}
          </div>
          {isParent && (
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              משימה חדשה
            </Button>
          )}
        </div>

        {/* Progress bar (kids mode) */}
        {isKidsMode && totalCount > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">התקדמות היום</span>
              <span className="text-sm text-text-secondary">
                {completedCount}/{totalCount}
              </span>
            </div>
            <div className="h-3 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-success"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            {completedCount === totalCount && totalCount > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-success font-bold mt-3 text-lg"
              >
                🎉 כל הכבוד! סיימת את כל המשימות!
              </motion.p>
            )}
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory(null)}
            className={cn(
              "px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0",
              !filterCategory ? "bg-accent-warm text-white" : "bg-card text-text-secondary"
            )}
          >
            הכל
          </button>
          {Object.entries(TASK_CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(filterCategory === key ? null : key)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium transition-all shrink-0",
                filterCategory === key
                  ? "bg-accent-green text-white"
                  : "bg-card text-text-secondary"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-text-secondary py-8">
                {isKidsMode ? "אין משימות שלך! 🎉" : "אין משימות עדיין"}
              </p>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task as Parameters<typeof TaskCard>[0]["task"]}
                  onToggle={handleToggle}
                  onDelete={isParent ? handleDelete : undefined}
                  isKidsMode={isKidsMode}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Shared pool section (kids mode) */}
        {isKidsMode && poolTasks.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-accent-warm" />
              <h2 className="font-bold text-lg">משימות פתוחות לקחת</h2>
              <span className="text-sm text-text-secondary">({poolTasks.length})</span>
            </div>
            <div className="space-y-2">
              {poolTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-card border-2 border-dashed border-accent-warm/30 rounded-2xl p-4"
                >
                  {task.emoji && <span className="text-2xl">{task.emoji}</span>}
                  <span className="flex-1 font-semibold">{task.title}</span>
                  <span className="text-warning font-bold text-sm">⭐ {task.pointsValue}</span>
                  <button
                    onClick={() => handleClaim(task.id)}
                    className="px-4 py-2 rounded-xl bg-accent-warm text-white text-sm font-bold hover:bg-accent-warm/80 transition-all"
                  >
                    קח!
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Parent: show all members summary */}
        {isParent && members.length > 0 && (
          <div className="mt-8 p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-warning" />
              <h2 className="font-bold">סיכום נקודות</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {members.filter(m => m.role === "child").map((m) => (
                <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m.color }}>
                    {m.name.charAt(0)}
                  </div>
                  <span className="font-medium text-sm">{m.nameHe}</span>
                  <span className="text-warning font-bold text-sm">⭐ {m.points}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMember && (
          <AddTaskModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddTask}
            createdById={activeMember.id}
          />
        )}
      </div>
    </AppShell>
  );
}
