import { updateRecipeFavorite } from "../services/recipeFavorites";
import ActionError from "../components/ActionError";
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import RecipeForm from "../components/RecipeForm";
import useFetch from "../hooks/useFetch";
import RecipeCard from "../components/RecipeCard";
import { API_URL } from "../config/api";
import { Link } from "react-router-dom";
import { mealDbApi } from "../services/mealDbApi";

function Recipes() {
  const { token } = useAuth();
  const [actionError, setActionError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mealDbSearch, setMealDbSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");

  const { data, isLoading, error, refetch } = useFetch(
    `${API_URL}/api/recipe`,
    token,
  );

  const {
    data: sharedData,
    isLoading: sharedLoading,
    error: sharedError,
  } = useFetch(`${API_URL}/api/recipe/shared-with-me`, token);

  const sharedRecipes = (sharedData?.sharedRecipes || []).filter((share) => share.recipe);

  const recipes = (data?.recipes || []).filter(
    (recipe) => recipe.source !== "mealdb" || recipe.isFavorite === true,
  );
  const activeMealDbSearch = mealDbSearch || searchTerm.trim();

  let mealDbUrl = mealDbApi.searchByName(activeMealDbSearch);

  if (selectedCategory) {
    mealDbUrl = mealDbApi.filterByCategory(selectedCategory);
  } else if (selectedCuisine) {
    mealDbUrl = mealDbApi.filterByCuisine(selectedCuisine);
  }

  const {
    data: mealDbData,
    isLoading: mealDbLoading,
    error: mealDbError,
  } = useFetch(mealDbUrl);

  const publicSearch = new URLSearchParams({
    term: activeMealDbSearch,
    category: selectedCategory,
    cuisine: selectedCuisine,
  });
  const { data: publicData, isLoading: publicLoading, error: publicError, refetch: refetchPublic } = useFetch(
    `${API_URL}/api/recipe/public?${publicSearch}`, token,
  );
  const publicRecipes = publicData?.recipes || [];

  const { data: categoryData } = useFetch(mealDbApi.getCategories());
  const { data: cuisineData } = useFetch(mealDbApi.getCuisines());

  const categories = categoryData?.categories || [];
  const cuisines = cuisineData?.meals || [];

  const discoverRecipes = mealDbData?.meals || [];

  async function handleDelete(recipeId) {
    setActionError("");
    try {
      const response = await fetch(`${API_URL}/api/recipe/${recipeId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message || "Could not delete recipe.");
      }

      refetch();
      refetchPublic();
    } catch (deleteError) {
      setActionError(deleteError.message || "Could not delete recipe. Please try again.");
    }
  }

  function handleEdit(recipe) {
    setEditingRecipe(recipe);
    setShowAddForm(true);
  }

  if (isLoading) {
    return <p>Loading recipes...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  async function handleFavorite(recipe) {
    setActionError("");
    try {
      await updateRecipeFavorite(recipe, token);

      refetch();
      refetchPublic();
    } catch (error) {
      setActionError(error.message || "Could not update favorite. Please try again.");
    }
  }

  function handleMealDbSearch(event) {
    event.preventDefault();

    setSelectedCategory("");
    setSelectedCuisine("");
    setMealDbSearch(searchTerm.trim());
  }

  return (
    <main className="main min-h-screen bg-[#fffefa] px-8 py-10">
      <section className="mx-auto max-w-7xl">
        <ActionError message={actionError} />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
              MY RECIPE BOX
            </p>

            <h1 className="max-w-2xl text-4xl font-semibold text-[#0d5686]">
              Recipes
            </h1>

            <p className="mt-3 max-w-2xl text-[#5f6b70]">
              Create, discover, and save recipes for your Recipe Box.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingRecipe(null);
              setShowAddForm(!showAddForm);
            }}
            className="btn btn-primary"
          >
            {showAddForm ? "Close Form" : "+ Add Recipe"}
          </button>
        </div>

        {showAddForm && (
          <div className="mt-8">
            <RecipeForm
              key={editingRecipe?._id || "new"}
              token={token}
              onClose={() => {
                setShowAddForm(false);
                setEditingRecipe(null);
              }}
              onRecipeCreated={() => { refetch(); refetchPublic(); }}
              editingRecipe={editingRecipe}
            />
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1677b8]">
              YOUR COLLECTION
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#0d5686]">
              My Recipes
            </h2>
          </div>

          <p className="text-sm text-[#7c858b]">
            {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b9ccd5] bg-white px-6 py-12 text-center">
            <h3 className="text-xl font-semibold text-[#0d5686]">
              Your recipe box is empty
            </h3>

            <p className="mt-2 text-[#69767b]">
              Add your first recipe to start building your collection.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1677b8]">
              COLLABORATIVE KITCHEN
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#0d5686]">
              Shared With Me
            </h2>

            <p className="mt-2 text-[#69767b]">
              Recipes other chefs have invited you to collaborate on.
            </p>
          </div>

          <p className="text-sm text-[#7c858b]">
            {sharedRecipes.length}{" "}
            {sharedRecipes.length === 1 ? "recipe" : "recipes"}
          </p>
        </div>

        {sharedLoading ? (
          <p className="text-[#69767b]">Loading shared recipes...</p>
        ) : sharedError ? (
          <p className="text-red-500">Could not load shared recipes.</p>
        ) : sharedRecipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b9ccd5] bg-white px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-[#0d5686]">
              No recipes have been shared with you yet
            </h3>

            <p className="mt-2 text-[#69767b]">
              When another cook invites you into their kitchen, their recipe
              will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sharedRecipes.map((share) => (
              <Link
                key={share._id}
                to={`/recipes/${share.recipe._id}`}
                className="group overflow-hidden rounded-2xl border border-[#dbe3e6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {share.recipe.image && (
                  <img
                    src={share.recipe.image}
                    alt={share.recipe.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#1677b8]">
                      {share.role === "co-executive-chef"
                        ? "Co-Executive Chef"
                        : share.role === "sous-chef"
                          ? "Sous Chef"
                          : "Chef"}
                    </p>

                    <span className="rounded-full bg-[#fff3a6] px-3 py-1 text-xs font-semibold text-[#0d5686]">
                      Shared
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-[#0d5686] group-hover:text-[#1677b8]">
                    {share.recipe.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-[#69767b]">
                    {share.recipe.description || "No description added yet."}
                  </p>

                  {share.invitedBy?.username && (
                    <p className="mt-4 text-xs text-[#7c858b]">
                      Shared by {share.invitedBy.username}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-14">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1677b8]">
            DISCOVER
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#0d5686]">
            Discover Recipes
          </h2>

          <p className="mt-2 text-[#69767b]">
            Browse recipes and save your favorites to your Recipe Box.
          </p>
        </div>

        <form
          onSubmit={handleMealDbSearch}
          className="mb-8 flex max-w-xl gap-3"
        >
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search chicken, pasta, curry..."
            className="min-w-0 flex-1 rounded-xl border border-[#b9ccd5] bg-white px-4 py-3 text-[#33454d] outline-none focus:border-[#1677b8]"
          />

          <button
            type="submit"
            className="btn btn-primary"
          >
            Search
          </button>
        </form>

        <div className="mb-8 flex flex-wrap gap-4">
          <select
            value={selectedCategory}
            onChange={(event) => {
              setSelectedCategory(event.target.value);
              setSelectedCuisine("");
              setMealDbSearch("");
              setSearchTerm("");
            }}
            className="rounded-xl border border-[#b9ccd5] bg-white px-4 py-3 text-[#0d5686] outline-none focus:border-[#1677b8]"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.idCategory} value={category.strCategory}>
                {category.strCategory}
              </option>
            ))}
          </select>

          <select
            value={selectedCuisine}
            onChange={(event) => {
              setSelectedCuisine(event.target.value);
              setSelectedCategory("");
              setMealDbSearch("");
              setSearchTerm("");
            }}
            className="rounded-xl border border-[#b9ccd5] bg-white px-4 py-3 text-[#0d5686] outline-none focus:border-[#1677b8]"
          >
            <option value="">All Cuisines</option>

            {cuisines.map((cuisine) => (
              <option key={cuisine.strArea} value={cuisine.strArea}>
                {cuisine.strArea}
              </option>
            ))}
          </select>
        </div>

        <section className="mb-8" aria-label="Public community recipes">
          <h3 className="mb-4 text-xl font-semibold text-[#0d5686]">Public Recipes</h3>
          {publicLoading ? <p>Loading public recipes…</p> : publicError ? (
            <ActionError message="Could not load public recipes. Please try again." />
          ) : publicRecipes.length === 0 ? <p>No public recipes match your search.</p> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {publicRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          )}
        </section>
        <h3 className="mb-4 text-xl font-semibold text-[#0d5686]">TheMealDB Recipes</h3>

        {mealDbLoading ? (
          <p className="text-[#69767b]">Loading recipes...</p>
        ) : mealDbError ? (
          <p className="text-red-500">Could not load recipes.</p>
        ) : discoverRecipes.length === 0 ? (
          <p className="text-[#68767b]">No recipes found.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {discoverRecipes.map((meal) => (
              <Link
                key={meal.idMeal}
                to={`/discover/${meal.idMeal}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="aspect-[4/3] w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#0d5686] group-hover:text-[#1677b8]">
                    {meal.strMeal}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {meal.strCategory && (
                      <span className="rounded-full bg-[#fff3a6] px-3 py-1 text-xs font-semibold text-[#0d5686]">
                        {meal.strCategory}
                      </span>
                    )}

                    {meal.strArea && (
                      <span className="rounded-full bg-[#edf6fa] px-3 py-1 text-xs font-semibold text-[#1677b8]">
                        {meal.strArea}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Recipes;
