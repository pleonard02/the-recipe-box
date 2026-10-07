const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const mealDbApi = {
  searchByName: (name) =>
    `${BASE_URL}/search.php?s=${encodeURIComponent(name)}`,

  searchByIngredient: (ingredient) =>
    `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`,

  filterByCategory: (category) =>
    `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,

  filterByCuisine: (cuisine) =>
    `${BASE_URL}/filter.php?a=${encodeURIComponent(cuisine)}`,

  getCategories: () => `${BASE_URL}/categories.php`,

  getCuisines: () => `${BASE_URL}/list.php?a=list`,

  getById: (id) => `${BASE_URL}/lookup.php?i=${id}`,

  getRandom: () => `${BASE_URL}/random.php`,
};
