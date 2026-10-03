import recipeBoxLogo from '../assets/recipe-box-logo.png';

function Home() {
    return (
        <main className="main">
            <div className="header-container">
                <img
                    src={recipeBoxLogo}
                    alt="Recipe Box Logo"
                    className="logo w-full h-auto"
                />
            </div>
        </main>
    )
}

export default Home;
