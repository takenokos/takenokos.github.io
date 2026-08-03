import { useState, useEffect } from "preact/hooks";
import CategoryList from "./CategoryList";
import CategoryForm from "./CategoryForm";
import Modal from "../ui/Modal";
import type { Category } from "@db/schema.d";
import { getToken } from "@/utils/jwt";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false); // State for form modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null); // For editing mode
  const token = getToken();
  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories", {
      headers: { Authorization: `Bearer ${token}` },
    }); // Assuming API endpoint from CRUD functions
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  };
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchCategories();
        setCategories(data.data || []); // Assuming API returns { success: true, data: [...] }
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null); // Reset for new creation
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/category/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.success) {
      setCategories(categories.filter((cat) => cat.id !== id)); // Update state
    } else {
      alert(result.error); // Simple error handling
    }
  };

  const handleFormSubmit = async (formData: Category) => {
    let res;
    if (editingCategory) {
      // Update existing
      res = await fetch(`/api/admin/category/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    } else {
      // Create new
      res = await fetch("/api/admin/category/0", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    }
    const result = await res.json();
    if (result.success) {
      setIsFormOpen(false); // Close form
      // Refresh categories
      const updatedData = await fetchCategories();
      setCategories(updatedData.data || []);
    } else {
      alert(result.error);
    }
  };

  return (
    <>
      {error && <p class="text-red-500">{error}</p>}
      <button
        onClick={handleCreate}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add New Category
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <Modal onClose={() => setIsFormOpen(false)}>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleFormSubmit}
          />
        </Modal>
      )}
    </>
  );
};

export default CategoriesPage;
