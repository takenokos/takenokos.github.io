import { useEffect, useState } from "preact/hooks";
import { request } from "@/utils/jwt";

interface AdminComment {
  id: string;
  postId: string;
  commentText: string;
  createdAt: string;
  username?: string | null;
  email?: string | null;
}

interface CommentsResponse {
  data: AdminComment[];
}

export default function Comments() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await request<CommentsResponse>("/api/admin/comments");
        if (res) setComments(res.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load comments",
        );
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    const res = await request<{ success: boolean }>(
      `/api/admin/comment/${id}`,
      {
        method: "DELETE",
      },
    );
    if (res) setComments((current) => current.filter((item) => item.id !== id));
  };

  if (loading) return <p>Loading comments...</p>;

  return (
    <>
      {error && <p class="mb-4 text-red-600">{error}</p>}
      {comments.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <table class="w-full border-collapse border border-slate-300 dark:border-slate-700">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-700">
              <th class="p-2 border">Post</th>
              <th class="p-2 border">Author</th>
              <th class="p-2 border">Comment</th>
              <th class="p-2 border">Created</th>
              <th class="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} class="border-t align-top">
                <td class="p-2 border">{comment.postId}</td>
                <td class="p-2 border">
                  {comment.username || comment.email || "Unknown"}
                </td>
                <td class="p-2 border max-w-xl whitespace-pre-wrap">
                  {comment.commentText}
                </td>
                <td class="p-2 border">
                  {new Date(comment.createdAt).toLocaleString()}
                </td>
                <td class="p-2 border">
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
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
