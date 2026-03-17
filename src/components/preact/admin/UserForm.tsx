import { useState } from 'preact/hooks';
import type { User } from "@db/schema.d";
interface FormUser extends User {
  password?: string
}
interface UserFormProps {
  user?: FormUser | null;
  onSubmit: (user: User) => void;
}
export default function UserForm({ user, onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<FormUser>(user || { name: '', email: '', password: '', role: '' });

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    setFormData({ ...formData, [target.name]: target.value });
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" value={formData.name as string} onInput={handleChange} placeholder="Name" class="border p-2 mb-2 w-full rounded" required />
      <input type="email" name="email" value={formData.email as string} onInput={handleChange} placeholder="Email" class="border p-2 mb-2 w-full rounded" required />
      <input type="password" name="password" value={formData.password as string} onInput={handleChange} placeholder="Password" class="border p-2 mb-2 w-full rounded" />
      <input type="text" name="role" value={formData.role} onInput={handleChange} placeholder="Role" class="border p-2 mb-2 w-full rounded" required />
      <button type="submit" class="px-4 py-2 bg-indigo-500 text-white rounded cursor-pointer">Submit</button>
    </form>
  );
}
