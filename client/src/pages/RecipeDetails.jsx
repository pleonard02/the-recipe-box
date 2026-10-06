import { useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";

function RecipeDetails() {
  const { recipeId } = useParams();
  const { token } = useAuth();

  const {
    data: recipe,
    isLoading,
    error,
    refetch,
  } = useFetch(`http://localhost:3000/api/recipe/${recipeId}`, token);

  if (isLoading) {
    return <p>Loading recipe...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  async function handleFavorite() {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recipe/${recipe._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isFavorite: !recipe.isFavorite,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update favorite.");
      }

      refetch();
    } catch (error) {
      console.error("Favorite recipe error:", error);
    }
  }

  return (
    <main className="main min-h-screen bg-[#f7fbfc] px-6 py-10">
      <article className="relative mx-auto max-w-5xl overflow-hidden rounded-md border-t-8 border-[#f6d447] bg-[#fffdf8] shadow-2xl">
        <header className="border-b-2 border-[#1677b8]/20 p-8 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1677b8]">
            The Recipe Box
          </p>

          <button
            type="button"
            onClick={handleFavorite}
            aria-label={
              recipe.isFavorite
                ? `Remove ${recipe.name} from favorites`
                : `Add ${recipe.name} to favorites`
            }
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 font-semibold transition ${
              recipe.isFavorite
                ? "bg-[#f6d447] text-[#0d5686]"
                : "border-2 border-[#0d5686] bg-white text-[#0d5686]"
            }`}
          >
            <span className="text-2xl leading-none">
              {recipe.isFavorite ? "♥" : "♡"}
            </span>

            {recipe.isFavorite ? "Favorite" : "Add to Favorites"}
          </button>

          <h1 className="mt-5 text-4xl font-bold leading-tight text-[#0d5686] sm:text-5xl">
            {recipe.name}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-[#5f6b70]">
            {recipe.description || "No description added yet."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {recipe.prepTime > 0 && (
              <span className="rounded-full bg-[#fff3a6] px-4 py-2 text-sm font-bold text-[#0d5686]">
                Prep {recipe.prepTime} min
              </span>
            )}

            {recipe.cookTime > 0 && (
              <span className="rounded-full bg-[#dceef8] px-4 py-2 text-sm font-bold text-[#0d5686]">
                Cook {recipe.cookTime} min
              </span>
            )}

            {recipe.servings > 0 && (
              <span className="rounded-full bg-[#fff3a6] px-4 py-2 text-sm font-bold text-[#0d5686]">
                Serves {recipe.servings}
              </span>
            )}
          </div>
        </header>

        <div className="grid gap-10 p-8 sm:p-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)]">
          <section>
            <h2 className="border-b-4 border-[#f6d447] pb-3 text-2xl font-bold text-[#0d5686]">
              Ingredients
            </h2>

            <ul className="mt-4 divide-y divide-[#1677b8]/15">
              {recipe.ingredients?.map((ingredient, index) => (
                <li
                  key={ingredient._id || index}
                  className="flex items-start gap-3 py-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#f6d447]"
                  />

                  <span className="text-[#536168]">
                    {(ingredient.quantity || ingredient.unit) && (
                      <strong className="text-[#0d5686]">
                        {ingredient.quantity} {ingredient.unit}{" "}
                      </strong>
                    )}

                    {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="border-b-4 border-[#1677b8] pb-3 text-2xl font-bold text-[#0d5686]">
              Instructions
            </h2>

            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#536168]">
              {recipe.instructions}
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}

export default RecipeDetails;
