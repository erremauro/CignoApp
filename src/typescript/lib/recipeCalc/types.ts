export type tIngredient = {
  uuid: string;
  name: string;
  value: number;
  unit: string;
};

export type tSection = {
  section: string;
  items: tIngredient[];
};

export type tRecipe = {
  title: string;
  servings: number;
  ingredients: tSection[];
};

export type tState = {
  servings: number;
  ingredients: Record<string, Omit<tIngredient, "uuid">>;
};
