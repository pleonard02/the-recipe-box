import { API_URL } from "../config/api";
import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { useState } from "react";

function MealPlan() {
  const { token } = useAuth();
  const [selectedMeals, setSelectedMeals] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [editingMeal, setEditingMeal] = useState(null);

  const { data, isLoading, error, refetch } = useFetch(
    `${API_URL}/api/meal-plan`,
    token,
  );

  const { data: recipeData } = useFetch(
    `${API_URL}/api/recipe`,
    token,
  );

  const recipes = recipeData?.recipes || [];

  const [weekStartsOn, setWeekStartsOn] = useState(
    () => localStorage.getItem("weekStartsOn") || "sunday",
  );

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const mealTypes = [
    { label: "Breakfast", value: "breakfast" },
    { label: "Lunch", value: "lunch" },
    { label: "Dinner", value: "dinner" },
    { label: "Snack", value: "snack" },
  ];

  const displayedDays =
    weekStartsOn === "monday" ? [...days.slice(1), days[0]] : days;

  const today = new Date();

  const currentWeekStart = new Date(today);

  const dayNumber = today.getDay();

  const daysFromWeekStart =
    weekStartsOn === "monday"
      ? dayNumber === 0
        ? 6
        : dayNumber - 1
      : dayNumber;

  currentWeekStart.setDate(
    today.getDate() - daysFromWeekStart + weekOffset * 7,
  );

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);

  function handleWeekStart(day) {
    setSelectedMeals(null);
    setEditingMeal(null);
    setWeekStartsOn(day);
    localStorage.setItem("weekStartsOn", day);
  }

  console.log("Meal plan data:", data);

  const currentMealPlan = data?.mealPlan?.find((plan) => {
    const savedWeek = new Date(plan.weekOf);
    savedWeek.setHours(0, 0, 0, 0);

    const displayedWeek = new Date(currentWeekStart);
    displayedWeek.setHours(0, 0, 0, 0);

    return savedWeek.getTime() === displayedWeek.getTime();
  });

  function changeWeek(direction) {
    const newOffset = weekOffset + direction;

    setWeekOffset(newOffset);
    setSelectedMeals(null);
    setEditingMeal(null);
  }

  if (isLoading) {
    return <p>Loading meal plan...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  function handleMealChange(day, mealType, recipeId) {
    setSelectedMeals((currentMeals) => {
      const baseMeals =
        currentMeals !== null ? currentMeals : currentMealPlan?.meals || [];

      const otherMeals = baseMeals.filter(
        (meal) => !(meal.day === day && meal.mealType === mealType),
      );

      if (!recipeId) {
        return otherMeals;
      }

      return [
        ...otherMeals,
        {
          day,
          mealType,
          recipe: recipeId,
        },
      ];
    });

    setEditingMeal(null);
  }

  function handleRemoveMeal(day, mealType) {
    const baseMeals =
      selectedMeals !== null ? selectedMeals : currentMealPlan?.meals || [];

    const updatedMeals = baseMeals.filter(
      (meal) => !(meal.day === day && meal.mealType === mealType),
    );

    setSelectedMeals(updatedMeals);
    setEditingMeal(null);
  }

  async function handleSaveMealPlan() {
    try {
      const weekOf = new Date(currentWeekStart);
      weekOf.setHours(0, 0, 0, 0);

      const existingPlan = data?.mealPlan?.find((plan) => {
        const savedWeek = new Date(plan.weekOf);
        savedWeek.setHours(0, 0, 0, 0);

        return savedWeek.getTime() === weekOf.getTime();
      });

      const url = existingPlan
        ? `${API_URL}/api/meal-plan/${existingPlan._id}`
        : `${API_URL}/api/meal-plan`;

      const method = existingPlan ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weekOf,
          meals:
            selectedMeals !== null
              ? selectedMeals
              : currentMealPlan?.meals || [],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not save meal plan.");
      }

      refetch();

      console.log("Meal plan saved:", result);
    } catch (error) {
      console.error("Save meal plan error:", error);
    }
  }

  const mealsToDisplay =
    selectedMeals !== null ? selectedMeals : currentMealPlan?.meals || [];

  return (
    <main className="main min-h-screen bg-[#fffefa] px-8 py-10">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
        THE RECIPE BOX
      </p>

      <h1 className="text-4xl font-semibold text-[#0d5686]">Meal Plan</h1>

      <p className="mt-3 text-[#5f6b70]">Plan your meals for the week.</p>

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm">
        <button
          type="button"
          onClick={() => changeWeek(-1)}
          className="btn btn-secondary"
        >
          ← Previous
        </button>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7c858b]">
            Week of
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#0d5686]">
            {currentWeekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {" – "}
            {weekEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => changeWeek(1)}
          className="btn btn-secondary"
        >
          Next →
        </button>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <span className="text-sm text-[#7c858b]">Week starts on</span>

        <div className="flex rounded-xl bg-[#edf6fa] p-1">
          {["sunday", "monday"].map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => handleWeekStart(day)}
              aria-pressed={weekStartsOn === day}
              className="btn btn-tab btn-sm capitalize"
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-4">
        <section className="grid min-w-[1100px] grid-cols-7 overflow-hidden rounded-2xl border border-[#e3eaed] bg-white shadow-sm">
          {displayedDays.map((day, index) => (
            <div
              key={day}
              className={index !== 0 ? "border-l border-[#e8eef0]" : ""}
            >
              <div className="border-b-4 border-[#f6d447] bg-[#fbfdfe] px-3 py-4 text-center">
                <h2 className="text-base font-bold text-[#0d5686]">{day}</h2>
              </div>

              <div className="divide-y divide-[#edf2f4]">
                {mealTypes.map((mealType) => {
                  const selectedMeal = mealsToDisplay.find(
                    (meal) =>
                      meal.day === day && meal.mealType === mealType.value,
                  );

                  const selectedRecipe = recipes.find(
                    (recipe) => recipe._id === selectedMeal?.recipe,
                  );

                  const isEditing =
                    editingMeal?.day === day &&
                    editingMeal?.mealType === mealType.value;

                  return (
                    <div key={mealType.value} className="min-h-[115px] p-3">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1677b8]">
                        {mealType.label}
                      </p>

                      {selectedRecipe && !isEditing ? (
                        <div className="mt-2">
                          <p className="font-semibold text-[#0d5686]">
                            {selectedRecipe.name}
                          </p>

                          <div className="mt-2 flex gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingMeal({
                                  day,
                                  mealType: mealType.value,
                                })
                              }
                              className="btn btn-secondary btn-sm"
                            >
                              Change
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMeal(day, mealType.value)
                              }
                              className="btn btn-danger btn-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={selectedMeal?.recipe || ""}
                          onChange={(event) =>
                            handleMealChange(
                              day,
                              mealType.value,
                              event.target.value,
                            )
                          }
                          className="w-full rounded-lg border border-[#dbe3e6] bg-[#fffdf8] px-2 py-2 text-sm text-[#0d5686] outline-none transition focus:border-[#1677b8] focus:ring-2 focus:ring-[#d9effb]"
                        >
                          <option value="">+ Add recipe</option>

                          {recipes.map((recipe) => (
                            <option key={recipe._id} value={recipe._id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSaveMealPlan}
          className="btn btn-primary"
        >
          Save Meal Plan
        </button>
      </div>
    </main>
  );
}

export default MealPlan;
