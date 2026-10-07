import { useAuth } from "../context/useAuth";
import useFetch from "../hooks/useFetch";
import { useState } from "react";

function ShoppingList() {
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");

  const { data, isLoading, error, refetch } = useFetch(
    "http://localhost:3000/api/shopping-list",
    token,
  );

  const shoppingLists = data?.shoppingLists || [];
  const currentList = shoppingLists[0];

  const [editingItemId, setEditingItemId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");

  if (isLoading) {
    return <p>Loading shopping list...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  async function handleAddItem(event) {
    event.preventDefault();

    if (!name.trim() || !currentList) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/shopping-list/${currentList._id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            quantity,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not add item.");
      }

      setName("");
      setQuantity("");
      refetch();
    } catch (error) {
      console.error("Add shopping item error:", error);
    }
  }

  async function handleCreateShoppingList() {
    try {
      const response = await fetch("http://localhost:3000/api/shopping-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weekOf: new Date(),
          items: [],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not create shopping list.");
      }

      refetch();
    } catch (error) {
      console.error("Create shopping list error:", error);
    }
  }

  async function handleStatusChange(listId, itemId, status) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/shopping-list/${listId}/items/${itemId}`,
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
    setEditQuantity(item.quantity);
  }

  async function handleEditItem(listId, itemId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/shopping-list/${listId}/items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            quantity: editQuantity,
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

      refetch();
    } catch (error) {
      console.error("Edit shopping item error:", error);
    }
  }

  async function handleDeleteItem(listId, itemId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/shopping-list/${listId}/items/${itemId}`,
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

  return (
    <main className="main min-h-screen bg-[#fffefa] px-8 py-10">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
        THE RECIPE BOX
      </p>

      <h1 className="text-4xl font-semibold text-[#0d5686]">Shopping List</h1>

      <p className="mt-3 text-[#5f6b70]">
        Keep track of what you need for the week.
      </p>

      {currentList && (
        <form
          onSubmit={handleAddItem}
          className="mt-8 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-6 shadow-sm"
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
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Milk, lemons, chicken..."
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
              type="text"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="5 lb bag"
              className="w-full rounded-xl border border-[#dbe3e6] px-4 py-2.5 outline-none focus:border-[#1677b8]"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-[#0d5686] px-6 py-2.5 font-semibold text-[#fff3a6] transition hover:-translate-y-0.5"
          >
            + Add Item
          </button>
        </form>
      )}

      <section className="mt-8">
        {shoppingLists.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-[#0d5686]">
              Your shopping list is empty
            </h2>

            <p className="mt-2 text-sm text-[#7c858b]">
              Add your first grocery item to get started.
            </p>

            <button
              type="button"
              onClick={handleCreateShoppingList}
              className="mt-5 rounded-xl bg-[#0d5686] px-6 py-2.5 font-semibold text-[#fff3a6]"
            >
              Create Shopping List
            </button>
          </div>
        ) : (
          shoppingLists.map((list) => (
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
                              onChange={(event) => setEditName(event.target.value)}
                              className="flex-1 rounded-lg border border-[#dbe3e6] px-3 py-2 outline-none focus:border-[#1677b8]"
                            />

                            <input
                              type="text"
                              value={editQuantity}
                              onChange={(event) => setEditQuantity(event.target.value)}
                              placeholder="5 lb bag"
                              className="w-32 rounded-lg border border-[#dbe3e6] px-3 py-2 outline-none focus:border-[#1677b8]"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditItem(list._id, item._id)}
                              className="rounded-lg bg-[#0d5686] px-3 py-2 text-sm font-semibold text-[#fff3a6]"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="rounded-lg border border-[#dbe3e6] px-3 py-2 text-sm font-semibold text-[#5f6b70]"
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

                            <p className="text-sm text-[#7c858b]">
                              Quantity: {item.quantity}
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

                            <button
                              type="button"
                              onClick={() => startEditing(item)}
                              className="rounded-lg border border-[#1677b8] px-3 py-2 text-sm font-semibold text-[#1677b8] hover:bg-[#edf6fa]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(list._id, item._id)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
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
