import favoriteRecipeIcon from "../assets/favorite-recipe-icon.png";
import homeIcon from "../assets/home.png";
import mealPlan from "../assets/meal-plan.png";
import myKitchenIcon from "../assets/my-kitchen.png";
import shoppingListIcon from "../assets/shopping-list.png";
import recipeIcon from "../assets/recipe-icon.png";
import lemonTreeNavbar from "../assets/lemon-tree-navbar.png";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="sidebar">
      <nav aria-label="Main navigation">
        <NavLink to="/home">
          <img src={homeIcon} alt="" />
          Home
        </NavLink>

        <NavLink to="/recipes">
          <img src={recipeIcon} alt="" />
          Recipes
        </NavLink>

        <NavLink to="/favorite-recipes">
          <img src={favoriteRecipeIcon} alt="" />
          Favorite Recipes
        </NavLink>

        <NavLink to="/meal-plan">
          <img src={mealPlan} alt="" />
          Meal Plan
        </NavLink>

        <NavLink to="/my-kitchen">
          <img src={myKitchenIcon} alt="" />
          My Kitchen
        </NavLink>

        <NavLink to="/shopping-list">
          <img src={shoppingListIcon} alt="" />
          Shopping List
        </NavLink>
        {user && (
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </nav>
      <img src={lemonTreeNavbar} alt="Lemon Tree" className="sidebar-tree" />
    </aside>
  );
}

export default Sidebar;
