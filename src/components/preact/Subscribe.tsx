import { useState } from "preact/hooks";
export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
          console.log('Subscribe success')
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Subscribe failed');
    } finally {
      setLoading(false);
    }
  };
  return (

    <form onSubmit={handleSubmit}>
      <div class="flex">
        <input
          type="email"
          value={email}
          onInput={(e: any) => setEmail(e.target.value)}
          placeholder="Enter your email"
          class="px-4 py-2 rounded-l-full bg-slate-200 dark:bg-slate-700 focus:outline-none text-slate-950 dark:text-slate-50"
          required
        />
        <button
          type="submit"
          class="cursor-pointer bg-indigo-500 px-4 py-2 rounded-r-full hover:bg-indigo-600 text-white"
          disabled={loading}
        >
          {loading ? 'Subscribing' : 'Subscribe'}
        </button>
      </div>
      {error && <p class="text-red-500 mb-2">{error}</p>}
    </form>
  )
}
