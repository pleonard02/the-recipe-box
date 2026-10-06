import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";

const emptyItem = {
  name: "",
  quantity: "",
  unit: "",
  category: "ingredient",
  expirationDate: "",
};

function MyKitchen() {
  const { token } = useAuth();
  const [kitchenItems, setKitchenItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState(emptyItem);
  const [editingItemId, setEditingItemId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  useEffect(() => {
    async function getKitchenItems() {
      try {
        const response = await fetch("http://localhost:3000/api/kitchen-item", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not retrieve kitchen items.");
        }

        setKitchenItems(data.kitchenItems);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Kitchen error:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      getKitchenItems();
    }
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;
    setNewItem((currentItem) => ({ ...currentItem, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = await fetch(
        editingItemId
          ? `http://localhost:3000/api/kitchen-item/${editingItemId}`
          : "http://localhost:3000/api/kitchen-item",
        {
          method: editingItemId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newItem,
            quantity: Number(newItem.quantity),
            expirationDate: newItem.expirationDate || null,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add kitchen item.");
      }

      setKitchenItems((items) =>
        editingItemId
          ? items.map((item) =>
              item._id === editingItemId ? data.kitchenItem : item,
            )
          : [...items, data],
      );
      closeForm();
    } catch (error) {
      console.error("Save kitchen item error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  function openEditForm(item) {
    setEditingItemId(item._id);
    setNewItem({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit || "",
      category: item.category,
      expirationDate: item.expirationDate
        ? new Date(item.expirationDate).toISOString().slice(0, 10)
        : "",
    });
    setShowAddForm(true);
  }

  function closeForm() {
    setShowAddForm(false);
    setEditingItemId(null);
    setNewItem(emptyItem);
  }

  async function handleDelete(itemId) {
    if (!window.confirm("Remove this item from your kitchen?")) return;

    setErrorMessage("");
    setDeletingItemId(itemId);

    try {
      const response = await fetch(
        `http://localhost:3000/api/kitchen-item/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete kitchen item.");
      }

      setKitchenItems((items) => items.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error("Delete kitchen item error:", error);
      setErrorMessage(error.message);
    } finally {
      setDeletingItemId(null);
    }
  }

  const filteredItems = kitchenItems.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const expiringSoonCount = kitchenItems.filter((item) => {
    if (!item.expirationDate) return false;
    const daysLeft = Math.ceil(
      (new Date(item.expirationDate).setHours(0, 0, 0, 0) -
        new Date().setHours(0, 0, 0, 0)) /
        86400000,
    );
    return daysLeft >= 0 && daysLeft <= 7;
  }).length;

  const categories = [
    { id: "all", label: "All items" },
    { id: "ingredient", label: "Ingredients" },
    { id: "leftover", label: "Leftovers" },
    { id: "frozen meal", label: "Frozen meals" },
  ];

  const inputClassName =
    "mt-2 w-full rounded-lg border border-[#d9e2e8] bg-white px-3 py-2.5 text-sm text-[#253238] outline-none transition placeholder:text-[#87939a] focus:border-[#1677b8] focus:ring-4 focus:ring-[#1677b8]/10";
    
  return (
    <main className="main min-h-screen bg-[#f7f8f6] px-5 py-8 font-sans text-[#253238] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#e6e9e6] pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b88a00]">
              Pantry &amp; inventory
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#0d5686] sm:text-4xl">
              My kitchen
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66737b] sm:text-base">
              A clear view of what you have, what needs attention, and what
              belongs on your next shopping list.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showAddForm) closeForm();
              else setShowAddForm(true);
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-[#0d5686] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#09466f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677b8] sm:self-auto"
          >
            <span aria-hidden="true" className="text-lg leading-none">+</span>
            {showAddForm ? "Close form" : "Add item"}
          </button>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-[#f1c7c2] bg-[#fff4f2] px-4 py-3 text-sm text-[#9d3428]"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
              className="font-semibold text-[#9d3428] hover:text-[#70251d]"
            >
              Dismiss
            </button>
          </div>
        )}

        <section
          aria-label="Kitchen inventory summary"
          className="mb-8 grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              label: "Tracked items",
              value: kitchenItems.length,
              detail: "Across your kitchen",
              accent: "border-l-[#1677b8]",
            },
            {
              label: "Ingredients",
              value: kitchenItems.filter((item) => item.category === "ingredient").length,
              detail: "Ready to cook with",
              accent: "border-l-[#75864b]",
            },
            {
              label: "Expiring this week",
              value: expiringSoonCount,
              detail: "Use these up soon",
              accent: "border-l-[#d6a500]",
            },
          ].map((stat) => (
            <article
              key={stat.label}
              className={`rounded-xl border border-[#e5e9e8] border-l-4 ${stat.accent} bg-white p-5 shadow-[0_2px_8px_rgba(24,49,63,0.03)]`}
            >
              <p className="text-sm font-medium text-[#66737b]">{stat.label}</p>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="text-3xl font-bold tracking-tight text-[#0d5686]">
                  {isLoading ? "—" : stat.value}
                </p>
                <p className="text-xs text-[#87939a]">{stat.detail}</p>
              </div>
            </article>
          ))}
        </section>

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-xl border border-[#dfe6e7] bg-white p-5 shadow-[0_4px_16px_rgba(24,49,63,0.05)] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#0d5686]">
                  {editingItemId ? "Edit inventory item" : "Add to your kitchen"}
                </h2>
                <p className="mt-1 text-sm text-[#66737b]">
                  Keep quantities and dates up to date for a reliable inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md px-2 py-1 text-sm font-semibold text-[#66737b] hover:bg-[#f2f5f4] hover:text-[#253238]"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold text-[#35444b]">
                Item name
                <input
                  name="name"
                  value={newItem.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Brown sugar"
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-semibold text-[#35444b]">
                Quantity
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="any"
                  value={newItem.quantity}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-semibold text-[#35444b]">
                Unit
                <input
                  name="unit"
                  value={newItem.unit}
                  onChange={handleChange}
                  maxLength={30}
                  placeholder="lb, cans, cups"
                  className={inputClassName}
                />
              </label>
              <label className="text-sm font-semibold text-[#35444b]">
                Category
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleChange}
                  className={inputClassName}
                >
                  <option value="ingredient">Ingredient</option>
                  <option value="leftover">Leftover</option>
                  <option value="frozen meal">Frozen meal</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-[#35444b] sm:col-span-2">
                Best-by date
                <input
                  name="expirationDate"
                  type="date"
                  value={newItem.expirationDate}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#edf0ef] pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-[#d9e2e8] px-4 py-2.5 text-sm font-semibold text-[#52616a] transition hover:bg-[#f7f8f6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-[#0d5686] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09466f] disabled:cursor-wait disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : editingItemId
                    ? "Save changes"
                    : "Add item"}
              </button>
            </div>
          </form>
        )}

        <section aria-label="Kitchen inventory">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#253238]">Inventory</h2>
              <p className="mt-1 text-sm text-[#66737b]">
                {isLoading
                  ? "Loading your kitchen..."
                  : `${filteredItems.length} ${filteredItems.length === 1 ? "item" : "items"} shown`}
              </p>
            </div>
            <label className="flex w-full items-center gap-3 rounded-lg border border-[#d9e2e8] bg-white px-3 py-2.5 transition focus-within:border-[#1677b8] focus-within:ring-4 focus-within:ring-[#1677b8]/10 sm:max-w-xs">
              <span className="sr-only">Search your inventory</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 shrink-0 text-[#87939a]"
              >
                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search items..."
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#253238] outline-none placeholder:text-[#87939a]"
              />
            </label>
          </div>

          <div
            role="group"
            aria-label="Filter inventory by category"
            className="mb-5 flex gap-1 overflow-x-auto border-b border-[#e3e8e7]"
          >
            {categories.map((category) => {
              const count =
                category.id === "all"
                  ? kitchenItems.length
                  : kitchenItems.filter(
                      (item) => item.category === category.id,
                    ).length;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category.id)}
                  className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-[#1677b8] text-[#0d5686]"
                      : "border-transparent text-[#66737b] hover:border-[#cbd8dc] hover:text-[#253238]"
                  }`}
                >
                  {category.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive
                        ? "bg-[#e8f4fa] text-[#0d5686]"
                        : "bg-[#eef1f0] text-[#66737b]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div
              role="status"
              aria-label="Loading inventory"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {[0, 1, 2].map((placeholder) => (
                <div
                  key={placeholder}
                  className="h-44 animate-pulse rounded-xl border border-[#e5e9e8] bg-white p-5"
                >
                  <div className="h-3 w-24 rounded bg-[#edf1ef]" />
                  <div className="mt-5 h-5 w-36 rounded bg-[#edf1ef]" />
                  <div className="mt-3 h-4 w-20 rounded bg-[#edf1ef]" />
                  <div className="mt-7 h-px w-full bg-[#edf1ef]" />
                </div>
              ))}
            </div>
          ) : kitchenItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#cfdde1] bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f4fa] text-2xl text-[#1677b8]">
                +
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0d5686]">
                Your kitchen is ready to organize
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#66737b]">
                Add ingredients, leftovers, and frozen meals to keep your
                inventory in one reliable place.
              </p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-5 rounded-lg bg-[#0d5686] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09466f]"
              >
                Add your first item
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-[#e5e9e8] bg-white px-6 py-12 text-center">
              <h3 className="text-base font-bold text-[#35444b]">
                No matching items
              </h3>
              <p className="mt-2 text-sm text-[#66737b]">
                Try another search or category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="mt-4 text-sm font-semibold text-[#1677b8] hover:text-[#0d5686]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => {
                const daysLeft = item.expirationDate
                  ? Math.ceil(
                      (new Date(item.expirationDate).setHours(0, 0, 0, 0) -
                        new Date().setHours(0, 0, 0, 0)) /
                        86400000,
                    )
                  : null;
                const isExpired = daysLeft !== null && daysLeft < 0;
                const expiresSoon = daysLeft !== null && daysLeft <= 7;
                const categoryLabel =
                  categories.find((category) => category.id === item.category)
                    ?.label ?? item.category;

                return (
                  <article
                    key={item._id}
                    className="flex min-h-48 flex-col rounded-xl border border-[#e2e8e7] bg-white p-5 shadow-[0_2px_8px_rgba(24,49,63,0.03)] transition hover:border-[#c8dce3] hover:shadow-[0_8px_24px_rgba(24,49,63,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex rounded-md bg-[#f2f6f5] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#587078]">
                        {categoryLabel}
                      </span>
                      <span className="text-right text-xs font-medium text-[#66737b]">
                        Quantity
                        <span className="mt-1 block text-base font-bold text-[#253238]">
                          {item.quantity}
                          {item.unit ? ` ${item.unit}` : ""}
                        </span>
                      </span>
                    </div>

                    <h3 className="mt-5 break-words text-lg font-bold leading-snug text-[#0d5686]">
                      {item.name}
                    </h3>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#edf0ef] pt-4">
                      <p
                        className={`text-xs font-medium ${
                          isExpired
                            ? "text-[#a4392e]"
                            : expiresSoon
                              ? "text-[#9a7000]"
                              : "text-[#66737b]"
                        }`}
                      >
                        {item.expirationDate ? (
                          <>
                            {isExpired
                              ? "Expired"
                              : daysLeft === 0
                                ? "Expires today"
                                : expiresSoon
                                  ? `Expires in ${daysLeft} days`
                                  : "Best by"}{" "}
                            {!isExpired &&
                              daysLeft > 7 &&
                              new Date(item.expirationDate).toLocaleDateString()}
                            {isExpired &&
                              ` · ${new Date(item.expirationDate).toLocaleDateString()}`}
                          </>
                        ) : (
                          "No best-by date"
                        )}
                      </p>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          aria-label={`Edit ${item.name}`}
                          className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#1677b8] transition hover:bg-[#edf6fa] hover:text-[#0d5686]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingItemId === item._id}
                          aria-label={`Delete ${item.name}`}
                          className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#8a5c58] transition hover:bg-[#fff1ef] hover:text-[#9d3428] disabled:opacity-50"
                        >
                          {deletingItemId === item._id
                            ? "Removing..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default MyKitchen;
