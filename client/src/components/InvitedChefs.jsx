import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { API_URL } from "../config/api";

const roleLabels = {
  chef: "Chef",
  "sous-chef": "Sous Chef",
  "co-executive-chef": "Co-Executive Chef",
};

function InvitedChefs({ recipeId, token, refreshKey = 0 }) {
  const { data, isLoading, error, refetch } = useFetch(
    `${API_URL}/api/recipe/${recipeId}/shares`,
    token,
  );

  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const shares = data?.shares || [];

  const [lastRefreshKey, setLastRefreshKey] = useState(refreshKey);

  if (refreshKey !== lastRefreshKey) {
    setLastRefreshKey(refreshKey);
    refetch();
  }

  async function handleRoleChange(shareId, role) {
    setBusyId(shareId);
    setActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/recipe/${recipeId}/shares/${shareId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update chef role.");
      }

      refetch();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(shareId) {
    if (!window.confirm("Remove this chef's access to the recipe?")) {
      return;
    }

    setBusyId(shareId);
    setActionError("");

    try {
      const response = await fetch(
        `${API_URL}/api/recipe/${recipeId}/shares/${shareId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Could not remove chef.");
      }

      refetch();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8 border-t border-[#dbe3e6] pt-6">
      <h3 className="text-xl font-semibold text-[#0d5686]">Invited Chefs</h3>

      {actionError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {actionError}
        </p>
      )}

      {isLoading ? (
        <p className="mt-4 text-[#69767b]">Loading kitchen team...</p>
      ) : error ? (
        <p className="mt-4 text-red-600">Could not load invited chefs.</p>
      ) : shares.length === 0 ? (
        <p className="mt-4 text-[#69767b]">No chefs have been invited yet.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {shares.map((share) => (
            <div
              key={share._id}
              className="flex flex-col gap-4 rounded-xl border border-[#dbe3e6] bg-[#fffefa] p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-[#0d5686]">
                  {share.user?.username || "Chef"}
                </p>

                <p className="text-sm text-[#69767b]">{share.user?.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  aria-label={`Role for ${share.user?.username || "chef"}`}
                  value={share.role}
                  onChange={(event) =>
                    handleRoleChange(share._id, event.target.value)
                  }
                  disabled={busyId !== null}
                  className="rounded-xl border border-[#b9ccd5] bg-white px-3 py-2 text-sm text-[#0d5686]"
                >
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleRemove(share._id)}
                  disabled={busyId !== null}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {busyId === share._id ? "Updating..." : "Remove Access"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InvitedChefs;
