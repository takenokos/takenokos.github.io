import { useState } from 'preact/hooks';

export default function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false)
  async function handleLogin(e: Event) {
    e.preventDefault();
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('adminJWT', data.token);
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div class="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleLogin} class="p-6 bg-white rounded shadow-md w-full max-w-md motion-opacity-in motion-translate-y-in-25">
        <h2 class="text-2xl font-bold mb-4">Admin Login</h2>
        {error && <p class="text-red-500  mb-2 motion-opacity-in">{error}</p>}
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Please input your email"
            value={email}
            onInput={(e: Event) => setEmail((e.target as HTMLInputElement).value)}
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1" for="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Please input your password"
            value={password}
            onInput={(e: Event) => setPassword((e.target as HTMLInputElement).value)}
            class="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" class="cursor-pointer w-full bg-indigo-500 text-white p-2 rounded hover:bg-indigo-600 disabled:cursor-not-allowed" disabled={loading}>
          {loading ? 'Logining' : 'Login'}
        </button>
      </form>
    </div>
  );
};
