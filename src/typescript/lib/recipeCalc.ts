import jsYaml from "js-yaml";
import logger from "./logger";
import { generateUUID } from "./helpers";

type tIngredient = {
  uuid: string;
  name: string;
  value: number;
  unit: string;
};

type tSection = {
  section: string;
  items: tIngredient[];
};

type tRecipe = {
  title: string;
  servings: number;
  ingredients: tSection[];
};

type tState = {
  servings: number;
  ingredients: Record<string, Omit<tIngredient, "uuid">>;
};

export class RecipeCalc {
  container: HTMLElement = document.createElement("div");
  recipe: tRecipe;
  ingredients: tIngredient[];
  state: tState;

  // User input refresh rate for the updated values
  debounceTimeout: number | undefined;
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
    const htmlText = this.container.textContent;
    if (!htmlText) return;

    // Clean HTML text from tabs characters (yaml only read spaces)
    const cleanedYaml = htmlText.replace(/\t/g, "  ");

    const recipe = jsYaml.load(cleanedYaml) as tRecipe;

    // Create the internal recipe reference and
    // initilize each ingredient's uuid
    this.recipe = {
      ...recipe,
      ingredients: recipe.ingredients.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          uuid: generateUUID(),
        })),
      })),
    };

    // Map the Recipe to the internal state
    const ingredientMap: Record<string, Omit<tIngredient, "uuid">> = {};

    this.recipe.ingredients.forEach((section) => {
      section.items.forEach((item) => {
        ingredientMap[item.uuid] = {
          name: item.name,
          value: item.value,
          unit: item.unit,
        };
      });
    });

    this.ingredients = this.recipe.ingredients.flatMap(
      (section) => section.items,
    );

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

    // Render the Servings Input in the Application
    this.container.appendChild(peopleContainer);

    // Creates the sections
    this.recipe.ingredients.forEach((ingredient: tSection) => {
      const tableCaption: HTMLElement = document.createElement("caption");
      tableCaption.innerHTML = ingredient.section;

      const sectionTable: HTMLTableElement = document.createElement("table");
      sectionTable.classList.add("ingredient-table");

      ingredient.items.forEach((item: tIngredient) => {
        const row = sectionTable.insertRow(0);
        const labelCell: HTMLTableCellElement = row.insertCell(0);
        const amountCell: HTMLTableCellElement = row.insertCell(1);

        labelCell.innerHTML = item.name;

        const validMeasure = ["g", "kg", "ml", "l"];

        if (validMeasure.includes(item.unit)) {
          const amountInput: HTMLInputElement = document.createElement("input");
          amountInput.classList.add("quantity");
          amountInput.setAttribute("id", item.uuid);
          amountInput.setAttribute("value", String(item.value));
          amountInput.setAttribute("type", "number");
          amountInput.setAttribute("min", "0");
          amountCell.appendChild(amountInput);
        } else {
          amountCell.innerHTML += item.value;
        }

        amountCell.innerHTML += ` ${item.unit}`;
      });

      sectionTable.appendChild(tableCaption);

      // Render the Section with each ingredient item in the Application
      this.container.appendChild(sectionTable);
    });

    // Attach the Event Listener to the Servings Input Controller
    const people = document.getElementById("people") as HTMLInputElement;
    if (people) {
      people.addEventListener(
        "input",
        this.debounce((event: Event) => {
          this.updateServings(event.target as HTMLInputElement);
        }, this.debounceTime),
      );
    }

    // Attach the Event Listener to the Ingredients Quantity Input Controller
    const quantities = document.querySelectorAll<HTMLInputElement>(".quantity");
    quantities.forEach((q) => {
      q.addEventListener(
        "input",
        this.debounce((event: Event) => {
          this.updateQuantities(event.target as HTMLInputElement);
        }, this.debounceTime),
      );
    });
  }

  private updateQuantities(elem: HTMLInputElement) {
    logger.debug("(RecipeCalc) updatingQuantities for Element ID: " + elem.id);
    const currIngredient = this.state.ingredients[elem.id];

    if (!currIngredient) {
      throw new Error(`Ingredient with uuid "${elem.id} not found!"`);
    }

    logger.debug(`${currIngredient.name} = ${currIngredient.value}`);

    const currValue = Number(elem.value);
    const proportion = currValue / currIngredient.value;

    for (let i = 0; i < this.ingredients.length; i++) {
      const curr: tIngredient = this.ingredients[i];
      if (curr.value === 0 || isNaN(curr.value)) continue;

      const newValue = this.state.ingredients[curr.uuid].value * proportion;
      this.state.ingredients[curr.uuid].value = newValue;
      this.ingredients[i].value = newValue / this.state.servings;
      
      const inputElem = document.getElementById(curr.uuid) as HTMLInputElement;
      if (!inputElem) return;
      
      inputElem.value = String(Math.round(newValue));
    }
  }

  private updateServings(elem: HTMLInputElement) {
    logger.debug("(RecipeCalc) updating servings...");
    const newNumberOfServings: number = Number(elem.value);

    if (newNumberOfServings === this.state.servings) return;

    this.state.servings = newNumberOfServings;

    this.ingredients.forEach((item) => {
      const newValue = item.value * newNumberOfServings;
      this.state.ingredients[item.uuid].value = newValue;
      const inputElem = document.getElementById(item.uuid) as HTMLInputElement;
      if (!inputElem) return;
      inputElem.value = String(Math.round(newValue));
    });
  }

  private debounce<F extends (...args: any[]) => void>(func: F, delay: number) {
    let timeoutId: number | null = null;

    return (...args: Parameters<F>) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  private findIngredient(uuid: string): tIngredient | null {
    const ingredient = this.ingredients.find((item) => item.uuid === uuid);
    if (ingredient) {
      return ingredient;
    }
    return null;
  }

  private updateIngredientValue(uuid: string, newValue: number): boolean {
    if (!this.state.ingredients[uuid]) {
      throw new Error(
        `Could not find and ingredient with uuid ${uuid} in the state`,
      );
    }

    this.state.ingredients[uuid].value = newValue;
    return true;
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
