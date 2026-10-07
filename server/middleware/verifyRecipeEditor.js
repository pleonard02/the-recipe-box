function verifyRecipeEditor(req, res, next) {
  const allowedRoles = ["executive-chef", "co-executive-chef"];

  if (!allowedRoles.includes(req.recipeRole)) {
    return res.status(403).json({
      message:
        "Only an Executive Chef or Co-Executive Chef can directly edit this recipe.",
    });
  }

  next();
}

module.exports = verifyRecipeEditor;
