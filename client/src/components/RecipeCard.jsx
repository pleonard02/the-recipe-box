function RecipeCard({ recipe, onEdit, onDelete, onFavorite }) {
  console.log(recipe.name, recipe.isFavorite);
  return (
    <article className="flex min-h-[250px] flex-col rounded-2xl border border-[#dbe3e6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1677b8]">
          {recipe.isPublic ? "Public Recipe" : "My Recipe"}
        </p>

        <button
          type="button"
          onClick={() => {
            console.log("Heart clicked:", recipe);
            onFavorite(recipe);
          }}
          className={`text-2xl transition hover:scale-110 ${
            recipe.isFavorite ? "text-[#f0b51d]" : "text-[#0d5686]"
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
          onClick={() => onEdit(recipe)}
          className="text-sm font-semibold text-[#1677b8] hover:underline"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(recipe._id)}
          className="text-sm font-semibold text-[#9b3b32] hover:underline"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default RecipeCard;
