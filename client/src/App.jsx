import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import FavoriteRecipes from "./pages/FavoriteRecipes";
import MealPlan from "./pages/MealPlan";
import MyKitchen from "./pages/Kitchen";
import ShoppingList from "./pages/ShoppingList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RecipeDetails from "./pages/RecipeDetails.jsx";
import DiscoverRecipeDetails from "./pages/DiscoverRecipeDetails";
import "./App.css";

function App() {
  const { pathname } = useLocation();
  const isAuthPage = ["/register", "/login"].includes(
    pathname.replace(/\/+$/, ""),
  );

  return (
    <div className="app-layout">
      {!isAuthPage && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/discover/:mealId"
          element={
            <ProtectedRoute>
              <DiscoverRecipeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Recipes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recipes/:recipeId"
          element={
            <ProtectedRoute>
              <RecipeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorite-recipes"
          element={
            <ProtectedRoute>
              <FavoriteRecipes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meal-plan"
          element={
            <ProtectedRoute>
              <MealPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-kitchen"
          element={
            <ProtectedRoute>
              <MyKitchen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shopping-list"
          element={
            <ProtectedRoute>
              <ShoppingList />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}
export default App;
