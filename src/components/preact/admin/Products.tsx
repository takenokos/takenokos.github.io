import { useState, useEffect } from 'preact/hooks';
import { gsap } from 'gsap';
import type { Product } from '@db/schema.d'
import { getToken } from '@/utils/jwt';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({ categoryId: '', stock: 0 });
  const token = getToken()

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const queryParams = `?search=${searchTerm}&categoryId=${filter.categoryId}&stock=${filter.stock}`;
      const response = await fetch(`/api/admin/products${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProducts(data);
      setLoading(false);
      gsap.from('.product-item', { opacity: 0, y: 20, duration: 0.5, stagger: 0.1 }); // Animate list items
    }
    if (token)
      fetchProducts();
  }, [searchTerm, filter, token]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await fetch(`/api/admin/product/${id}`, { method: 'DELETE' });
      // Refresh list
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
    }
  };

  return (
    <>
      <header class="flex ">
        <input type="text" onInput={(e: Event) => setSearchTerm((e.target as HTMLInputElement).value)} placeholder="Search by name or SKU" class="w-full p-2 border rounded mb-4" />
        <select onChange={(e: Event) => setFilter({ ...filter, categoryId: (e.target as HTMLInputElement).value })} class="p-2 border rounded mb-4">
          <option value="">All Categories</option>
        </select>
      </header>
      <main>
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <li key={product.id} class="product-item border p-4 rounded shadow hover:shadow-lg">
                <h3 class="text-xl font-bold">{product.name}</h3>
                <p>Price: ${product.price} | Stock: {product.stock}</p>
                <button onClick={() => handleDelete(product.id!)} class="bg-red-500 text-white px-4 py-2 mr-2">Delete</button>
                <a href={`/admin/product/edit/${product.id}`} class="bg-indigo-500 text-white px-4 py-2">Edit</a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
};
