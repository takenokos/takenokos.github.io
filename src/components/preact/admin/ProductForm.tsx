import { useState, useEffect } from "preact/hooks";
import gsap from "gsap";
import type { Product, Category } from "@db/schema.d";
import { uniqueKey } from "@/utils/uniqueKey";
import { getToken } from "@/utils/jwt";

interface ProductFormType extends Product {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
  attributes: Array<{
    attribute: string;
    _uniqueKey?: string;
  }>; // Maps to productAttributes
  variants: Array<{
    id?: string;
    sku: string;
    combinations: { [key: string]: string }; // JSON object, e.g., { color: "Red", size: "M" }
    additionalPrice: number;
    stock: number;
    isAvailable: boolean;
    _uniqueKey?: string;
  }>;
}

interface ProductFormProps {
  id?: string; // If product is provided, it's edit mode
  onSave?: () => void; // Callback after save
}

export default function ProductForm({ id, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormType>({
    id: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    categoryId: "",
    imageUrl: "",
    isFeatured: false,
    attributes: [{ attribute: "", _uniqueKey: uniqueKey() }],
    variants: [
      {
        sku: "",
        combinations: {},
        additionalPrice: 0,
        stock: 0,
        isAvailable: true,
        _uniqueKey: uniqueKey(),
      },
    ],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const token = getToken();
  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  };
  const fetchProduct = async () => {
    const res = await fetch(`/api/admin/product/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
  };

  useEffect(() => {
    const loadProduct = async () => {
      const data = await fetchProduct();
      setFormData({
        ...data,
        attributes: (data.attributes || []).map(
          (attribute: ProductFormType["attributes"][number]) => ({
            ...attribute,
            _uniqueKey: attribute._uniqueKey || uniqueKey(),
          }),
        ),
        variants: (data.variants || []).map(
          (variant: ProductFormType["variants"][number]) => ({
            ...variant,
            _uniqueKey: variant._uniqueKey || uniqueKey(),
          }),
        ),
      });
    };
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data.data || []);
    };
    if (id) {
      loadProduct();
    }
    loadCategories();
    gsap.fromTo(
      ".form-container",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    );
  }, []);

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    if (name === "price" || name === "stock" || name === "additionalPrice") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === "isFeatured") {
      setFormData({ ...formData, [name]: target.checked }); // For boolean
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAttributeChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value }; // Only attribute
    setFormData({ ...formData, attributes: newAttributes });
  };

  const addAttribute = () => {
    const key = uniqueKey();
    const newAttributes = [
      ...formData.attributes,
      { attribute: "", _uniqueKey: key },
    ];
    setFormData({ ...formData, attributes: newAttributes });
    requestAnimationFrame(() => {
      gsap.fromTo(
        `#attribute-${key}`,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 },
      );
    });
  };

  const removeAttribute = (key: string) => {
    gsap.to(`#attribute-${key}`, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      onComplete: () => {
        const newAttributes = formData.attributes.filter(
          (attr) => attr._uniqueKey !== key,
        );
        setFormData({ ...formData, attributes: newAttributes });
      },
    });
  };

  const handleVariantChange = (
    variantIndex: number,
    field: string,
    value: string | boolean | number,
  ) => {
    const newVariants = [...formData.variants];
    if (field.startsWith("combinations.")) {
      // Handle combinations dynamically
      const key = field.split(".")[1];
      newVariants[variantIndex].combinations[key] = value as string;
    } else if (field === "additionalPrice" || field === "stock") {
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        [field]: parseFloat(value as string) || 0,
      };
    } else if (field === "isAvailable") {
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        [field]: value as boolean,
      };
    } else {
      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        [field]: value as string,
      };
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    const key = uniqueKey();
    const newVariants = [
      ...formData.variants,
      {
        sku: "",
        combinations: {},
        additionalPrice: 0,
        stock: 0,
        isAvailable: true,
        _uniqueKey: key,
      },
    ];
    setFormData({ ...formData, variants: newVariants });
    requestAnimationFrame(() => {
      gsap.fromTo(
        `#variant-${key}`,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 },
      );
    });
  };

  const removeVariant = (key: string) => {
    gsap.to(`#variant-${key}`, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      onComplete: () => {
        const newVariants = formData.variants.filter(
          (variant) => variant._uniqueKey !== key,
        );
        setFormData({ ...formData, variants: newVariants });
      },
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.slug) newErrors.slug = "Slug is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be positive";
    if (formData.stock < 0) newErrors.stock = "Stock must be non-negative";
    if (!formData.categoryId) newErrors.categoryId = "Category ID is required";
    if (!formData.imageUrl) newErrors.imageUrl = "Image URL is required";
    if (formData.attributes.some((attr) => !attr.attribute))
      newErrors.attributes = "All attributes must have an attribute";
    if (
      formData.variants.some(
        (v) => !v.sku || Object.keys(v.combinations).length === 0,
      )
    )
      newErrors.variants = "All variants must have SKU and combinations";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setApiError("");
    try {
      const apiUrl = id ? `/api/admin/product/${id}` : "/api/admin/product/0";
      const method = id ? "PUT" : "POST";
      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Server error");
      }
      gsap.to(".form-container", {
        scale: 1.1,
        duration: 0.3,
        onComplete: () => {
          gsap.to(".form-container", { scale: 1, duration: 0.3 });
          onSave && onSave();
        },
      });
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {apiError && (
        <div class="bg-red-500 p-2 rounded mb-4 text-white">{apiError}</div>
      )}
      <form onSubmit={handleSubmit} class="gap-4 grid grid-cols-2">
        <div>
          <label
            htmlFor="name"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
          />
          {errors.name && <p class="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label
            htmlFor="price"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
          />
          {errors.price && <p class="text-red-500 text-sm">{errors.price}</p>}
        </div>
        <div>
          <label
            htmlFor="stock"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Stock
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
          />
          {errors.stock && <p class="text-red-500 text-sm">{errors.stock}</p>}
        </div>
        <div>
          <label
            htmlFor="categoryId"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Category ID
          </label>
          <select
            class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
          >
            {categories.map((category) => (
              <option value={category.id}>{category.name}</option>
            ))}
          </select>
          {errors.categoryId && (
            <p class="text-red-500 text-sm">{errors.categoryId}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="slug"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
          />
          {errors.slug && <p class="text-red-500 text-sm">{errors.slug}</p>}
        </div>
        <div>
          <label
            htmlFor="imageUrl"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Image Url
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
          />
          {errors.imageUrl && <p class="text-red-500">{errors.imageUrl}</p>}
        </div>
        <div>
          <label
            htmlFor="isFeatured"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Is Featured
          </label>
          <input
            class="mt-1 p2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured as boolean}
            onChange={handleChange}
          />
          {errors.isFeatured && <p class="text-red-500">{errors.isFeatured}</p>}
        </div>
        <div class="col-span-2">
          <label
            htmlFor="description"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
            rows={4}
          />
          {errors.description && (
            <p class="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>
        <div>
          <label>Attributes</label>
          {formData.attributes.map((attr, index) => {
            return (
              <div
                key={attr._uniqueKey}
                id={`attribute-${attr._uniqueKey}`}
                class="flex space-x-2 mb-2 p-2 border border-slate-200 dark:border-slate-600 rounded"
              >
                <input
                  value={attr.attribute}
                  onChange={(e: Event) =>
                    handleAttributeChange(
                      index,
                      "attribute",
                      (e.target as HTMLInputElement).value,
                    )
                  }
                  placeholder="Attribute"
                  class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
                />
                <button
                  type="button"
                  class="cursor-pointer bg-red-500 text-white p-2 rounded"
                  onClick={() => removeAttribute(attr._uniqueKey!)}
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button
            class="cursor-pointer mt-2 bg-emerald-500 text-white py-1 px-3 rounded"
            type="button"
            onClick={addAttribute}
          >
            Add Attribute
          </button>
          {errors.attributes && <p class="text-red-500">{errors.attributes}</p>}
        </div>
        <div>
          <label>Variants</label>
          {formData.variants.map((variant, variantIndex) => {
            return (
              <div
                key={variant._uniqueKey}
                id={`variant-${variant._uniqueKey}`}
                class="grid grid-cols-2 gap-2 mb-2 p-2 border border-slate-200 dark:border-slate-600 rounded"
              >
                <div>
                  <label
                    htmlFor={`sku_${variantIndex}`}
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    SKU
                  </label>
                  <input
                    id={`sku_${variantIndex}`}
                    class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e: Event) =>
                      handleVariantChange(
                        variantIndex,
                        "sku",
                        (e.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>
                {formData.attributes.map((attr, attrIndex) => {
                  return (
                    <div key={attrIndex}>
                      <label
                        htmlFor={`${attr.attribute}_${variantIndex}`}
                        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        {attr.attribute}
                      </label>
                      <input
                        id={`${attr.attribute}_${variantIndex}`}
                        class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
                        placeholder={attr.attribute}
                        value={variant.combinations[attr.attribute] || ""}
                        onChange={(e: Event) =>
                          handleVariantChange(
                            variantIndex,
                            `combinations.${attr.attribute}`,
                            (e.target as HTMLInputElement).value,
                          )
                        }
                      />
                    </div>
                  );
                })}
                <div>
                  <label
                    htmlFor={`additionalPrice_${variantIndex}`}
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Additional Price
                  </label>
                  <input
                    id={`additionalPrice_${variantIndex}`}
                    class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
                    placeholder="Additional Price"
                    value={variant.additionalPrice}
                    onChange={(e) =>
                      handleVariantChange(
                        variantIndex,
                        "additionalPrice",
                        (e.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor={`stock_${variantIndex}`}
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Stock
                  </label>
                  <input
                    id={`stock${variantIndex}`}
                    class="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 "
                    placeholder="Stock"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(
                        variantIndex,
                        "stock",
                        (e.target as HTMLInputElement).value,
                      )
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor={`isAvailable_${variantIndex}`}
                    class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Is Available
                  </label>
                  <input
                    id={`isAvailable_${variantIndex}`}
                    type="checkbox"
                    class="mt-1"
                    checked={variant.isAvailable}
                    onChange={(e) =>
                      handleVariantChange(
                        variantIndex,
                        "isAvailable",
                        (e.target as HTMLInputElement).checked,
                      )
                    }
                  />
                </div>
                <button
                  class="cursor-pointer bg-red-500 text-white p-2 rounded"
                  type="button"
                  onClick={() => removeVariant(variant._uniqueKey!)}
                >
                  Remove
                </button>
              </div>
            );
          })}
          <button
            type="button"
            class="cursor-pointer mt-2 bg-emerald-500 text-white py-1 px-3 rounded"
            onClick={addVariant}
          >
            Add Variant
          </button>
          {errors.variants && <p class="text-red-500">{errors.variants}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          class="cursor-pointer col-span-2 w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 disabled:bg-indigo-300"
        >
          {isSubmitting ? "Saving..." : "Save Product"}
        </button>
      </form>
    </>
  );
}
