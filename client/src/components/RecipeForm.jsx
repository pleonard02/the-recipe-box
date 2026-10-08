import { useState } from "react";
import { API_URL } from "../config/api";

function createIngredient() {
  return { name: "", quantity: "", unit: "" };
}

const emptyRecipe = {
  name: "",
  description: "",
  image: "",
  ingredients: [createIngredient()],
  instructions: "",
  prepTime: "",
  cookTime: "",
  servings: "",
  isPublic: false,
};

function RecipeForm({ onClose, token, onRecipeCreated, editingRecipe }) {
  const [recipe, setRecipe] = useState(() => ({
    ...emptyRecipe,
    ...editingRecipe,
    ...Object.fromEntries(["prepTime", "cookTime", "servings"].map((field) => [
      field,
      Array.isArray(editingRecipe?.[field])
        ? editingRecipe[field][0] ?? ""
        : editingRecipe?.[field] ?? "",
    ])),
    ingredients: editingRecipe?.ingredients?.length
      ? editingRecipe.ingredients
      : [createIngredient()],
  }));
  const [formError, setFormError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleIngredientChange(index, field, value) {
    setRecipe((currentRecipe) => {
      const updatedIngredients = [...currentRecipe.ingredients];

      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value,
      };

      return {
        ...currentRecipe,
        ingredients: updatedIngredients,
      };
    });
  }

  function handleAddIngredient() {
    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      ingredients: [...currentRecipe.ingredients, createIngredient()],
    }));
  }

  function handleRemoveIngredient(indexToRemove) {
    setRecipe((currentRecipe) => {
      if (currentRecipe.ingredients.length === 1) {
        return {
          ...currentRecipe,
          ingredients: [createIngredient()],
        };
      }

      return {
        ...currentRecipe,
        ingredients: currentRecipe.ingredients.filter(
          (_, index) => index !== indexToRemove,
        ),
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const hasValidIngredient = recipe.ingredients.some(
      (ingredient) =>
        ingredient.name?.trim(),
    );

    if (
      !recipe.name.trim() ||
      !recipe.instructions.trim() ||
      !hasValidIngredient
    ) {
      setFormError(
        "Please enter a recipe name, at least one ingredient, and instructions before saving.",
      );
      return;
    }

    const validNumber = (value, minimum) =>
      value === "" || (Number.isFinite(Number(value)) && Number(value) >= minimum);
    if (
      !validNumber(recipe.prepTime, 0) ||
      !validNumber(recipe.cookTime, 0) ||
      !validNumber(recipe.servings, 1) ||
      recipe.ingredients.some((ingredient) => !validNumber(ingredient.quantity, 0))
    ) {
      setFormError("Enter nonnegative times and quantities, and at least one serving.");
      return;
    }

    try {
      let imageUrl = recipe.image || "";

      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const uploadResponse = await fetch(`${API_URL}/api/upload/recipe-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Image upload failed.");
        }

        imageUrl = uploadData.image;
      }

      const recipeData = {
        ...recipe,
        image: imageUrl,
        prepTime: Number(recipe.prepTime),
        cookTime: Number(recipe.cookTime),
        servings: Number(recipe.servings),
        ingredients: recipe.ingredients.filter((ingredient) => ingredient.name?.trim()).map((ingredient) => ({
          ...ingredient,
          quantity: Number(ingredient.quantity),
        })),
      };

      const url = editingRecipe
        ? `${API_URL}/api/recipe/${editingRecipe._id}`
        : `${API_URL}/api/recipe`;

      const method = editingRecipe ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create recipe.");
      }

      console.log("Recipe created:", data);
      setRecipe(emptyRecipe);
      onRecipeCreated?.();
      onClose();
    } catch (error) {
      console.error("Create recipe error:", error);
      setFormError(error.message || "Could not create recipe.");
    }
  }

  return (
    <section className="recipe-form-panel mx-auto max-w-3xl rounded-[28px] border border-[#dbe3e6] bg-[#fffdf7] px-6 py-8 shadow-[0_20px_60px_rgba(13,86,134,0.08)] sm:px-8">
      <form onSubmit={handleSubmit} noValidate className="recipe-form">
        <div className="recipe-form-header flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
              THE RECIPE BOX
            </p>
            <h2 className="text-3xl font-semibold text-[#0d5686]">
              Add a Recipe
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-[#0d5686]"
            htmlFor="name"
          >
            Recipe Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={recipe.name}
            onChange={handleChange}
            placeholder="e.g. Lemon Herb Pasta"
            className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-[#0d5686]"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            rows={3}
            placeholder="Tell people what makes this recipe special..."
            className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="image"
            className="block text-sm font-semibold text-[#0d5686]"
          >
            Recipe Photo
          </label>

          <input
            id="image"
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setSelectedImage(event.target.files?.[0] || null);
            }}
            className="w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-[#0d5686]"
              htmlFor="prepTime"
            >
              Prep Time
            </label>
            <input
              id="prepTime"
              type="number"
              name="prepTime"
              value={recipe.prepTime}
              onChange={handleChange}
              min="0"
              className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-[#0d5686]"
              htmlFor="cookTime"
            >
              Cook Time
            </label>
            <input
              id="cookTime"
              type="number"
              name="cookTime"
              value={recipe.cookTime}
              onChange={handleChange}
              min="0"
              className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-[#0d5686]"
              htmlFor="servings"
            >
              Servings
            </label>
            <input
              id="servings"
              type="number"
              name="servings"
              value={recipe.servings}
              onChange={handleChange}
              min="1"
              className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            />
          </div>
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-[#dbe3e6] bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <legend className="text-sm font-semibold text-[#0d5686]">
              Ingredients
            </legend>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="btn btn-accent btn-sm"
            >
              + Add ingredient
            </button>
          </div>

          {recipe.ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-[#edf2f4] bg-[#fffdf7] p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient.name ?? ""}
                onChange={(event) =>
                  handleIngredientChange(index, "name", event.target.value)
                }
                className="w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-3 py-2.5 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
              />

              <input
                type="number"
                placeholder="Qty"
                value={ingredient.quantity ?? ""}
                onChange={(event) =>
                  handleIngredientChange(index, "quantity", event.target.value)
                }
                min="0"
                className="w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-3 py-2.5 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
              />

              <input
                type="text"
                placeholder="Unit"
                value={ingredient.unit ?? ""}
                onChange={(event) =>
                  handleIngredientChange(index, "unit", event.target.value)
                }
                className="w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-3 py-2.5 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
              />

              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="btn btn-secondary btn-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </fieldset>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-[#0d5686]"
            htmlFor="instructions"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            rows={5}
            placeholder="Write the steps for making this recipe..."
            className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-[#0d5686]">
          <input
            type="checkbox"
            name="isPublic"
            checked={recipe.isPublic}
            onChange={handleChange}
            className="h-4 w-4 rounded border-[#dbe3e6] text-[#1677b8] focus:ring-[#1677b8]"
          />
          Make this recipe public
        </label>

        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-medium text-[#9b2424]"
          >
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Save Recipe
          </button>
        </div>
      </form>
    </section>
  );
}

export default RecipeForm;
