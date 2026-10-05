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
import "./App.css";

function App() {
  const { pathname } = useLocation();
  const isRegistrationPage = pathname.replace(/\/+$/, "") === "/register";

  return (
    <div className="app-layout">
      {!isRegistrationPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/favorite-recipes" element={<FavoriteRecipes />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/my-kitchen" element={<MyKitchen />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  )
}
export default App;
