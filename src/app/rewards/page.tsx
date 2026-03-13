"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, ShoppingBag, CheckCircle, Clock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { RewardCard } from "@/components/rewards/RewardCard";
import { RedemptionModal } from "@/components/rewards/RedemptionModal";
import { Leaderboard } from "@/components/rewards/Leaderboard";
import { RewardAdminPanel } from "@/components/rewards/RewardAdminPanel";
import { useAudioFeedback } from "@/lib/hooks/useAudioFeedback";

interface Reward {
  id: string;
  name: string;
  nameEn?: string | null;
  emoji: string;
  pointsCost: number;
  category: string;
}

interface Member {
  id: string;
  name: string;
  nameHe: string;
  color: string;
  points: number;
  role: string;
}

interface Redemption {
  id: string;
  status: string;
  createdAt: string;
  reward: { name: string; emoji: string; pointsCost: number };
  member: { id: string; nameHe: string };
}

const CATEGORY_TABS = [
  { key: "all", label: "הכל", emoji: "🎁" },
  { key: "small", label: "קטן", emoji: "🍬" },
  { key: "medium", label: "בינוני", emoji: "🎮" },
  { key: "large", label: "גדול", emoji: "🎯" },
  { key: "epic", label: "אפי!", emoji: "🌟" },
];

export default function RewardsPage() {
  const activeMember = useAppStore((s) => s.activeMember);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<Redemption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);

  const { play } = useAudioFeedback();
  const isParent = activeMember?.role === "parent";

  const fetchData = useCallback(async () => {
    const [rewardsRes, membersRes] = await Promise.all([
      fetch("/api/rewards"),
      fetch("/api/members"),
    ]);
    const rewardsData = await rewardsRes.json();
    const membersData = await membersRes.json();
    setRewards(rewardsData);
    setMembers(membersData);

    if (activeMember) {
      const me = membersData.find((m: Member) => m.id === activeMember.id);
      if (me) setCurrentPoints(me.points);
    }
  }, [activeMember]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch pending redemptions for parents
  useEffect(() => {
    if (isParent) {
      fetch("/api/rewards/approve/pending")
        .then((r) => {
          if (r.ok) return r.json();
          return [];
        })
        .then(setPendingRedemptions)
        .catch(() => setPendingRedemptions([]));
    }
  }, [isParent]);

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setShowModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !activeMember) return;

    const res = await fetch("/api/rewards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: activeMember.id, rewardId: selectedReward.id }),
    });

    if (res.ok) {
      play("reward-redeem");
      setShowModal(false);
      setSelectedReward(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchData();
    }
  };

  const handleApprove = async (redemptionId: string, status: "approved" | "rejected") => {
    await fetch(`/api/rewards/approve/${redemptionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // Refresh pending list
    const res = await fetch("/api/rewards/approve/pending");
    if (res.ok) {
      setPendingRedemptions(await res.json());
    }
    fetchData();
  };

  const filteredRewards =
    selectedCategory === "all"
      ? rewards
      : rewards.filter((r) => r.category === selectedCategory);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-7 h-7 text-accent-warm" />
          <h1 className="text-2xl font-bold">חנות הפרסים</h1>
          {!isParent && (
            <div className="mr-auto flex items-center gap-2 bg-warning/10 rounded-full px-4 py-2">
              <span className="text-lg">⭐</span>
              <span className="font-bold text-warning">{currentPoints.toLocaleString()}</span>
              <span className="text-sm text-text-secondary">נקודות</span>
            </div>
          )}
        </div>

        {/* Success animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-accent-green/10 border border-accent-green/30 rounded-2xl p-4 mb-6 flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6 text-accent-green" />
              <div>
                <p className="font-bold text-accent-green">הבקשה נשלחה!</p>
                <p className="text-sm text-text-secondary">ממתין לאישור ההורים 🎉</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending approvals for parents */}
        {isParent && pendingRedemptions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-accent-warm" />
              <h2 className="font-bold text-lg">ממתינים לאישור ({pendingRedemptions.length})</h2>
            </div>
            <div className="space-y-3">
              {pendingRedemptions.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4"
                >
                  <span className="text-3xl">{r.reward.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">{r.reward.name}</p>
                    <p className="text-sm text-text-secondary">
                      {r.member.nameHe} • ⭐ {r.reward.pointsCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(r.id, "rejected")}
                      className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold text-sm hover:bg-red-200 transition-colors"
                    >
                      דחייה
                    </button>
                    <button
                      onClick={() => handleApprove(r.id, "approved")}
                      className="px-4 py-2 rounded-xl bg-accent-green/10 text-accent-green font-semibold text-sm hover:bg-accent-green/20 transition-colors"
                    >
                      אישור ✓
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main rewards area */}
          <div className="lg:col-span-2">
            {/* Category tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === tab.key
                      ? "bg-accent-warm text-white shadow-sm"
                      : "bg-card border border-border hover:bg-background"
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Reward grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredRewards.map((reward, i) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <RewardCard
                      reward={reward}
                      currentPoints={currentPoints}
                      onRedeem={handleRedeem}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredRewards.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
                <p className="text-text-secondary">אין פרסים בקטגוריה הזו</p>
              </div>
            )}
          </div>

          {/* Sidebar - Leaderboard + Admin Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Leaderboard members={members} />
            {isParent && (
              <RewardAdminPanel rewards={rewards} onRefresh={fetchData} />
            )}
          </div>
        </div>

        {/* Redemption modal */}
        <RedemptionModal
          isOpen={showModal}
          reward={selectedReward}
          currentPoints={currentPoints}
          onConfirm={handleConfirmRedeem}
          onClose={() => {
            setShowModal(false);
            setSelectedReward(null);
          }}
        />
      </div>
    </AppShell>
  );
}
