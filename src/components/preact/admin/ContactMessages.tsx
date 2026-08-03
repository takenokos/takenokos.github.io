import { useEffect, useState } from "preact/hooks";
import { request } from "@/utils/jwt";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: "pending" | "read" | "archived";
}

interface ContactMessagesResponse {
  data: ContactMessage[];
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await request<ContactMessagesResponse>(
          "/api/admin/contact-messages",
        );
        if (res) setMessages(res.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages",
        );
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  const updateStatus = async (id: string, status: ContactMessage["status"]) => {
    const res = await request<{ data: ContactMessage }>(
      `/api/admin/contact-message/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    if (res) {
      setMessages((current) =>
        current.map((message) => (message.id === id ? res.data : message)),
      );
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this contact message?")) return;
    const res = await request<{ success: boolean }>(
      `/api/admin/contact-message/${id}`,
      { method: "DELETE" },
    );
    if (res) setMessages((current) => current.filter((item) => item.id !== id));
  };

  if (loading) return <p>Loading contact messages...</p>;

  return (
    <>
      {error && <p class="mb-4 text-red-600">{error}</p>}
      {messages.length === 0 ? (
        <p>No contact messages found.</p>
      ) : (
        <table class="w-full border-collapse border border-slate-300 dark:border-slate-700">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-700">
              <th class="p-2 border">Sender</th>
              <th class="p-2 border">Message</th>
              <th class="p-2 border">Status</th>
              <th class="p-2 border">Created</th>
              <th class="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} class="border-t align-top">
                <td class="p-2 border">
                  <div>{message.name}</div>
                  <a href={`mailto:${message.email}`} class="text-indigo-600">
                    {message.email}
                  </a>
                </td>
                <td class="p-2 border max-w-xl whitespace-pre-wrap">
                  {message.message}
                </td>
                <td class="p-2 border">
                  <select
                    value={message.status}
                    onChange={(event) =>
                      updateStatus(
                        message.id,
                        (event.target as HTMLSelectElement)
                          .value as ContactMessage["status"],
                      )
                    }
                    class="border rounded p-1"
                  >
                    <option value="pending">pending</option>
                    <option value="read">read</option>
                    <option value="archived">archived</option>
                  </select>
                </td>
                <td class="p-2 border">
                  {new Date(message.createdAt).toLocaleString()}
                </td>
                <td class="p-2 border">
                  <button
                    type="button"
                    onClick={() => deleteMessage(message.id)}
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
