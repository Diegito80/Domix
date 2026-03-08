"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Heart, Search, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeCard } from "@/components/kitchen/RecipeCard";
import { CookingMode } from "@/components/kitchen/CookingMode";

interface Recipe {
  id: string;
  title: string;
  category: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string;
  steps: string;
  tags?: string | null;
  isFavorite: boolean;
}

interface Step {
  instruction: string;
  timer?: number;
}

const CATEGORIES = [
  { key: "all", label: "הכל", emoji: "🍽️" },
  { key: "breakfast", label: "ארוחת בוקר", emoji: "🥞" },
  { key: "lunch", label: "ארוחת צהריים", emoji: "🥗" },
  { key: "dinner", label: "ארוחת ערב", emoji: "🍝" },
  { key: "dessert", label: "קינוחים", emoji: "🍰" },
  { key: "drink", label: "שתייה", emoji: "🥤" },
];

export default function KitchenPage() {
  const activeMember = useAppStore((s) => s.activeMember);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const fetchRecipes = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (showFavorites) params.set("favorite", "true");
    if (searchQuery) params.set("search", searchQuery);

    const res = await fetch(`/api/recipes?${params.toString()}`);
    const data = await res.json();
    setRecipes(data);
  }, [selectedCategory, showFavorites, searchQuery]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const toggleFavorite = async (id: string, current: boolean) => {
    await fetch(`/api/recipes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
    fetchRecipes();
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const startCooking = (recipe: Recipe) => {
    setCookingRecipe(recipe);
    setSelectedRecipe(null);
  };

  const parseSteps = (stepsJson: string): Step[] => {
    try {
      return JSON.parse(stepsJson);
    } catch {
      return [];
    }
  };

  const parseIngredients = (ingredientsJson: string): string[] => {
    try {
      return JSON.parse(ingredientsJson);
    } catch {
      return [];
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ChefHat className="w-7 h-7 text-accent-warm" />
          <h1 className="text-2xl font-bold">המטבח</h1>
          <div className="mr-auto flex gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-3 rounded-xl hover:bg-card transition-colors"
            >
              <Search className="w-5 h-5 text-text-secondary" />
            </button>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`p-3 rounded-xl transition-colors ${
                showFavorites ? "bg-red-50" : "hover:bg-card"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${showFavorites ? "fill-red-400 text-red-400" : "text-text-secondary"}`}
              />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש מתכון..."
                  className="flex-1 rounded-xl border-2 border-border focus:border-accent-warm p-3 bg-background outline-none text-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-2">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? "bg-accent-warm text-white shadow-sm"
                  : "bg-card border border-border hover:bg-background"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Recipe grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RecipeCard
                recipe={recipe}
                onSelect={handleSelectRecipe}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3">🍽️</span>
            <p className="text-text-secondary">
              {showFavorites ? "עוד לא סימנתם מועדפים" : "אין מתכונים בקטגוריה הזו"}
            </p>
          </div>
        )}

        {/* Recipe detail modal */}
        <AnimatePresence>
          {selectedRecipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
              onClick={() => setSelectedRecipe(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-card rounded-2xl shadow-lg w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedRecipe.title}</h2>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <span>⏱️ {selectedRecipe.prepTime + selectedRecipe.cookTime} דק׳</span>
                      <span>👥 {selectedRecipe.servings} מנות</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedRecipe(null)} className="p-2 rounded-xl hover:bg-background">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Ingredients */}
                <div className="mb-5">
                  <h3 className="font-bold mb-2">🥕 מצרכים</h3>
                  <ul className="space-y-1.5">
                    {parseIngredients(selectedRecipe.ingredients).map((ing, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-accent-warm mt-0.5">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Steps preview */}
                <div className="mb-5">
                  <h3 className="font-bold mb-2">📋 שלבים ({parseSteps(selectedRecipe.steps).length})</h3>
                  <ol className="space-y-2">
                    {parseSteps(selectedRecipe.steps).slice(0, 3).map((step, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="font-bold text-accent-warm shrink-0">{i + 1}.</span>
                        <span className="text-text-secondary">{step.instruction}</span>
                      </li>
                    ))}
                    {parseSteps(selectedRecipe.steps).length > 3 && (
                      <li className="text-sm text-text-secondary">
                        ...ועוד {parseSteps(selectedRecipe.steps).length - 3} שלבים
                      </li>
                    )}
                  </ol>
                </div>

                <button
                  onClick={() => startCooking(selectedRecipe)}
                  className="w-full py-4 rounded-2xl bg-accent-warm text-white font-bold text-lg hover:bg-accent-warm/90 transition-colors flex items-center justify-center gap-2"
                >
                  <ChefHat className="w-5 h-5" />
                  <span>בוא נבשל!</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cooking mode */}
        <AnimatePresence>
          {cookingRecipe && (
            <CookingMode
              recipeName={cookingRecipe.title}
              steps={parseSteps(cookingRecipe.steps)}
              onClose={() => setCookingRecipe(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
