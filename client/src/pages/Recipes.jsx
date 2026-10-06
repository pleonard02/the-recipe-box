import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { useState } from "react";
import RecipeForm from "../components/RecipeForm";

const mealDbUrl = import.meta.env.VITE_MEALDB_API_URL;

function Recipes() {
  const { token } = useAuth();

  const { data, isLoading, error } = useFetch(
    `http://localhost:3000/api/recipe`,
    token,
  );

  const [showAddForm, setShowAddForm] = useState(false);

  console.log("Recipe data:", data);

  const recipes = data?.recipes || [];

  if (isLoading) {
    return <p>Loading recipes...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <main className="main">
      <section>
        <p>MY RECIPE BOX</p>
        <h1>Create, discover, and save recipes for your Recipe Box.</h1>

        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Close Form" : "+ Add Recipe"}
        </button>

        {showAddForm && <RecipeForm token={token} onClose={() => setShowAddForm(false)} />}
      </section>
      <section>
        <h2>My Recipes</h2>

        {recipes.length === 0 ? (
          <div>
            <h3>Your recipe box is empty</h3>
            <p>Add your first recipe to start building your collection.</p>
          </div>
        ) : (
          <div>
            {recipes.map((recipe) => (
              <article key={recipe._id}>
                <h3>{recipe.name}</h3>
                <p>{recipe.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Recipes;
