export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  ingredients: Ingredient[] | null;
  steps: Step[] | null;
  calories: number | null;
  cooking_time: number | null;
  nutrition_facts: NutritionFacts | null;
  cuisine_type: string[] | null;
  diet_type: string[] | null;
  created_by: string | null;
  views: number | null;
  created_at: string | null;
  updated_at: string | null;
  is_favorite?: boolean;
  img?: string;
}

export interface RecipeFilters {
  cuisine_type?: string;
  max_cooking_time?: number;
  diet_type?: string[];
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Step {
  order: number;
  description: string;
}

export interface NutritionFacts {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
