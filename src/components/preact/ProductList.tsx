import { useState, useEffect } from "preact/hooks";
import { gsap } from "gsap";
import type { Category } from "@/db/schema.d";
import { useLoading } from "./ui/LoadingProgressBar";
interface ProductListProps {
  category?: string;
  categories?: Category[];
}

const fetchProducts = async (category: string | null) => {
  const url = `/api/products/${category || "all"}`;
  const response = await fetch(url);
  return response.json();
};

export default function ProductList({
  category,
  categories = [],
}: ProductListProps) {
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState<string>(
    category || "",
  );
  const { setIsLoading, removeIsLoading } = useLoading();
  useEffect(() => {
    return () => {
      removeIsLoading();
    };
  }, []);
  useEffect(() => {
    setIsLoading(true);
    fetchProducts(currentCategory)
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        gsap.from(".product-card", {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.1,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentCategory]);

  return (
    <>
      <h1 class="text-3xl font-bold mb-4">Products</h1>
      <select
        value={currentCategory}
        onChange={(e: Event) =>
          setCurrentCategory((e.target as HTMLSelectElement).value)
        }
        class="mb-4 p-2 border rounded"
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option value={category.name}>{category.name}</option>
        ))}
      </select>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product: any) => (
          <a
            href={`/product/${product.slug}`}
            class="product-card block border rounded shadow hover:shadow-lg overflow-hidden group"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              class="w-full h-48 object-cover transition group-hover:scale-105"
            />
            <h2 class="text-xl font-semibold mx-4 mt-4 transition group-hover:scale-105">
              {product.name}
            </h2>
            <p class="text-slate-600 dark:text-slate-400 mx-4 mb-4 transition group-hover:scale-105">
              ${product.price}
            </p>
          </a>
        ))}
      </div>
    </>
  );
}
