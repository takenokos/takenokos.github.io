import { useState, useEffect } from "preact/hooks";
import { gsap } from "gsap";

interface ProductListProps {
  category?: string
}

const fetchProducts = async (category: string | null) => {
  const url = `/api/products/${category || ""}`;
  const response = await fetch(url);
  return response.json();
};

export default function ProductList({ category }: ProductListProps) {
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState<string>(category || '');

  useEffect(() => {
    fetchProducts(currentCategory).then((data) => {
      setProducts(data);
      gsap.from(".product-card", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
      });
    });
  }, [currentCategory]);

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">Products</h1>
      <select onChange={(e: Event) => setCurrentCategory((e.target as HTMLSelectElement).value)} class="mb-4 p-2 border rounded">
        <option value="">All Categories</option>
      </select>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product: any) => (
          <a
            href={`/products/${product.slug}`}
            class="product-card block p-4 border rounded shadow hover:shadow-lg"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              class="w-full h-48 object-cover mb-2"
            />
            <h2 class="text-xl font-semibold">{product.name}</h2>
            <p class="text-gray-600">${product.price}</p>
          </a>
        ))}
      </div>
    </div>
  );
};
