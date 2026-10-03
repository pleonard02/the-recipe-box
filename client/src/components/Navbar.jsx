import favoriteRecipeIcon from '../assets/favorite-recipe-icon.png';
import homeIcon from '../assets/home.png';
import mealPlan from '../assets/meal-plan.png';
import myKitchenIcon from '../assets/my-kitchen.png';
import shoppingListIcon from '../assets/shopping-list.png'; 
import recipeIcon from '../assets/recipe-icon.png';
import lemonTreeNavbar from '../assets/lemon-tree-navbar.png';

function Sidebar() {
    return (
        <aside className="sidebar">
            <nav aria-label="Main navigation">
                <a href="/home">
                    <img 
                        src={homeIcon}
                        alt=""
                    />Home</a>

                <a href="/recipes">
                    <img 
                            src={recipeIcon}
                            alt=""
                        />Recipes</a>
                
                <a href="/favorite-recipes">
                    <img 
                        src={favoriteRecipeIcon}
                        alt=""
                    />Favorite Recipes</a>
                
                <a href="/meal-plan">
                    <img
                        src={mealPlan}
                        alt=""
                    />Meal Plan</a>
                
                <a href="/my-kitchen">
                    <img
                        src={myKitchenIcon}
                        alt=""
                    />My Kitchen</a>
    
                <a href="/shopping-list">
                    <img
                        src={shoppingListIcon}
                        alt=""
                    />Shopping List</a>  
            </nav>
            <img
                src={lemonTreeNavbar}
                alt="Lemon Tree"
                className="sidebar-tree"
            />
        </aside>
    );
}

export default Sidebar;
