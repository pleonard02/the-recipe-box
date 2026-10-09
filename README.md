# The Recipe Box

A full-stack recipe and kitchen organizer that brings saved recipes, meal planning, grocery lists, and kitchen inventory into one place.

The Recipe Box helps home cooks organize the week—from finding a recipe and planning dinner to tracking groceries and putting purchased items away. Its cream, blue, and lemon-yellow interface gives the application a consistent visual identity across recipes, forms, and dashboards.

## Demo

**Video walkthrough:** Coming soon.



## Screenshots

Screenshots will highlight the home dashboard, recipe collection, meal planner, shopping list, and kitchen inventory.



### Home dashboard
![Home dashboard with kitchen overview and favorite recipes]()

### Recipe collection
![Saved recipes and recipe discovery]()

### Recipe details
![Recipe photo, ingredients, and cooking instructions]()

### Weekly meal planner
![Weekly meal planner organized by day and meal type]()

### Shopping list
![Shopping list with recurring purchases and item statuses]()

### Kitchen inventory
![Kitchen inventory with category filters and expiration dates]()

### Shared recipe suggestions
![Purple collaborator proposals beside original recipe text and owner approval controls]()
-->

## Features

| Area | Capabilities |
| --- | --- |
| Accounts | Register, log in, and log out; access protected pages with a JWT-authenticated session. |
| Recipe collection | Create, edit, and delete recipes with ingredients, instructions, preparation time, cooking time, and servings. |
| Recipe photos | Upload JPG, PNG, or WebP images up to 5 MB; store and display photos through Cloudinary. |
| Public recipes | Publish recipes for all signed-in users to browse and search; ownership and invitations still control editing and collaboration. |
| Recipe discovery | Search TheMealDB by recipe name or browse by category or cuisine; save discovered recipes to favorites. |
| Favorites | Keep favorite recipes together and access them from the home dashboard. Unfavoriting an imported discovery recipe removes it from the saved collection; recipes you create remain saved. Shared favorites are personal to each invited user and disappear if access is revoked. |
| Meal planning | Assign recipes to breakfast, lunch, dinner, or snack slots; navigate weeks and choose a Sunday or Monday week start. |
| Shopping lists | Create weekly lists, manage quantities and units, and track items as planned, in cart, or purchased. |
| Weekly Buys | Maintain recurring purchases that populate newly created shopping lists. |
| Kitchen inventory | Track ingredients, leftovers, and frozen meals; search and filter inventory and record expiration dates. |
| Purchase workflow | Move purchased shopping-list items into kitchen inventory. |
| Recipe collaboration | Invite registered users by email, assign kitchen roles, add notes, and submit color-coded edits for owner approval. |

## Shared recipes and suggested edits

Recipe owners can invite other registered users by email and assign a Chef, Sous Chef, or Co-Executive Chef role. All three invited roles can propose changes from inside a shared recipe.

### Submit a suggestion

1. Open the recipe from **Shared with Me** on the Recipes page.
2. Scroll to **Suggested edits** and select **Suggest edits**.
3. Choose the field to update: name, description, ingredients, instructions, preparation time, cooking time, servings, category, or cuisine.
4. Enter the proposed value and optionally explain the reason for the change.
5. Select **Submit for owner approval**.

Each submission proposes a change to one field. Ingredient suggestions include editable ingredient names, quantities, and units.

### Review a suggestion

The owner opens the recipe and reviews proposals in **Suggested edits**. Each proposal displays its author, status, original value at submission, proposed value, and any explanation.

- **Approve** applies the proposed value to the saved recipe.
- **Reject** preserves the recipe and marks the proposal as rejected.

Proposed writing appears in **purple** and includes the collaborator's name, so its source is clear without relying on color alone. Approved and rejected proposals remain visible in the suggestion history. The saved recipe retains its normal styling after approval.

Submitting a suggestion leaves the saved recipe unchanged until the owner approves it. If the field has changed since submission, approval is blocked to prevent overwriting newer edits; the owner can reject the outdated proposal and request a revised suggestion.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | React, React Router, Vite, Tailwind CSS, and custom CSS |
| Backend | Node.js, Express, and CommonJS modules |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens and bcrypt password hashing |
| Image uploads | Multer and Cloudinary |
| Recipe discovery | TheMealDB API |
| Development and checks | ESLint and Nodemon |

The React client sends authenticated requests to the Express API. The API manages user-owned data in MongoDB and sends recipe uploads to Cloudinary. Recipe discovery requests go directly from the client to TheMealDB.

## Run locally

### Prerequisites

- Node.js compatible with the installed dependencies: version 20.19 or later in the 20.x series, or version 22.12 or later.
- npm.
- A local MongoDB instance or an accessible MongoDB connection string.
- A Cloudinary account for recipe image uploads.
- Internet access for Cloudinary uploads and TheMealDB discovery.

### 1. Clone and install

```bash
git clone https://github.com/pleonard02/the-recipe-box.git
cd the-recipe-box
npm ci
```

Both the client and server use the root `package.json`. Run the commands below from the repository root.

### 2. Configure the environment

Create a `.env` file in the repository root:

```dotenv
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/the-recipe-box
JWT_SECRET=replace_with_a_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

VITE_API_URL=http://localhost:3001
```

Replace the example values with your own configuration. For a hosted MongoDB database, replace `MONGO_URI` with its connection string. The `.env` file is ignored by Git and should remain private.

| Variable | Purpose |
| --- | --- |
| `PORT` | Express server port; defaults to `3001`. |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Secret used to sign and verify login tokens. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name. |
| `CLOUDINARY_API_KEY` | Cloudinary API key used by the server. |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret used by the server. |
| `VITE_API_URL` | Backend address used by the client; defaults to `http://localhost:3001`. |

Variables prefixed with `VITE_` are exposed to the browser. Keep database credentials, the JWT secret, and Cloudinary credentials in server-only variables.

### 3. Start the backend

```bash
npm run server
```

The API runs at `http://localhost:3001` with the example configuration. Confirm that the terminal reports a successful MongoDB connection.

### 4. Start the frontend

In a second terminal:

```bash
npm run dev
```

Open the local URL printed by Vite. Keep both terminals running while using the application.

### 5. Explore the application

1. Register an account and log in.
2. Add a recipe with ingredients, instructions, and a photo.
3. Search for a recipe in discovery and save a favorite.
4. Assign recipes to the weekly meal plan.
5. Create a shopping list and add recurring Weekly Buys.
6. Mark an item as purchased and move it into My Kitchen.
7. Invite another registered user to a recipe and add a note.
8. Sign in as the invited collaborator, open the shared recipe, and submit a suggested edit.
9. Return to the owner account to review and approve or reject the proposal.

## Project structure

```text
the-recipe-box/
├── client/src/
│   ├── assets/          # Application artwork
│   ├── components/      # Shared UI, recipe forms, and collaboration controls
│   ├── config/          # Shared backend URL
│   ├── context/         # Authentication state
│   ├── hooks/           # Reusable data-fetching hook
│   ├── pages/           # Application pages
│   ├── services/        # TheMealDB endpoint helpers
│   ├── App.jsx          # Client routes and layout
│   └── index.css        # Global styles and shared button styles
├── server/
│   ├── config/          # MongoDB and Cloudinary configuration
│   ├── controllers/     # Request handling and application behavior
│   ├── middleware/      # Authentication, recipe access, and uploads
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   └── server.js        # Express entry point
├── package.json
└── vite.config.mjs
```

## API overview

| Base path | Responsibility |
| --- | --- |
| `/api/users` | Registration, login, and current-user retrieval |
| `/api/recipe` | Recipe CRUD, sharing, notes, and suggestion endpoints |
| `/api/shopping-list` | Weekly shopping lists, items, recurring purchases, and putting purchases away |
| `/api/meal-plan` | Weekly meal-plan CRUD |
| `/api/kitchen-item` | Kitchen inventory CRUD |
| `/api/upload/recipe-image` | Authenticated recipe image uploads |

Protected endpoints require an `Authorization: Bearer <token>` header. Recipe access and editing permissions are checked through dedicated middleware. The owner manages sharing, while Co-Executive Chefs can directly edit shared recipes. Invited collaborators can submit proposed changes from the recipe details page. Proposed text appears in purple with its author, and the owner can approve or reject each suggestion.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run server` | Start the API with Nodemon |
| `npm run lint` | Check client and server code with ESLint |
| `npm run build` | Generate the production frontend in `dist/` |
| `npm run preview` | Preview the built frontend locally |

Use lint and the production build to check the code. Verify browser workflows, database operations, and external-service behavior manually.

## Deployment notes

The frontend and backend require separate runtime configuration:

- Build the frontend with `VITE_API_URL` set to the public HTTPS backend address. Changing this value requires a new frontend build.
- Serve the generated `dist/` directory through a frontend host with a fallback to `index.html` for client routes.
- Start the backend with `node server/server.js` and configure its MongoDB, JWT, and Cloudinary environment variables.
- Ensure the deployed backend can connect to the database.

The current Express server serves `server/public`, not the Vite `dist/` directory. Hosting both parts as a single service requires additional static-file and client-routing configuration. `npm run preview` is intended for local preview.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Login or application data fails to load | Confirm the backend is running and `VITE_API_URL` matches its address and port. Restart Vite after environment changes. |
| Database operations fail | Confirm `MONGO_URI` is valid and the database permits connections from the server. |
| Recipe photo upload fails | Check Cloudinary credentials, the 5 MB limit, and the accepted JPG, PNG, and WebP formats. |
| Discovery recipes do not load | Check internet connectivity and TheMealDB availability. |
| An authenticated request is rejected | Log in again; login tokens expire after one hour. |
| Refreshing a deployed page returns 404 | Configure the frontend host to serve `index.html` for client routes. |

## Credits

Recipe discovery content is provided by [TheMealDB](https://www.themealdb.com/). Recipe image storage and delivery use [Cloudinary](https://cloudinary.com/).

Created by [Priscilla Leonard](https://github.com/pleonard02).
