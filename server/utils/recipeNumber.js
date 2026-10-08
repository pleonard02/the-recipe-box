function recipeNumber(value) {
  if (Array.isArray(value)) {
    if (value.length > 1) throw new Error("Enter a single number.");
    value = value[0];
  }
  if (value == null || value === "") return null;
  if (!["string", "number"].includes(typeof value) || !String(value).trim()) {
    throw new Error("Enter a valid number.");
  }
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error("Enter a finite number.");
  return number;
}
module.exports = recipeNumber;
