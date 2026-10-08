import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { useState } from "react";
import { API_URL } from "../config/api";

function startOfWeek(date) {
  const day = new Date(date);
  day.setHours(12, 0, 0, 0);
  day.setDate(day.getDate() - day.getDay());
  return day;
}

function weekKey(date) {
  return startOfWeek(date).toISOString().slice(0, 10);
}

function ShoppingList() {
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [makeWeeklyBuy, setMakeWeeklyBuy] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() =>
    startOfWeek(new Date()),
  );
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const { data: weeklyData, refetch: refetchWeekly } = useFetch(
    `${API_URL}/api/shopping-list/weekly-buys`,
    token,
  );
  const weeklyBuys = weeklyData?.weeklyBuys || [];

  const { data, isLoading, error, refetch } = useFetch(
    `${API_URL}/api/shopping-list`,
    token,
  );

  const shoppingLists = data?.shoppingLists || [];
  const currentList = shoppingLists.find(
    (list) => weekKey(list.weekOf) === weekKey(selectedWeek),
  );

  function changeWeek(amount) {
    setSelectedWeek((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + amount * 7);
      return startOfWeek(next);
    });
    setNotice("");
    setActionError("");
  }

  const [editingItemId, setEditingItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editWeeklyBuy, setEditWeeklyBuy] = useState(false);

  if (isLoading) {
    return <p>Loading shopping list...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  async function handleAddItem(event) {
    event.preventDefault();

    if (
      !name.trim() ||
      !currentList ||
      !Number.isFinite(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      setActionError("Enter an item name and a quantity greater than zero.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/shopping-list/${currentList._id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            quantity: Number(quantity),
            unit: unit.trim(),
            makeWeeklyBuy,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not add item.");
      }

      setName("");
      setQuantity("");
      setUnit("");
      setMakeWeeklyBuy(false);
      setShowAddForm(false);
      setActionError("");
      refetchWeekly();
      refetch();
    } catch (error) {
      setActionError(error.message);
    }
  }

  async function handleCreateShoppingList() {
    if (currentList || isCreatingList) {
      setNotice("A shopping list already exists for this week.");
      return;
    }
    setIsCreatingList(true);
    setActionError("");
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/api/shopping-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ weekOf: selectedWeek.toISOString(), items: [] }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Could not create shopping list.");
      setNotice(
        response.status === 201
          ? "Shopping list created. Your Weekly Buys have been added."
          : "This week's shopping list already exists.",
      );
      refetch();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsCreatingList(false);
    }
  }

  async function handleStatusChange(listId, itemId, status) {
    try {
      const response = await fetch(
        `${API_URL}/api/shopping-list/${listId}/items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update item.");
      }

      refetch();
    } catch (error) {
      console.error("Update shopping item error:", error);
    }
  }

  function startEditing(item) {
    setEditingItemId(item._id);
    setEditName(item.name);
    setEditQuantity(String(item.quantity ?? ""));
    setEditUnit(item.unit || "");
    setEditWeeklyBuy(Boolean(item.weeklyBuy));
  }

  async function handleEditItem(listId, itemId) {
    if (
      !editName.trim() ||
      !Number.isFinite(Number(editQuantity)) ||
      Number(editQuantity) <= 0
    ) {
      setActionError("Enter an item name and a quantity greater than zero.");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/shopping-list/${listId}/items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            quantity: Number(editQuantity),
            unit: editUnit.trim(),
            makeWeeklyBuy: editWeeklyBuy,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update item.");
      }

      setEditingItemId(null);
      setEditName("");
      setEditQuantity("");
      setEditUnit("");
      setEditWeeklyBuy(false);
      setActionError("");
      refetchWeekly();
      refetch();
    } catch (error) {
      setActionError(error.message);
    }
  }

  async function handleDeleteItem(listId, itemId) {
    try {
      const response = await fetch(
        `${API_URL}/api/shopping-list/${listId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete item.");
      }

      refetch();
    } catch (error) {
      console.error("Delete shopping item error:", error);
    }
  }

  async function handlePutAway(listId, item) {
    const answer = window.prompt(
      `How much ${item.name} are you putting away? Enter a number followed by an optional unit (example: 2 lb or 3 cans).`,
      `${item.quantity ?? ""} ${item.unit || ""}`.trim(),
    );
    if (answer === null) return;
    const match = answer.trim().match(/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/);
    if (!match || Number(match[1]) <= 0) {
      setActionError(
        "Enter a number followed by an optional unit, such as 2 lb.",
      );
      return;
    }
    try {
      setActionError("");
      const response = await fetch(
        `${API_URL}/api/shopping-list/${listId}/items/${item._id}/put-away`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: Number(match[1]), unit: match[2] }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Could not put away item.");
      refetch();
    } catch (error) {
      setActionError(error.message);
    }
  }

  async function handleRemoveWeeklyBuy(buyId) {
    try {
      const response = await fetch(
        `${API_URL}/api/shopping-list/weekly-buys/${buyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Could not remove Weekly Buy.");
      refetchWeekly();
    } catch (error) {
      setActionError(error.message);
    }
  }

  return (
    <main className="main min-h-screen bg-[#fffefa] px-8 py-10">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
        THE RECIPE BOX
      </p>

      <h1 className="text-4xl font-semibold text-[#0d5686]">Shopping List</h1>

      <p className="mt-3 text-[#5f6b70]">
        Keep track of what you need for the week.
      </p>

      {notice && (
        <p role="status" className="mt-4 text-[#0d5686]">
          {notice}
        </p>
      )}
      {actionError && (
        <p role="alert" className="mt-4 text-red-600">
          {actionError}
        </p>
      )}
      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-[#0d5686]">Weekly Buys</h2>
        <p className="text-sm text-[#5f6b70]">
          These automatically appear when you create a new weekly shopping list.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {weeklyBuys.map((buy) => (
            <span
              key={buy._id}
              className="rounded-lg bg-[#fff3a6] px-3 py-2 text-sm"
            >
              {buy.name} ({buy.quantity}
              {buy.unit ? ` ${buy.unit}` : ""}){" "}
              <button
                type="button"
                onClick={() => handleRemoveWeeklyBuy(buy._id)}
                aria-label={`Stop recurring ${buy.name}`}
                className="btn btn-danger btn-icon ml-2"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => changeWeek(-1)}
            className="btn btn-secondary"
          >
            ← Previous Week
          </button>
          <strong className="text-[#0d5686]">
            Week of{" "}
            {selectedWeek.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </strong>
          <button
            type="button"
            onClick={() => changeWeek(1)}
            className="btn btn-secondary"
          >
            Next Week →
          </button>
        </div>
        {!currentList && (
          <button
            type="button"
            onClick={handleCreateShoppingList}
            disabled={isCreatingList}
            className="btn btn-primary mt-4"
          >
            {isCreatingList ? "Creating..." : "Create List for This Week"}
          </button>
        )}
      </section>
      {currentList && (
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm((previous) => !previous)}
              aria-expanded={showAddForm}
              className="btn btn-primary ml-auto w-fit"
            >
              {showAddForm ? "Cancel Adding Item" : "+ Add Item"}
            </button>
          </div>
          {showAddForm && (
            <form
              onSubmit={handleAddItem}
              className="mt-5 flex flex-wrap items-end gap-4"
            >
              <div className="min-w-[220px] flex-1">
                <label
                  htmlFor="item-name"
                  className="mb-2 block text-sm font-semibold text-[#0d5686]"
                >
                  Item
                </label>
                <input
                  id="item-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Chicken thighs"
                  className="w-full rounded-xl border border-[#dbe3e6] px-4 py-2.5 outline-none focus:border-[#1677b8]"
                />
              </div>
              <div className="w-28">
                <label
                  htmlFor="quantity"
                  className="mb-2 block text-sm font-semibold text-[#0d5686]"
                >
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="2"
                  className="w-full rounded-xl border border-[#dbe3e6] px-4 py-2.5 outline-none focus:border-[#1677b8]"
                />
              </div>
              <div className="w-32">
                <label
                  htmlFor="item-unit"
                  className="mb-2 block text-sm font-semibold text-[#0d5686]"
                >
                  Unit
                </label>
                <input
                  id="item-unit"
                  type="text"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                  placeholder="lb, count, bag"
                  className="w-full rounded-xl border border-[#dbe3e6] px-4 py-2.5 outline-none focus:border-[#1677b8]"
                />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm text-[#0d5686]">
                <input
                  type="checkbox"
                  checked={makeWeeklyBuy}
                  onChange={(event) => setMakeWeeklyBuy(event.target.checked)}
                  className="h-4 w-4 accent-[#0d5686]"
                />
                Buy every week
              </label>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Item
              </button>
            </form>
          )}
        </section>
      )}

      <section className="mt-8">
        {!currentList ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[#0d5686]">
              No shopping list for this week
            </h2>

            <p className="mt-2 text-sm text-[#7c858b]">
              Create a list for the selected week to automatically add your
              Weekly Buys.
            </p>

            <button
              type="button"
              onClick={handleCreateShoppingList}
              className="btn btn-primary mt-5"
            >
              Create List for This Week
            </button>
          </div>
        ) : (
          [currentList].map((list) => (
            <div
              key={list._id}
              className="mb-6 rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-[#0d5686]">
                Shopping List
              </h2>

              {list.items?.length === 0 ? (
                <p className="mt-4 text-sm text-[#7c858b]">
                  No items yet. Add something above.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {list.items?.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-[#e3eaed] px-4 py-3"
                    >
                      {editingItemId === item._id ? (
                        <>
                          <div className="flex flex-1 gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(event) =>
                                setEditName(event.target.value)
                              }
                              className="flex-1 rounded-lg border border-[#dbe3e6] px-3 py-2 outline-none focus:border-[#1677b8]"
                            />

                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={editQuantity}
                              onChange={(event) =>
                                setEditQuantity(event.target.value)
                              }
                              placeholder="2"
                              aria-label="Edit quantity"
                              className="w-24 rounded-lg border border-[#dbe3e6] px-3 py-2 outline-none focus:border-[#1677b8]"
                            />
                            <input
                              type="text"
                              value={editUnit}
                              onChange={(event) =>
                                setEditUnit(event.target.value)
                              }
                              placeholder="lb"
                              aria-label="Edit unit"
                              className="w-24 rounded-lg border border-[#dbe3e6] px-3 py-2 outline-none focus:border-[#1677b8]"
                            />
                          </div>

                          <label className="flex items-center gap-2 text-sm text-[#0d5686]">
                            <input
                              type="checkbox"
                              checked={editWeeklyBuy}
                              onChange={(event) =>
                                setEditWeeklyBuy(event.target.checked)
                              }
                              className="h-4 w-4 accent-[#0d5686]"
                            />
                            Buy every week
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditItem(list._id, item._id)}
                              className="btn btn-primary btn-sm"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="btn btn-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="font-semibold text-[#0d5686]">
                              {item.name}
                            </p>
                            {item.weeklyBuy && (
                              <span className="text-xs text-[#1677b8]">
                                Weekly Buy
                              </span>
                            )}

                            <p className="text-sm text-[#7c858b]">
                              Quantity: {item.quantity}
                              {item.unit ? ` ${item.unit}` : ""}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <select
                              value={item.status}
                              onChange={(event) =>
                                handleStatusChange(
                                  list._id,
                                  item._id,
                                  event.target.value,
                                )
                              }
                              className="rounded-lg border border-[#dbe3e6] bg-[#edf6fa] px-3 py-2 text-sm font-semibold text-[#1677b8] outline-none"
                            >
                              <option value="planned">Planned</option>
                              <option value="in-cart">In Cart</option>
                              <option value="purchased">Purchased</option>
                            </select>

                            {item.status === "purchased" &&
                              !item.kitchenItem && (
                                <button
                                  type="button"
                                  onClick={() => handlePutAway(list._id, item)}
                                  className="btn btn-accent btn-sm"
                                >
                                  Put Away in Kitchen
                                </button>
                              )}
                            {item.kitchenItem && (
                              <span className="text-xs text-green-700">
                                In Kitchen ✓
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => startEditing(item)}
                              className="btn btn-secondary btn-sm"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteItem(list._id, item._id)
                              }
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default ShoppingList;
