"use client";

import { motion } from "framer-motion";
import { Clock, Users, Heart } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags?: string | null;
  isFavorite: boolean;
}

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  breakfast: "🥞",
  lunch: "🥗",
  dinner: "🍝",
  dessert: "🍰",
  drink: "🥤",
};

export function RecipeCard({ recipe, onSelect, onToggleFavorite }: RecipeCardProps) {
  const tags: string[] = recipe.tags ? JSON.parse(recipe.tags) : [];

  const TAG_LABELS: Record<string, string> = {
    quick: "מהיר",
    healthy: "בריא",
    "kids-friendly": "ידידותי לילדים",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card rounded-2xl border border-border p-5 cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onSelect(recipe)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{CATEGORY_EMOJI[recipe.category] || "🍽️"}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id, recipe.isFavorite);
          }}
          className="p-1.5 rounded-full hover:bg-background transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              recipe.isFavorite ? "fill-red-400 text-red-400" : "text-text-secondary"
            }`}
          />
        </button>
      </div>

      <h3 className="font-bold text-sm mb-3 leading-snug">{recipe.title}</h3>

      <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{recipe.prepTime + recipe.cookTime} דק׳</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{recipe.servings} מנות</span>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-accent-warm/10 text-accent-warm font-medium"
            >
              {TAG_LABELS[tag] || tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
