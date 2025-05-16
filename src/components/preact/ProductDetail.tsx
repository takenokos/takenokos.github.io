import { useState, useEffect } from "preact/hooks";
import { gsap } from "gsap";

interface ProductDetailProps {
  slug?: string
}

async function fetchProductWithVariants(slug: string) {
  const response = await fetch(`/api/product/${slug}`); // Updated to include variants
  return response.json();
}

export default function ProductDetail({ slug }: ProductDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [selectedCombinations, setSelectedCombinations] = useState({}); // e.g., { color: 'Red', size: 'M' }
  const [availableVariant, setAvailableVariant] = useState<any>(null);

  useEffect(() => {
    fetchProductWithVariants(slug || "").then((data) => {
      setProduct(data.product);
      setAvailableVariant(data.variants); // Includes attributes and variants
      gsap.from(".variant-options", {
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
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">{product.name}</h1>
      <img
        src={product.imageUrl}
        alt={product.name}
        class="w-full h-64 object-cover mb-4"
      />
      <p class="text-gray-700 mb-4">{product.description}</p>
      <p class="text-xl font-semibold">Base Price: ${product.price}</p>

      <div class="variant-options mt-4">
        {availableVariant?.attributes?.map((attrGroup: any) => (
          <div key={attrGroup.attributeId} class="mb-4">
            <label class="block text-sm font-medium mb-2">
              {attrGroup.name}
            </label>{" "}
            {/* e.g., "Color" */}
            <select
              onChange={(e: Event) =>
                handleSelectionChange(attrGroup.name, (e.target as HTMLSelectElement).value)
              }
              class="p-2 border rounded w-full"
            >
              {attrGroup.values.map(
                (
                  value: any, // Assuming values are in attrGroup
                ) => (
                  <option key={value.id} value={value.value}>
                    {value.value}
                  </option>
                ),
              )}
            </select>
          </div>
        ))}
      </div>

      <button
        onClick={validateAndAddToCart}
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add to Cart with Selected Variant
      </button>
    </div>
  );
};
