import { useState, useEffect } from "preact/hooks";
import { gsap } from "gsap";
import type {
  Product,
  ProductAttribute,
  ProductAttributeValue,
  ProductVariant,
} from "@/db/schema.d";

interface ProductDetailProps {
  slug?: string;
}
async function fetchProductWithVariants(slug: string) {
  const response = await fetch(`/api/product/${slug}`); // Updated to include variants
  return response.json();
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [selectedCombinations, setSelectedCombinations] = useState({}); // e.g., { color: 'Red', size: 'M' }
  const [variant, setVariant] = useState<ProductVariant[]>([]);

  useEffect(() => {
    fetchProductWithVariants(slug || "").then((data) => {
      setProduct(data.product);
      setAttributes(data.attributes);
      setVariant(data.variants);
      gsap.from(".variant-options>*", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
      }); // GSAP animation
    });
  }, [slug]);

  const handleSelectionChange = (attribute: string, value: string) => {
    setSelectedCombinations({ ...selectedCombinations, [attribute]: value });
  };

  const validateAndAddToCart = async () => {
    const response = await fetch("/api/product/validate-variant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product?.id,
        combinations: selectedCombinations,
      }),
    });
    const variantData = await response.json();
    if (response.ok) {
      // Proceed to add to cart, e.g., alert(`Added ${variantData.sku} to cart`);
    } else {
      alert("Invalid combination");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <>
      <section class="flex gap-10 rounded shadow p-5 backdrop-blur-md bg-white/10 dark:bg-black/10">
        <img
          src={product.imageUrl}
          alt={product.name}
          class="w-96 h-96 object-cover mb-4 shadow-sm rounded-sm"
          loading="lazy"
        />
        <div>
          <h1 class="text-3xl font-bold mb-4">{product.name}</h1>
          <p class="text-xl font-semibold">Base Price: ${product.price}</p>
          <div class="variant-options mt-4">
            {attributes.map((attr: ProductAttribute) => (
              <div key={attr.id} class="mb-4">
                <label class="block text-sm font-medium mb-2">
                  {attr.attribute}
                </label>{" "}
                <div class="flex flex-wrap gap-4">
                  {(attr.values || []).map((value: ProductAttributeValue) => (
                    <label key={value.id} class="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`attribute-${attr.id}`} // Group radio buttons by attribute
                        value={value.value}
                        onChange={() =>
                          handleSelectionChange(attr.attribute, value.value)
                        }
                        class="appearance-none w-4 h-4 border border-slate-300 rounded-full checked:border-indigo-500 transition checked:relative checked:after:border-2 checked:after:border-slate-50 checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:transform checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-3 checked:after:h-3 checked:after:rounded-full checked:after:bg-indigo-500"
                      />
                      <span>{value.value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={validateAndAddToCart}
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add to Cart
          </button>
        </div>
      </section>
      <section class="my-4 rounded shadow p-5 backdrop-blur-md bg-white/10 dark:bg-black/10">
        {product.description}
      </section>
    </>
  );
}
