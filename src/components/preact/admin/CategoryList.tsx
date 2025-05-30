import { useEffect } from 'preact/hooks';
import type { FunctionalComponent } from 'preact';
import { gsap } from 'gsap';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryList: FunctionalComponent<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
  useEffect(() => {
    gsap.fromTo('.category-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
  }, [categories]);

  return (
    <ul class="space-y-4">
      {categories.map((category) => (
        <li key={category.id} class="category-item flex justify-between items-center p-4 border rounded shadow">
          <div>
            <h2 class="text-xl font-semibold">{category.name}</h2>
            <p class="text-slate-600">{category.description || 'No description'}</p>
          </div>
          <div>
            <button
              onClick={() => onEdit(category)}
              class="cursor-pointer bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-1 px-2 rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(category.id)}
              class="cursor-pointer bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default CategoryList;
