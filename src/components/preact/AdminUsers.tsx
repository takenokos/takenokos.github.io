import { useEffect, useState } from 'preact/hooks';
import { getToken } from '@/utils/jwt.ts'
import { gsap } from 'gsap';

export default function AdminUsers() {
  const token = getToken()
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!token) return
    async function fetchAdminUsers() {
      const response = await fetch('/api/admin/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        gsap.fromTo('.admin-list>div', { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.1 });
      }
    }
    fetchAdminUsers();
  }, [token]);

  return (
    <div class="admin-list mt-4 space-y-4 motion-opacity-in">
      {users.map((user: any) => (
        <div key={user.id} class="p-4 border rounded bg-slate-100">
          <p>{user.name} ({user.email}) - Role: {user.role}</p>
        </div>
      ))}
    </div>
  );
};
