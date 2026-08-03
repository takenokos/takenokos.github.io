import { useEffect, useState } from "preact/hooks";
import { gsap } from "gsap";
import type { Category, Product } from "@db/schema.d";
import { request } from "@/utils/jwt";

interface ProductsResponse {
  data: Product[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface CategoriesResponse {
  data: Category[];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse["pagination"]>({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({ categoryId: "", stock: 0 });

  const animateProducts = () => {
    requestAnimationFrame(() => {
      gsap.from(".product-item", {
        opacity: 0,
        y: 20,
        duration: 0.35,
        stagger: 0.05,
      });
    });
  };

  const fetchProducts = async (offset = 0) => {
    const isLoadingMore = offset > 0;
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const params = new URLSearchParams({
        limit: String(pagination.limit),
        offset: String(offset),
        stock: String(filter.stock),
      });
      if (searchTerm) params.set("search", searchTerm);
      if (filter.categoryId) params.set("categoryId", filter.categoryId);

      const res = await request<ProductsResponse>(
        `/api/admin/products?${params.toString()}`,
      );
      if (!res) return;

      setProducts((current) =>
        isLoadingMore ? [...current, ...res.data] : res.data,
      );
      setPagination(res.pagination);
      animateProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      const res = await request<CategoriesResponse>("/api/admin/categories");
      if (res) setCategories(res.data || []);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(0);
  }, [searchTerm, filter]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      const res = await request<{ success: boolean }>(
        `/api/admin/product/${id}`,
        { method: "DELETE" },
      );
      if (!res) return;

      setProducts((current) => current.filter((p) => p.id !== id));
      setPagination((current) => ({
        ...current,
        total: Math.max(current.total - 1, 0),
      }));
    }
  };

  return (
    <>
      <header class="flex gap-2">
        <input
          type="text"
          onInput={(e: Event) =>
            setSearchTerm((e.target as HTMLInputElement).value)
          }
          placeholder="Search by name or SKU"
          class="w-full p-2 border rounded mb-4"
        />
        <select
          onChange={(e: Event) =>
            setFilter({
              ...filter,
              categoryId: (e.target as HTMLSelectElement).value,
            })
          }
          class="p-2 border rounded mb-4"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </header>
      <main>
        {error && <p class="mb-4 text-red-600">{error}</p>}
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  class="product-item border p-4 rounded shadow hover:shadow-lg"
                >
                  <h3 class="text-xl font-bold">{product.name}</h3>
                  <p>
                    Price: ${product.price} | Stock: {product.stock}
                  </p>
                  <button
                    onClick={() => handleDelete(product.id!)}
                    class="bg-red-500 text-white px-4 py-2 mr-2"
                  >
                    Delete
                  </button>
                  <a
                    href={`/admin/product/edit/${product.id}`}
                    class="bg-indigo-500 text-white px-4 py-2"
                  >
                    Edit
                  </a>
                </li>
              ))}
            </ul>
            <footer class="mt-4 flex items-center justify-between">
              <p>
                Showing {products.length} of {pagination.total}
              </p>
              <button
                type="button"
                disabled={!pagination.hasMore || loadingMore}
                onClick={() =>
                  fetchProducts(pagination.offset + pagination.limit)
                }
                class="bg-slate-900 text-white px-4 py-2 rounded disabled:bg-slate-300"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
