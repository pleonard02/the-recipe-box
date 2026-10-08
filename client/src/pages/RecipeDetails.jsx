import { updateRecipeFavorite } from "../services/recipeFavorites";
import ActionError from "../components/ActionError";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { useState } from "react";
import { API_URL } from "../config/api";
import InvitedChefs from "../components/InvitedChefs";
import RecipeSuggestions from "../components/RecipeSuggestions";
import RecipeNotes from "../components/RecipeNotes";

function RecipeDetails() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [actionError, setActionError] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("chef");
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [sharesRefreshKey, setSharesRefreshKey] = useState(0);

  const {
    data: recipe,
    isLoading,
    error,
    refetch,
  } = useFetch(`${API_URL}/api/recipe/${recipeId}`, token);

  if (isLoading) {
    return <p>Loading recipe...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  if (!recipe) {
    return <p>Recipe not found.</p>;
  }

  const ownerId = recipe.owner?._id || recipe.owner;
  const isExecutiveChef = Boolean(
    user?._id && ownerId && String(user._id) === String(ownerId),
  );

  async function handleFavorite() {
    setActionError("");
    try {
      const updatedRecipe = await updateRecipeFavorite(recipe, token);
      if (!updatedRecipe) {
        navigate("/recipes", { replace: true });
        return;
      }

      refetch();
    } catch (error) {
      setActionError(error.message || "Could not update favorite. Please try again.");
    }
  }

  async function handleShareRecipe(event) {
    event.preventDefault();

    setIsSharing(true);
    setShareMessage("");

    try {
      const response = await fetch(`${API_URL}/api/recipe/${recipeId}/shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: shareEmail.trim(),
          role: shareRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not share recipe.");
      }

      setShareEmail("");
      setShareRole("chef");
      setShareMessage("Chef successfully invited!");
      setSharesRefreshKey((previous) => previous + 1);
    } catch (error) {
      setShareMessage(error.message);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <main className="main min-h-screen bg-[#f7fbfc] px-6 py-10">
      <article className="relative mx-auto max-w-5xl overflow-hidden rounded-md border-t-8 border-[#f6d447] bg-[#fffdf8] shadow-2xl">
        <header className="border-b-2 border-[#1677b8]/20 p-8 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1677b8]">
            The Recipe Box
          </p>

          <ActionError message={actionError} />
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={
              recipe.isFavorite
                ? `Remove ${recipe.name} from favorites`
                : `Add ${recipe.name} to favorites`
            }
            aria-pressed={recipe.isFavorite}
            className={`btn mt-4 ${recipe.isFavorite ? "btn-accent" : "btn-secondary"}`}
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

          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.image}
              className="mt-6 max-h-96 w-full rounded-xl object-cover"
            />
          )}
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

      {isExecutiveChef && (
        <section className="mx-auto mt-8 max-w-5xl rounded-2xl border border-[#dbe3e6] bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1677b8]">
            COLLABORATIVE KITCHEN
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#0d5686]">
            Invite a Chef
          </h2>

          <p className="mt-2 text-[#69767b]">
            Share this recipe with another registered Recipe Box user.
          </p>

          <form
            onSubmit={handleShareRecipe}
            className="mt-6 flex flex-col gap-4 md:flex-row md:items-end"
          >
            <label className="flex-1">
              <span className="mb-2 block text-sm font-semibold text-[#0d5686]">
                Chef's Email
              </span>

              <input
                type="email"
                required
                value={shareEmail}
                onChange={(event) => setShareEmail(event.target.value)}
                placeholder="chef@example.com"
                className="w-full rounded-xl border border-[#b9ccd5] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[#0d5686]">
                Kitchen Role
              </span>

              <select
                value={shareRole}
                onChange={(event) => setShareRole(event.target.value)}
                className="w-full rounded-xl border border-[#b9ccd5] px-4 py-3"
              >
                <option value="chef">Chef</option>
                <option value="sous-chef">Sous Chef</option>
                <option value="co-executive-chef">Co-Executive Chef</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isSharing}
              className="btn btn-primary"
            >
              {isSharing ? "Inviting..." : "Invite Chef"}
            </button>
          </form>

          {shareMessage && (
            <p className="mt-4 text-sm text-[#0d5686]">{shareMessage}</p>
          )}
          <InvitedChefs
            recipeId={recipeId}
            token={token}
            refreshKey={sharesRefreshKey}
          />
        </section>
      )}
      {user && <RecipeSuggestions key={recipeId} recipe={recipe} token={token} isOwner={isExecutiveChef} onApproved={refetch} />}
      <RecipeNotes recipeId={recipeId} token={token} />
    </main>
  );
}

export default RecipeDetails;
