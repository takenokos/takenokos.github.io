import { useEffect, useState } from "preact/hooks";
import { request } from "@/utils/jwt";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
  status: "active" | "inactive" | "archived";
}

interface SubscribersResponse {
  data: Subscriber[];
}

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSubscribers() {
      try {
        const res = await request<SubscribersResponse>(
          "/api/admin/subscribers",
        );
        if (res) setSubscribers(res.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load subscribers",
        );
      } finally {
        setLoading(false);
      }
    }
    loadSubscribers();
  }, []);

  const updateStatus = async (id: string, status: Subscriber["status"]) => {
    const res = await request<{ data: Subscriber }>(
      `/api/admin/subscriber/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    if (res) {
      setSubscribers((current) =>
        current.map((subscriber) =>
          subscriber.id === id ? res.data : subscriber,
        ),
      );
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm("Delete this subscriber?")) return;
    const res = await request<{ success: boolean }>(
      `/api/admin/subscriber/${id}`,
      { method: "DELETE" },
    );
    if (res) {
      setSubscribers((current) => current.filter((item) => item.id !== id));
    }
  };

  if (loading) return <p>Loading subscribers...</p>;

  return (
    <>
      {error && <p class="mb-4 text-red-600">{error}</p>}
      {subscribers.length === 0 ? (
        <p>No subscribers found.</p>
      ) : (
        <table class="w-full border-collapse border border-slate-300 dark:border-slate-700">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-700">
              <th class="p-2 border">Email</th>
              <th class="p-2 border">Status</th>
              <th class="p-2 border">Created</th>
              <th class="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} class="border-t">
                <td class="p-2 border">{subscriber.email}</td>
                <td class="p-2 border">
                  <select
                    value={subscriber.status}
                    onChange={(event) =>
                      updateStatus(
                        subscriber.id,
                        (event.target as HTMLSelectElement)
                          .value as Subscriber["status"],
                      )
                    }
                    class="border rounded p-1"
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="archived">archived</option>
                  </select>
                </td>
                <td class="p-2 border">
                  {new Date(subscriber.createdAt).toLocaleString()}
                </td>
                <td class="p-2 border">
                  <button
                    type="button"
                    onClick={() => deleteSubscriber(subscriber.id)}
                    class="px-3 py-1 rounded bg-red-500 text-white cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
