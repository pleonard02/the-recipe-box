import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { API_URL } from "../config/api";

const fields = {
  name: "Recipe name", description: "Description", ingredients: "Ingredients",
  instructions: "Instructions", prepTime: "Prep time (minutes)",
  cookTime: "Cook time (minutes)", servings: "Servings", category: "Category", cuisine: "Cuisine",
};
const numbers = ["prepTime", "cookTime", "servings"];
const inputStyle = "w-full rounded-xl border border-[#dbe3e6] bg-white px-4 py-3";

function displayValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === "object" && item !== null
      ? `${item.quantity ?? ""} ${item.unit || ""} ${item.name || ""}`.trim()
      : String(item)).join("\n");
  }
  return String(value ?? "") || "(Empty)";
}

function SuggestionForm({ recipe, token, onSubmitted }) {
  const [field, setField] = useState("instructions");
  const [value, setValue] = useState(recipe.instructions || "");
  const [ingredients, setIngredients] = useState(recipe.ingredients || []);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function changeField(next) {
    setField(next);
    const original = recipe[next];
    setValue(numbers.includes(next) ? (Array.isArray(original) ? original[0] ?? "" : original ?? "") : original || "");
    setIngredients(recipe.ingredients?.length ? recipe.ingredients.map((item) => ({ ...item })) : [{ name: "", quantity: "", unit: "" }]);
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const suggestedValue = field === "ingredients"
        ? ingredients.map((item) => ({ ...item, name: item.name.trim(), quantity: item.quantity === "" || item.quantity == null ? null : Number(item.quantity) }))
        : numbers.includes(field) ? Number(value) : value;
      const response = await fetch(`${API_URL}/api/recipe/${recipe._id}/suggestions`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ field, suggestedValue, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not submit suggestion.");
      onSubmitted();
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  function changeIngredient(index, key, next) {
    setIngredients((current) => current.map((item, i) => i === index ? { ...item, [key]: next } : item));
  }

  return <form onSubmit={submit} className="mt-5 grid gap-4">
    <label>Field to suggest changing
      <select className={inputStyle} value={field} onChange={(event) => changeField(event.target.value)} disabled={busy}>
        {Object.entries(fields).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
    {field === "ingredients" ? <fieldset className="grid gap-3">
      <legend>Proposed ingredients</legend>
      {ingredients.map((item, index) => <div key={index} className="flex flex-wrap gap-2">
        <label className="min-w-0 flex-1">Ingredient<input className={`${inputStyle} suggestion-text`} value={item.name || ""} required onChange={(event) => changeIngredient(index, "name", event.target.value)} /></label>
        <label>Quantity<input className={`${inputStyle} suggestion-text`} type="number" min="0" step="any" value={item.quantity ?? ""} onChange={(event) => changeIngredient(index, "quantity", event.target.value)} /></label>
        <label>Unit<input className={`${inputStyle} suggestion-text`} value={item.unit || ""} onChange={(event) => changeIngredient(index, "unit", event.target.value)} /></label>
        <button type="button" className="btn btn-danger btn-sm" disabled={busy || ingredients.length === 1} onClick={() => setIngredients((current) => current.filter((_, i) => i !== index))}>Remove</button>
      </div>)}
      <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setIngredients((current) => [...current, { name: "", quantity: "", unit: "" }])}>Add ingredient</button>
    </fieldset> : <label>Proposed {fields[field].toLowerCase()}
      {numbers.includes(field)
        ? <input className={`${inputStyle} suggestion-text`} type="number" min={field === "servings" ? 1 : 0} step="any" required value={value} onChange={(event) => setValue(event.target.value)} />
        : <textarea className={`${inputStyle} suggestion-text`} rows={field === "instructions" ? 6 : 3} required={["name", "instructions"].includes(field)} value={value} onChange={(event) => setValue(event.target.value)} />}
    </label>}
    <label>Reason for the change (optional)<textarea className={inputStyle} rows={2} value={note} onChange={(event) => setNote(event.target.value)} /></label>
    {error && <p role="alert" className="text-[#9b2424]">{error}</p>}
    <button className="btn btn-primary justify-self-start" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit for owner approval"}</button>
  </form>;
}

export default function RecipeSuggestions({ recipe, token, isOwner, onApproved }) {
  const { data, isLoading, error, refetch } = useFetch(`${API_URL}/api/recipe/${recipe._id}/suggestions`, token);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const suggestions = data?.suggestions || [];

  async function review(id, status) {
    setBusyId(id);
    setActionError("");
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/api/recipe/${recipe._id}/suggestions/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not review suggestion.");
      setMessage(status === "approved" ? "Suggestion approved. The recipe has been updated." : "Suggestion rejected. The recipe is unchanged.");
      refetch();
      if (status === "approved") onApproved();
    } catch (error) { setActionError(error.message); }
    finally { setBusyId(null); }
  }

  return <section className="mx-auto mt-8 max-w-5xl rounded-2xl border border-[#dbe3e6] bg-white p-8 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-2xl font-semibold text-[#0d5686]">Suggested edits</h2>
      {!isOwner && <button className="btn btn-secondary" type="button" onClick={() => setShowForm((current) => !current)}>{showForm ? "Cancel suggestion" : "Suggest edits"}</button>}
    </div>
    <p className="mt-3 text-[#69767b]">Collaborator proposals appear in <span className="suggestion-text font-semibold">purple</span> with the author's name. The owner approves changes before they become part of the recipe.</p>
    {showForm && !isOwner && <SuggestionForm recipe={recipe} token={token} onSubmitted={() => { setShowForm(false); setMessage("Suggestion submitted for owner approval."); refetch(); }} />}
    {message && <p role="status" className="mt-4 text-[#0d5686]">{message}</p>}
    {actionError && <p role="alert" className="mt-4 text-[#9b2424]">{actionError}</p>}
    {isLoading ? <p className="mt-4">Loading suggestions…</p> : error ? <p role="alert" className="mt-4 text-[#9b2424]">Could not load suggestions.</p> : suggestions.length === 0 ? <p className="mt-4 text-[#69767b]">No suggested edits yet.</p> : <div className="mt-5 grid gap-4">
      {suggestions.map((suggestion) => <article key={suggestion._id} className="rounded-xl border border-[#ded3ee] bg-[#faf7ff] p-5">
        <h3 className="font-semibold text-[#0d5686]">{fields[suggestion.field]} — {suggestion.status}</h3>
        <p className="mt-2 suggestion-text">Suggested by {suggestion.author?.username || suggestion.author?.email || "a collaborator"}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><p className="font-semibold text-[#0d5686]">Original at submission</p><p className="mt-2 whitespace-pre-wrap text-[#536168]">{displayValue(suggestion.originalValue)}</p></div>
          <div><p className="font-semibold suggestion-text">Proposed change</p><p className="mt-2 whitespace-pre-wrap suggestion-text">{displayValue(suggestion.suggestedValue)}</p></div>
        </div>
        {suggestion.note && <p className="mt-3 suggestion-text">Reason: {suggestion.note}</p>}
        {isOwner && suggestion.status === "pending" && <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" disabled={busyId !== null} onClick={() => review(suggestion._id, "approved")}>Approve</button>
          <button type="button" className="btn btn-danger" disabled={busyId !== null} onClick={() => review(suggestion._id, "rejected")}>Reject</button>
        </div>}
      </article>)}
    </div>}
  </section>;
}
