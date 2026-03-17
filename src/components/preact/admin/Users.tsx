import { useState, useEffect } from 'preact/hooks';
import gsap from 'gsap';
import Modal from '../ui/Modal';
import UserForm from './UserForm';
import type { User } from '@db/schema.d'
import { getToken } from '@/utils/jwt';

const fetchUsers = async (token: string): Promise<User[]> => {
  const res = await fetch('/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

const createUser = async (userData: Partial<User>, token: string) => {
  const res = await fetch('/api/admin/user/0', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
};

const updateUser = async (id: string, userData: Partial<User>, token: string) => {
  const res = await fetch(`/api/admin/user/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
};

const deleteUser = async (id: string, token: string) => {
  const res = await fetch(`/api/admin/user/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
};


export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const token = getToken()

  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUsers(token)
        .then((data) => {
          setUsers(data);
          setLoading(false);
          gsap.fromTo('.user-list-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [token]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      if (token) {
        deleteUser(id, token).then(() => {
          setUsers(users.filter(user => user.id !== id));
          gsap.to(`#user-${id}`, { opacity: 0, duration: 0.3, onComplete: () => { } }); // Fade out animation
        }).catch(setError);
      }
    }
  };

  const handleFormSubmit = async (formData: Partial<User>) => {
    if (token) {
      try {
        if (modalMode === 'create') {
          const newUser = await createUser(formData, token);
          setUsers([...users, newUser]);
        } else if (modalMode === 'edit' && selectedUser) {
          await updateUser(selectedUser.id!, formData, token);
          setUsers(users.map(user => user.id === selectedUser.id ? formData : user));
        }
        setIsModalOpen(false);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  return (
    <>
      {error && <div class="text-red-500 mb-4">{error}</div>}
      <button onClick={handleCreate} class="cursor-pointer mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
        Create New User
      </button>
      {loading ? (
        <div class="text-center">Loading...</div>
      ) : (
        <table class="w-full border-collapse border border-slate-300 dark:border-slate-700">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-700">
              <th class="p-2 border border-slate-300 dark:border-slate-700">Name</th>
              <th class="p-2 border border-slate-300 dark:border-slate-700">Email</th>
              <th class="p-2 border border-slate-300 dark:border-slate-700">Role</th>
              <th class="p-2 border border-slate-300 dark:border-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr id={`user-${user.id}`} class="user-list-item border-t hover:bg-slate-500/10">
                <td class="p-2">{user.name}</td>
                <td class="p-2">{user.email}</td>
                <td class="p-2">{user.role}</td>
                <td class="p-2">
                  <button onClick={() => handleEdit(user)} class="mr-2 px-2 py-1 bg-emerald-500 hover:opacity-80 text-white rounded cursor-pointer">Edit</button>
                  <button onClick={() => handleDelete(user.id!)} class="px-2 py-1 bg-red-500 hover:opacity-80 text-white rounded cursor-pointer">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <UserForm user={selectedUser} onSubmit={handleFormSubmit} />
        </Modal>
      )}
    </>
  );
};
