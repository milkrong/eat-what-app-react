export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export interface Step {
  order: number;
  description: string;
  image_url?: string;
}

export interface NutritionFacts {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_time: number;
  calories: number;
  servings: number;
  nutrition_facts: NutritionFacts;
  ingredients: Ingredient[];
  steps: Step[];
  images: string[];
  is_favorite?: boolean;
  related_recipes?: string[];
}
