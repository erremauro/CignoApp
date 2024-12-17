import logger from "../logger";
import { tIngredient, tSection, tRecipe, tState } from "./types";
import { debounce, generateUUID } from "../utils";
import {
  STANDARD_UNIT,
  FRACTIONAL_UNIT,
  INGREDIENT_DENSITY
} from "./constants";
import { isValidFraction, convertToFraction, parseFraction } from "./fraction";

export class RecipeCalc {
  container: HTMLElement = document.createElement("div");
  recipe: tRecipe;
  ingredients: tIngredient[];
  state: tState;

  // User input refresh rate for the updated values
  debounceTime: number = 300;

  constructor(container: HTMLElement | null) {
    if (!container) return;

    this.container = container;
    this.init();
  }

  private init() {
    logger.debug("(RecipeCalc) initializing...");
    this.parseRecipe();
    this.renderContent();
  }

  /**
   * Read the container's YAML content as text, cleanse it and
   * initilize the internal recipe reference and state
   */
  private parseRecipe() {
    const { textContent } = this.container;
    if (!textContent) return;

    const lines = textContent.split("\n").map((line) => line.trim());
    const recipe: Partial<tRecipe> = {
      title: "",
      servings: 0,
      ingredients: [],
    };
    const ingredientMap: Record<string, Omit<tIngredient, "uuid">> = {};
    this.ingredients = [];

    let currentSection: Partial<tSection> | null = null;

    lines.forEach((line) => {
      if (line.startsWith("# ")) {
        recipe.title = line.slice(2).trim();
      } else if (line.startsWith("servings: ")) {
        recipe.servings = parseInt(line.split(":")[1].trim(), 10);
      } else if (line.startsWith("## ")) {
        if (currentSection)
          recipe.ingredients!.push(currentSection as tSection);
        currentSection = { section: line.slice(3).trim(), items: [] };
      } else if (line.startsWith("- ") && currentSection) {
        const match = line.match(/- \"(.+?)\" (\d+(?:\/\d+)?|q\.b\.)?(\D+)?/);
        if (match) {
          const [, name, value, unit] = match;
          const uuid = generateUUID();
          let numericValue = 0;
          let finalUnit = unit || "";

          if (value) {
            if (value.includes("/")) {
              numericValue = parseFraction(value);
            } else if (!isNaN(Number(value))) {
              numericValue = Number(value);
            } else {
              finalUnit = value + (unit ? unit : "");
            }
          }

          const item = {
            name,
            value: numericValue,
            unit: finalUnit,
            uuid,
          };

          currentSection.items!.push(item);
          this.ingredients.push(item);
          ingredientMap[uuid] = {
            name: item.name,
            value: item.value,
            unit: item.unit,
          };
        }
      }
    });

    if (currentSection) recipe.ingredients!.push(currentSection);

    this.recipe = recipe as tRecipe;
    this.state = {
      servings: this.recipe.servings,
      ingredients: ingredientMap,
    };
  }

  /**
   * Creates the Recipe Calculator UI from the data
   */
  private renderContent() {
    this.container.innerHTML = "";

    // Render People/Servings Container
    const peopleContainer = document.createElement("div");
    peopleContainer.classList.add("people-container");

    const peopleLabel: HTMLElement = document.createElement("label");
    peopleLabel.setAttribute("for", "people");
    peopleLabel.innerHTML = "People";

    const peopleInput: HTMLInputElement = document.createElement("input");
    peopleInput.setAttribute("id", "people");
    peopleInput.setAttribute("name", "people");
    peopleInput.setAttribute("type", "number");
    peopleInput.setAttribute("min", "1");
    peopleInput.setAttribute("value", String(this.recipe.servings));

    peopleContainer.appendChild(peopleLabel);
    peopleContainer.appendChild(peopleInput);

    this.container.appendChild(peopleContainer);

    // Render Each Section
    this.recipe.ingredients.forEach((ingredient: tSection) => {
      const tableCaption: HTMLElement = document.createElement("caption");
      tableCaption.innerHTML = ingredient.section;

      const sectionTable: HTMLTableElement = document.createElement("table");
      sectionTable.classList.add("ingredient-table");

      // Render Each Ingredient per Section
      ingredient.items.forEach((item: tIngredient) => {
        const row = sectionTable.insertRow(-1);
        const labelCell: HTMLTableCellElement = row.insertCell(0);
        const amountCell: HTMLTableCellElement = row.insertCell(1);

        labelCell.innerHTML = item.name;

        if (item.value === 0 && item.unit === "q.b.") {
          amountCell.innerText = "q.b.";
          return;
        }

        let inputElement: HTMLElement;

        if (FRACTIONAL_UNIT.includes(item.unit)) {
          // Usa createFractionInput, che già include l'unità e la conversione
          inputElement = this.createFractionInput(item);
        } else {
          // Crea input numerico standard
          inputElement = this.createNumericInput(item);

          // Aggiungi unità manualmente solo per gli input numerici
          const unitSpan = document.createElement("span");
          unitSpan.classList.add("unit-label");
          unitSpan.innerText = item.unit || "";

          const inputWrapper = document.createElement("div");
          inputWrapper.classList.add("input-with-unit");
          inputWrapper.appendChild(inputElement);
          inputWrapper.appendChild(unitSpan);

          inputElement = inputWrapper;
        }

        amountCell.appendChild(inputElement);
      });

      sectionTable.appendChild(tableCaption);
      this.container.appendChild(sectionTable);
    });

    this.attachInputListeners();
  }

  private attachInputListeners() {
    this.container.addEventListener(
      "input",
      debounce((event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target.id === "people") {
          this.updateServings(target);
        } else if (target.classList.contains("quantity")) {
          this.updateQuantities(target);
        }
      }, this.debounceTime),
    );
  }

  private updateQuantitiesBase(uuid: string, value: number) {
    const currIngredient = this.state.ingredients[uuid];
    if (!currIngredient) {
      throw new Error(`Ingredient with uuid "${uuid}" not found!`);
    }

    // Calcola il rapporto tra il nuovo valore e il valore originale
    const proportion = value / currIngredient.value;

    this.ingredients.forEach((ingredient) => {
      if (ingredient.value === 0 || isNaN(ingredient.value)) return;

      const newValue =
        this.state.ingredients[ingredient.uuid].value * proportion;
      this.state.ingredients[ingredient.uuid].value = newValue;

      this.updateInputElement(ingredient, newValue);
    });
  }

  private updateQuantities(elem: HTMLInputElement) {
    const newValue = Number(elem.value);
    if (newValue <= 0 || isNaN(newValue)) return;

    this.updateQuantitiesBase(elem.id, newValue);
  }

  private updateQuantitiesFromFraction(uuid: string, fractionValue: number) {
    if (isNaN(fractionValue) || fractionValue <= 0) return;

    this.updateQuantitiesBase(uuid, fractionValue);
  }

  private updateServings(elem: HTMLInputElement) {
    const newNumberOfServings: number = Number(elem.value);

    if (newNumberOfServings === this.state.servings) return;

    this.state.servings = newNumberOfServings;

    this.ingredients.forEach((item) => {
      const newValue =
        (item.value * newNumberOfServings) / this.recipe.servings;
      this.state.ingredients[item.uuid].value = newValue;

      const inputElem = document.getElementById(item.uuid) as HTMLInputElement;
      if (inputElem) {
        if (FRACTIONAL_UNIT.includes(item.unit)) {
          inputElem.value = convertToFraction(newValue);

          // Aggiorna conversione densità
          const conversionElem = inputElem.nextElementSibling as HTMLElement;
          conversionElem.innerText = this.formatUnitAndDensity(
            item.name,
            newValue,
            item.unit,
          );
        } else {
          inputElem.value = String(Math.round(newValue));
        }
      }
    });
  }

  private updateInputElement(ingredient: tIngredient, newValue: number) {
    const inputElem = document.getElementById(
      ingredient.uuid,
    ) as HTMLInputElement;

    if (inputElem) {
      if (FRACTIONAL_UNIT.includes(ingredient.unit)) {
        inputElem.value = convertToFraction(newValue);

        // Aggiorna conversione densità
        const conversionElem = inputElem.nextElementSibling as HTMLElement;
        conversionElem.innerText = this.formatUnitAndDensity(
          ingredient.name,
          newValue,
          ingredient.unit,
        );
      } else {
        inputElem.value = String(Math.round(newValue));
      }
    }
  }

  private createNumericInput(item: tIngredient): HTMLInputElement {
    const amountInput: HTMLInputElement = document.createElement("input");
    amountInput.classList.add("quantity");
    amountInput.setAttribute("id", item.uuid);
    amountInput.setAttribute("value", String(item.value));
    amountInput.setAttribute("type", "number");
    amountInput.setAttribute("min", "0");
    return amountInput;
  }

  private createFractionInput(item: tIngredient): HTMLElement {
    const fractionInput: HTMLInputElement = document.createElement("input");
    fractionInput.classList.add("fraction");
    fractionInput.setAttribute("id", item.uuid);
    fractionInput.setAttribute("value", convertToFraction(item.value));
    fractionInput.setAttribute("type", "text");

    let prevValue = fractionInput.value;

    // Span per unità e conversione
    const equivalentSpan = document.createElement("span");
    equivalentSpan.classList.add("conversion-label");
    equivalentSpan.innerText = this.formatUnitAndDensity(
      item.name,
      item.value,
      item.unit,
    );

    // Validates the fraction input
    fractionInput.addEventListener(
      "input",
      debounce(() => {
        if (isValidFraction(fractionInput.value)) {
          fractionInput.classList.remove("invalid");
          const numericValue = parseFraction(fractionInput.value);

          // Aggiorna la conversione in grammi/ml
          equivalentSpan.innerText = this.formatUnitAndDensity(
            item.name,
            numericValue,
            item.unit,
          );

          // Propaga il valore aggiornato agli altri ingredienti
          this.updateQuantitiesFromFraction(item.uuid, numericValue);
        } else {
          fractionInput.classList.add("invalid");
          equivalentSpan.innerText = "";
        }
      }, this.debounceTime),
    );

    // Confirm or Restore the original value if the input was invalid
    fractionInput.addEventListener(
      "blur",
      debounce(() => {
        if (fractionInput.classList.contains("invalid")) {
          fractionInput.value = prevValue;
          equivalentSpan.innerText = this.formatUnitAndDensity(
            item.name,
            parseFraction(prevValue),
            item.unit,
          );
          fractionInput.classList.remove("invalid");
        } else {
          prevValue = fractionInput.value;
        }
      }, this.debounceTime),
    );

    const wrapper = document.createElement("div");
    wrapper.classList.add("input-with-unit");

    wrapper.appendChild(fractionInput);
    wrapper.appendChild(equivalentSpan);

    return wrapper;
  }

  private formatUnitAndDensity(
    name: string,
    value: number,
    unit: string,
  ): string {
    const equivalent = this.calculateGramEquivalent(name, value, unit);
    return equivalent ? `${unit} (~${equivalent})` : unit;
  }

  private calculateGramEquivalent(
    name: string,
    value: number,
    unit: string,
  ): string | null {
    // Trova la densità con ricerca parziale
    const densityEntry = Object.entries(INGREDIENT_DENSITY).find(([key]) =>
      name.toLowerCase().includes(key),
    );

    if (!densityEntry) return null;

    const [, densityInfo] = densityEntry;

    let volumeInMl = 0;
    switch (unit) {
      case "cucchiaio":
        volumeInMl = value * 15; // 1 cucchiaio = 15 ml
        break;
      case "cucchiaino":
        volumeInMl = value * 5; // 1 cucchiaino = 5 ml
        break;
      case "tazza":
        volumeInMl = value * 240; // 1 tazza = 240 ml
        break;
      default:
        return null;
    }

    const weightInGrams = volumeInMl * densityInfo.density;

    return `${Math.round(weightInGrams)}g`;
  }
}

export function renderRecipeCalc() {
  const containerAll = document.querySelectorAll<HTMLElement>(".recipe-calc");
  if (containerAll.length === 0) {
    logger.info(`(RecipeCalc) no recipe calculator found.`);
    return;
  }

  logger.success(`(RecipeCalc) creating recipe calculators...`);

  containerAll.forEach((container) => {
    new RecipeCalc(container);
  });
}
