import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { API_URL } from "../config/api";

function RecipeNotes({ recipeId, token }) {
  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data, isLoading, error, refetch } = useFetch(
    `${API_URL}/api/recipe/${recipeId}/notes`,
    token,
  );

  const notes = data?.notes || [];

  async function handleAddNote(event) {
    event.preventDefault();

    if (!noteText.trim()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_URL}/api/recipe/${recipeId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: noteText.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not add note.");
      }

      setNoteText("");
      refetch();
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-5xl rounded-2xl border border-[#dbe3e6] bg-white p-8 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1677b8]">
        COLLABORATIVE KITCHEN
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-[#0d5686]">
        Recipe Notes
      </h2>

      <p className="mt-2 text-[#69767b]">
        Share cooking tips, substitutions, and what worked when you made this
        recipe.
      </p>

      <form onSubmit={handleAddNote} className="mt-6">
        <label
          htmlFor="recipe-note"
          className="mb-2 block text-sm font-semibold text-[#0d5686]"
        >
          Add a Note
        </label>

        <textarea
          id="recipe-note"
          value={noteText}
          onChange={(event) => setNoteText(event.target.value)}
          rows={4}
          required
          placeholder="I added extra garlic and reduced the cooking time..."
          className="w-full rounded-xl border border-[#b9ccd5] bg-white px-4 py-3 text-[#33454d] outline-none focus:border-[#1677b8]"
        />

        <button
          type="submit"
          disabled={isSubmitting || !noteText.trim()}
          className="btn btn-primary mt-3"
        >
          {isSubmitting ? "Saving..." : "Add Note"}
        </button>
      </form>

      {submitError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="mt-8 border-t border-[#dbe3e6] pt-6">
        <h3 className="text-lg font-semibold text-[#0d5686]">
          Kitchen Notes ({notes.length})
        </h3>

        {isLoading ? (
          <p className="mt-4 text-[#69767b]">Loading notes...</p>
        ) : error ? (
          <p className="mt-4 text-red-600">Could not load notes.</p>
        ) : notes.length === 0 ? (
          <p className="mt-4 text-[#69767b]">
            No notes yet. Be the first to share a cooking tip!
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {notes.map((note) => (
              <article
                key={note._id}
                className="rounded-xl border border-[#dbe3e6] bg-[#fffefa] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#0d5686]">
                    {note.author?.username || "Chef"}
                  </p>

                  <time className="text-xs text-[#7c858b]">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </time>
                </div>

                <p className="mt-3 whitespace-pre-line text-[#536168]">
                  {note.text}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default RecipeNotes;
