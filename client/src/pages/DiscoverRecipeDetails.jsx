import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { mealDbApi } from "../services/mealDbApi";
import { useAuth } from "../context/useAuth";
import { useState } from "react";
import { API_URL } from "../config/api";

function DiscoverRecipeDetails() {
  const { mealId } = useParams();

  const { token } = useAuth();
  const [savedFavorite, setSavedFavorite] = useState(null);
  const [favoriteError, setFavoriteError] = useState("");
  const [isFavoriteUpdating, setIsFavoriteUpdating] = useState(false);

  const { data, isLoading, error } = useFetch(mealDbApi.getById(mealId));

  const { data: savedRecipeData, refetch: refetchSavedRecipes } = useFetch(
    `${API_URL}/api/recipe`,
    token,
  );

  const savedRecipes = savedRecipeData?.recipes || [];

  const existingSavedRecipe = savedRecipes.find(
    (recipe) => recipe.source === "mealdb" && recipe.externalId === mealId,
  );

  const activeSavedRecipe = savedFavorite?.externalId === mealId
    ? savedFavorite
    : existingSavedRecipe;

  if (isLoading) {
    return (
      <main className="main">
        <p>Loading recipe...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <p>Could not load recipe.</p>
      </main>
    );
  }

  const meal = data?.meals?.[0];

  if (!meal) {
    return (
      <main className="main">
        <p>Recipe not found.</p>
      </main>
    );
  }

  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measurement = meal[`strMeasure${i}`];

    if (ingredient?.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measurement: measurement?.trim() || "",
      });
    }
  }

  async function handleFavorite() {
    if (isFavoriteUpdating) {
      return;
    }

    setIsFavoriteUpdating(true);

    try {
      setFavoriteError("");

      if (activeSavedRecipe) {
        const response = await fetch(
          `${API_URL}/api/recipe/${activeSavedRecipe._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isFavorite: !activeSavedRecipe.isFavorite }),
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Could not update favorite.");
        }
        setSavedFavorite(result.recipe);
        refetchSavedRecipes();
        return;
      }

      const recipeIngredients = ingredients.map((item) => ({
        name: item.ingredient,
        quantity: null,
        unit: item.measurement,
      }));

      const response = await fetch(`${API_URL}/api/recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: meal.strMeal,
          description: `${meal.strArea || ""} ${meal.strCategory || ""}`.trim(),
          image: meal.strMealThumb || "",
          category: meal.strCategory || "",
          cuisine: meal.strArea || "",
          source: "mealdb",
          externalId: meal.idMeal,
          ingredients: recipeIngredients,
          instructions: meal.strInstructions,
          isFavorite: true,
          isPublic: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not add recipe to favorites.");
      }

      const createdRecipe = result.recipe || result;
      if (!createdRecipe._id) {
        throw new Error(
          "Recipe was created, but its ID was missing from the response.",
        );
      }

      setSavedFavorite({ ...createdRecipe, isFavorite: true });
      refetchSavedRecipes();
    } catch (error) {
      console.error("Favorite recipe error:", error);
      setFavoriteError(error.message);
    } finally {
      setIsFavoriteUpdating(false);
    }
  }

  return (
    <main className="main min-h-screen bg-[#fffefa] px-6 py-10">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-2xl border-t-8 border-[#f4c542] bg-white shadow-lg">
        <header className="grid gap-8 border-b border-[#dbe3e6] p-8 md:grid-cols-[1fr_16rem] md:items-center">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
                RECIPE INSPIRATION
              </p>

              <button
                type="button"
                onClick={handleFavorite}
                disabled={isFavoriteUpdating}
                aria-busy={isFavoriteUpdating}
                aria-label={
                  activeSavedRecipe?.isFavorite
                    ? `Remove ${meal.strMeal} from favorites`
                    : `Add ${meal.strMeal} to favorites`
                }
                aria-pressed={activeSavedRecipe?.isFavorite}
                className={`btn ${activeSavedRecipe?.isFavorite ? "btn-accent" : "btn-secondary"}`}
              >
                <span className="text-2xl leading-none">
                  {activeSavedRecipe?.isFavorite ? "♥" : "♡"}
                </span>

                {activeSavedRecipe?.isFavorite
                  ? "Remove from Favorites"
                  : "Add to Favorites"}
              </button>
            </div>

            {favoriteError && (
              <p className="mt-3 text-sm text-red-500">{favoriteError}</p>
            )}

            <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#0d5686]">
              {meal.strMeal}
            </h1>

            <div className="mt-5 flex flex-wrap gap-3">
              {meal.strCategory && (
                <span className="rounded-full bg-[#fff3a6] px-4 py-2 text-sm font-semibold text-[#0d5686]">
                  {meal.strCategory}
                </span>
              )}

              {meal.strArea && (
                <span className="rounded-full bg-[#edf6fa] px-4 py-2 text-sm font-semibold text-[#1677b8]">
                  {meal.strArea}
                </span>
              )}
            </div>
          </div>

          <div className="mx-auto w-full max-w-64 rotate-1 rounded-xl border-8 border-white bg-white shadow-md md:mx-0">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="aspect-square w-full rounded-lg object-cover"
            />
          </div>
        </header>

        <div className="grid gap-10 p-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)]">
          <section>
            <h2 className="border-b-4 border-[#f4c542] pb-3 text-2xl font-semibold text-[#0d5686]">
              Ingredients
            </h2>

            <ul className="mt-4 divide-y divide-[#dbe3e6]">
              {ingredients.map((item, index) => (
                <li
                  key={`${item.ingredient}-${index}`}
                  className="flex items-start gap-3 py-3"
                >
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f4c542]" />

                  <span className="text-[#5f6b70]">
                    {item.measurement && (
                      <strong className="text-[#0d5686]">
                        {item.measurement}{" "}
                      </strong>
                    )}

                    {item.ingredient}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="border-b-4 border-[#1677b8] pb-3 text-2xl font-semibold text-[#0d5686]">
              Instructions
            </h2>

            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#5f6b70]">
              {meal.strInstructions}
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}

export default DiscoverRecipeDetails;
