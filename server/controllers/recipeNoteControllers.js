const RecipeNote = require("../models/RecipeNote");

async function getRecipeNotes(req, res) {
  try {
    const notes = await RecipeNote.find({
      recipe: req.params.recipeId,
    })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ notes });
  } catch (error) {
    console.error("Get recipe notes error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong while getting recipe notes." });
  }
}

async function createRecipeNote(req, res) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Note text is required." });
    }

    const note = await RecipeNote.create({
      recipe: req.params.recipeId,
      author: req.user._id,
      text: text.trim(),
    });

    await note.populate("author", "username email");

    return res
      .status(201)
      .json({ message: "Recipe note added successfully!", note });
  } catch (error) {
    console.error("Create recipe note error:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong while adding the recipe note." });
  }
}

module.exports = {
  getRecipeNotes,
  createRecipeNote,
};
