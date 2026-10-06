async function FavoriteRecipes (recipeId) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/recipe/${recipeId._id}`,
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
    return (
        <h1>Favorite Recipes</h1>
    )
}

export default FavoriteRecipes;