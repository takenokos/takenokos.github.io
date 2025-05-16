import { useState, useEffect } from 'preact/hooks';
import { gsap } from 'gsap';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import MdEditor from './MdEditor'

interface CommentSectionProps {
  postId: string,
  isLogin?: Boolean
}

export default function CommentSection({ postId, isLogin }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadComments() {
      try {
        const response = await fetch(`/api/comments/${postId}`);
        const data = await response.json()
        setComments(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load comments');
        setIsLoading(false);
      }
    }
    loadComments();
  }, [postId]);

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    if (!isLogin) {
      alert('Please log in to comment');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentText: newComment }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setComments([...comments, ...newCommentData]);
        setNewComment('');
        gsap.from('.comment-item', { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 });
      } else {
        setError(response.statusText);
      }
    } catch (err) {
      setError('Failed to submit comment');
      console.log(err)
    }
  }
  const parseMd = (markdown: string) => {
    const rawHtml = marked.parse(markdown); // Parse Markdown to HTML
    return DOMPurify.sanitize(rawHtml as string); // Sanitize the HTML to prevent XSS
  }


  return (
    <div class="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4 ">Comments</h2>
      {isLoading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p class="text-red-500">{error}</p>
      ) : (
        <div>
          <ul class="space-y-4">
            {comments.map((comment: any) => (
              <li key={comment.id} class="comment-item p-2 bg-white dark:bg-slate-700 rounded flex gap-2">
                <img src={comment.avatar} class="w-12 h-12 rounded-full shadow shadow-indigo-500" />
                <div class="flex-1">
                  <p class="font-medium flex justify-between">
                    <span><strong>{comment.username}</strong> <small><em>said:</em></small></span>
                    <small class="text-slate-500">{new Date(comment.createdAt).toLocaleString()}</small>
                  </p>
                  <div class="dark:prose-invert prose prose-sm prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: parseMd(comment.commentText) }}></div>
                </div>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit} class="mt-6">
            <MdEditor value={newComment} setValue={setNewComment} placeholder="Add your comment..." />
            <button type="submit" class="cursor-pointer px-3 py-1 bg-indigo-500 text-slate-50 text-base rounded hover:bg-indigo-600">
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
