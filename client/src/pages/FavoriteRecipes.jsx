import { updateRecipeFavorite } from "../services/recipeFavorites";
import { useState } from "react";
import ActionError from "../components/ActionError";
import { API_URL } from "../config/api";
import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import RecipeCard from "../components/RecipeCard";

function FavoriteRecipes() {
  const { token } = useAuth();
  const [actionError, setActionError] = useState("");

  const { data, isLoading, error, refetch } = useFetch(
    `${API_URL}/api/recipe/favorites`,
    token,
  );

  const recipes = data?.recipes || [];

  const favoriteRecipes = recipes.filter(
    (recipe) => recipe.isFavorite === true,
  );

  if (isLoading) {
    return <p>Loading favorite recipes...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  async function handleFavorite(recipe) {
    setActionError("");
    try {
        await updateRecipeFavorite(recipe, token);

      refetch();
    } catch (error) {
        setActionError(error.message || "Could not update favorite. Please try again.");
    }
  }

  return (
    <main className="main min-h-screen bg-[#fffefa] px-8 py-10">
      <ActionError message={actionError} />
      <h1 className="text-4xl font-semibold text-[#0d5686]">
        Favorite Recipes
      </h1>

      <p className="mt-3 text-[#5f6b70]">
        Your favorite recipes, all in one place.
      </p>

      <p className="mt-6 text-[#0d5686]">
        You have {favoriteRecipes.length} favorite{" "}
        {favoriteRecipes.length === 1 ? "recipe" : "recipes"}.
      </p>

      <div
      className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favoriteRecipes.map((recipe) => (
            <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onFavorite={handleFavorite}
            />
        ))}
      </div>
    </main>
  );
}

export default FavoriteRecipes;
