import recipeBoxLogo from "../assets/recipe-box-logo.png";
import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { mealDbApi } from "../services/mealDbApi";

function Home() {
  const { user } = useAuth();

  const {
    data: mealData,
    isLoading: mealsLoading,
    error: mealsError,
  } = useFetch(mealDbApi.searchByName("chicken"));

  return (
    <main className="main">
      <div className="header-container">
        <img
          src={recipeBoxLogo}
          alt="Recipe Box Logo"
          className="logo w-full h-auto"
        />

        {user && <h1>Welcome back, {user.username}!</h1>}

        {mealsLoading && <p>Loading meals...</p>}

        {mealsError && <p>{mealsError.message}</p>}

        {mealData?.meals && (
          <section className="mt-10">
            <h2 className="mb-5 text-2xl font-semibold text-[#0d5686]">
              Recipe Inspiration
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mealData.meals.slice(0, 3).map((meal) => (
                <div
                  key={meal.idMeal}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
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
                      {meal.strArea} • {meal.strCategory}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default Home;
