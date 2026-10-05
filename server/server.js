require("dotenv").config();
require("./config/database.js");

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

const userRouter = require('./routes/userRoutes.js');
app.use("/api/users", userRouter);

const shoppingListRouter = require('./routes/shoppingListRoutes.js');
app.use("/api/shopping-list", shoppingListRouter);

const recipeRouter = require('./routes/recipeRoutes.js');
app.use("/api/recipe", recipeRouter);

const mealPlanRouter = require('./routes/mealPlanRoutes.js');
app.use('/api/meal-plan', mealPlanRouter);

const kitchenItemRouter = require('./routes/kitchenRoutes.js');
app.use('/api/kitchen-item', kitchenItemRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
