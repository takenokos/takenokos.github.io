import type { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import type { Category } from '@db/schema.d'

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: { name: string; description?: string }) => void;
  onClose?: () => void;
}

const CategoryForm: FunctionalComponent<CategoryFormProps> = ({ category, onSubmit }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="mb-4">
        <label class="block text-slate-700">Name</label>
        <input
          type="text"
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          class="w-full p-2 border rounded min-w-md"
          required
        />
      </div>
      <div class="mb-4">
        <label class="block text-slate-700">Description</label>
        <textarea
          value={description}
          onInput={(e) => setDescription((e.target as HTMLInputElement).value)}
          class="w-full p-2 border rounded"
        />
      </div>
      <button
        type="submit"
        class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
      >
        Save
      </button>
    </form>
  );
};

export default CategoryForm;
