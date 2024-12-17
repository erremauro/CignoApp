export const STANDARD_UNIT: ReadonlyArray<string> = ["g", "kg", "ml", "l"];
export const FRACTIONAL_UNIT: ReadonlyArray<string> = ["cucchiaino", "cucchiaio", "tazza"];
export const INGREDIENT_DENSITY: Readonly<
  Record<string, { category: "solid" | "liquid"; density: number }>
> = {
  // Liquidi
  olio: { category: "liquid", density: 0.92 }, // 0.92 g/ml (olio di oliva)
  latte: { category: "liquid", density: 1.03 }, // 1.03 g/ml
  acqua: { category: "liquid", density: 1.0 }, // 1.00 g/ml
  miele: { category: "liquid", density: 1.42 }, // 1.42 g/ml

  // Solidi
  farina: { category: "solid", density: 0.53 }, // 0.53 g/ml (farina 00)
  zucchero: { category: "solid", density: 0.85 }, // 0.85 g/ml
  sale: { category: "solid", density: 1.2 }, // 1.20 g/ml
  riso: { category: "solid", density: 0.85 }, // 0.85 g/ml
  cacao: { category: "solid", density: 0.5 }, // 0.5 g/ml
};
