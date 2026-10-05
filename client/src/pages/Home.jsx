import recipeBoxLogo from "../assets/recipe-box-logo.png";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <main className="main">
      <div className="header-container">
        <img
          src={recipeBoxLogo}
          alt="Recipe Box Logo"
          className="logo w-full h-auto"
        />

        {user && <h1>Welcome back, {user.username}!</h1>}
      </div>
    </main>
  );
}

export default Home;
