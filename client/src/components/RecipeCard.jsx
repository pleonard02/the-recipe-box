import { Link } from "react-router-dom";

function RecipeCard({ recipe, onEdit, onDelete, onFavorite }) {
  console.log(recipe.name, recipe.isFavorite);
  return (
    <article className="relative flex min-h-[250px] flex-col rounded-2xl border border-[#dbe3e6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.name}
          loading="lazy"
          className="mb-4 h-44 w-full rounded-xl object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1677b8]">
          {recipe.isShared ? "Shared Recipe" : recipe.isPublic ? "Public Recipe" : "My Recipe"}
        </p>

        <button
          type="button"
          onClick={() => {
            console.log("Heart clicked:", recipe);
            onFavorite(recipe);
          }}
          aria-pressed={recipe.isFavorite}
          className={`btn btn-icon relative z-10 ${
            recipe.isFavorite ? "btn-accent" : "btn-secondary"
          }`}
          aria-label={
            recipe.isFavorite
              ? `Remove ${recipe.name} from favorites`
              : `Add ${recipe.name} to favorites`
          }
        >
          {recipe.isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <h3 className="mt-2 text-xl font-semibold text-[#0d5686]">
        <Link
          to={`/recipes/${recipe._id}`}
          className="after:absolute after:inset-0 transition hover:text-[#1677b8]"
        >
          {recipe.name}
        </Link>
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

      {(onEdit || onDelete) && (
        <div className="mt-auto flex items-center gap-4 border-t border-[#edf2f4] pt-4">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(recipe)}
              className="btn btn-secondary btn-sm relative z-10"
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(recipe._id)}
              className="btn btn-danger btn-sm relative z-10"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}

export default RecipeCard;
