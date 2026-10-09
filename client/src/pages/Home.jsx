import { API_URL } from "../config/api";
import { useState } from "react";
import recipeBoxLogo from "../assets/recipe-box-logo.png";
import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { mealDbApi } from "../services/mealDbApi";
import { Link } from "react-router-dom";
import ActionError from "../components/ActionError";

function shuffleMeals(meals, seed) {
  const shuffled = [...meals];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * 17 + i * 13) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 3);
}

function Home() {
  const { user, token } = useAuth();
  const [shuffleCount, setShuffleCount] = useState(0);

  const { data: kitchenData, isLoading: kitchenLoading } = useFetch(
    `${API_URL}/api/kitchen-item`,
    token,
  );

  const {
    data: recipeData,
    isLoading: recipesLoading,
    error: recipesError,
    refetch: refetchFavorites,
  } = useFetch(`${API_URL}/api/recipe/favorites`, token);

  const recipeList = recipeData?.recipes || recipeData || [];

  const favoriteRecipes = Array.isArray(recipeList)
    ? recipeList.filter((recipe) => recipe.isFavorite)
    : [];

  const kitchenItems = kitchenData?.kitchenItems || kitchenData || [];

  const proteinMappings = [
    { keyword: "tofu", ingredient: "tofu" },
    { keyword: "chicken", ingredient: "chicken" },
    { keyword: "flank steak", ingredient: "beef" },
    { keyword: "ground beef", ingredient: "beef" },
    { keyword: "steak", ingredient: "beef" },
    { keyword: "beef", ingredient: "beef" },
    { keyword: "lamb", ingredient: "lamb" },
    { keyword: "pork tenderloin", ingredient: "pork" },
    { keyword: "pork", ingredient: "pork" },
    { keyword: "salmon", ingredient: "salmon" },
    { keyword: "tuna", ingredient: "tuna" },
    { keyword: "shrimp", ingredient: "shrimp" },
    { keyword: "turkey", ingredient: "turkey" },
  ];

  const availableProteins = [
    ...new Set(
      (Array.isArray(kitchenItems) ? kitchenItems : [])
        .map(
          (item) =>
            proteinMappings.find(({ keyword }) =>
              item.name?.toLowerCase().includes(keyword),
            )?.ingredient,
        )
        .filter(Boolean),
    ),
  ];

  const protein =
    availableProteins.length > 0
      ? availableProteins[shuffleCount % availableProteins.length]
      : "";

  const {
    data: mealData,
    isLoading: mealsLoading,
    error: mealsError,
  } = useFetch(protein ? mealDbApi.searchByIngredient(protein) : null);

  function handleShuffle() {
    setShuffleCount((count) => count + 1);
  }

  const recommendedMeals = shuffleMeals(mealData?.meals || [], shuffleCount);

  return (
    <main className="main">
      <div className="header-container">
        <img
          src={recipeBoxLogo}
          alt="Recipe Box Logo"
          className="logo w-full h-auto"
        />

        {user && <h1>Welcome back, {user.username}!</h1>}

        {mealsLoading && protein && (
          <p className="mt-8 text-[#7c858b]">
            Finding recipes you can make with {protein}...
          </p>
        )}

        {mealsError && (
          <p className="mt-8 text-red-500">
            Could not load recipe recommendations.
          </p>
        )}

        <button
          type="button"
          onClick={handleShuffle}
          className="btn btn-primary mb-5"
        >
          Shuffle Recipes
        </button>

        {protein && mealData?.meals && (
          <section className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
              COOK WHAT YOU HAVE
            </p>

            <h2 className="mb-2 mt-1 text-2xl font-semibold text-[#0d5686]">
              Recipes to Try with {protein}
            </h2>

            <p className="mb-5 text-sm text-[#7c858b]">
              Based on what you already have in My Kitchen.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedMeals.map((meal) => (
                <Link
                  key={meal.idMeal}
                  to={`/discover/${meal.idMeal}`}
                  className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="h-48 w-full object-cover"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-[#0d5686]">
                      {meal.strMeal}
                    </h3>

                    <p className="mt-1 text-sm text-[#7c858b]">
                      Recipe inspiration from TheMealDB
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!kitchenLoading && !protein && (
          <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
              COOK WHAT YOU HAVE
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#0d5686]">
              Add a protein to My Kitchen
            </h2>

            <p className="mt-2 text-sm text-[#7c858b]">
              Add an item in the Protein category to get recipe recommendations.
            </p>
          </section>
        )}

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
              SAVED FOR LATER
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#0d5686]">
              Favorite Recipes
            </h2>
          </div>

          {recipesLoading && (
            <p className="text-[#7c858b]">Loading favorites...</p>
          )}

          {recipesError && (
            <div>
              <ActionError message={`Could not load your favorite recipes: ${recipesError.message}`} />
              <button type="button" className="btn btn-secondary" onClick={refetchFavorites}>
                Retry favorites
              </button>
            </div>
          )}

          {!recipesLoading && !recipesError && favoriteRecipes.length === 0 && (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <p className="font-semibold text-[#0d5686]">
                No favorite recipes yet.
              </p>

              <p className="mt-2 text-sm text-[#7c858b]">
                Favorite a recipe and it will show up here.
              </p>
            </div>
          )}

          {favoriteRecipes.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteRecipes.slice(0, 3).map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-[#edf6fa] text-[#1677b8]">
                      No recipe image
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[#0d5686] group-hover:text-[#1677b8]">
                      {recipe.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#69767b]">
                      {recipe.description || "No description added yet."}
                    </p>

                    <div className="mt-4">
                      <span className="rounded-full bg-[#fff7c7] px-3 py-1 text-xs font-semibold text-[#0d5686]">
                        ♥ Favorite
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Home;
