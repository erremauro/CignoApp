export function isValidFraction(value: string): boolean {
  return /^\d+\/\d+$/.test(value) || /^\d+$/.test(value);
}

export function parseFraction(value: string): number {
  if (/^\d+\/\d+$/.test(value)) {
    const [numerator, denominator] = value.split("/").map(Number);
    return numerator / denominator;
  } else if (/^\d+$/.test(value)) {
    return Number(value); // Se è un numero intero
  }
  return NaN;
}

export function convertToFraction(value: number): string {
  const fractions = [
    { decimal: 0.125, fraction: "1/8" },
    { decimal: 0.25, fraction: "1/4" },
    { decimal: 0.333, fraction: "1/3" },
    { decimal: 0.5, fraction: "1/2" },
    { decimal: 0.666, fraction: "2/3" },
    { decimal: 0.75, fraction: "3/4" },
    { decimal: 0.875, fraction: "7/8" },
  ];

  if (value >= 1) return String(Math.round(value)); // Restituisce numeri interi

  const closestFraction = fractions.reduce((prev, curr) =>
    Math.abs(curr.decimal - value) < Math.abs(prev.decimal - value)
      ? curr
      : prev,
  );

  return closestFraction.fraction;
}