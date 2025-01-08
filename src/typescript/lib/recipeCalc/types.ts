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

export type tServings = {
  value: number,
  unit: string
}

export type tRecipe = {
  title: string;
  servings: tServings;
  ingredients: tSection[];
};

export type tState = {
  servings: tServings;
  ingredients: Record<string, Omit<tIngredient, "uuid">>;
};
