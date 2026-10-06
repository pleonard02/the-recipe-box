import { useState } from "react";
import { useAuth } from "../context/useAuth";
import RecipeForm from "../components/RecipeForm";
import useFetch from "../hooks/useFetch";

function Recipes() {
  const { token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  const { data, isLoading, error, refetch } = useFetch(
    "http://localhost:3000/api/recipe",
    token,
  );

  const recipes = data?.recipes || [];

  async function handleDelete(recipeId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipe/${recipeId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message || "Could not delete recipe.");
      }

      refetch();
    } catch (deleteError) {
      console.error("Delete recipe error:", deleteError);
    }
  }

  if (isLoading) {
    return <p>Loading recipes...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <main className="main min-h-screen bg-[#fffefa] px-8 py-10">
      <section className="mb-10">
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
            className="rounded-xl bg-[#0d5686] px-5 py-3 font-semibold text-[#fff3a6] shadow-sm transition hover:bg-[#1677b8]"
          >
            {showAddForm ? "Close Form" : "+ Add Recipe"}
          </button>
        </div>

        {showAddForm && (
          <div className="mt-8">
            <RecipeForm
              token={token}
              onClose={() => {
                setShowAddForm(false);
                setEditingRecipe(null);
              }}
              onRecipeCreated={refetch}
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
              <article
                key={recipe._id}
                className="flex min-h-[250px] flex-col rounded-2xl border border-[#dbe3e6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1677b8]">
                  {recipe.isPublic ? "Public Recipe" : "My Recipe"}
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#0d5686]">
                  {recipe.name}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#69767b]">
                  {recipe.description || "No description added yet."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-[#536168]">
                  {recipe.prepTime > 0 && (
                    <span className="rounded-full bg-[#f5f7f7] px-3 py-1">
                      Prep {recipe.prepTime} min
                    </span>
                  )}

                  {recipe.cookTime > 0 && (
                    <span className="rounded-full bg-[#f5f7f7] px-3 py-1">
                      Cook {recipe.cookTime} min
                    </span>
                  )}

                  {recipe.servings > 0 && (
                    <span className="rounded-full bg-[#fff8cf] px-3 py-1">
                      Serves {recipe.servings}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-4 border-t border-[#edf2f4] pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRecipe(recipe);
                      setShowAddForm(true);
                    }}
                    className="text-sm font-semibold text-[#1677b8] hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(recipe._id)}
                    className="text-sm font-semibold text-[#9b3b32] hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Recipes;
