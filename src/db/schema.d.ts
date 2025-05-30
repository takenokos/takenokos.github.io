import {
  users,
  categories,
  products,
  productAttributes,
  productAttributeValues,
  producrVariants,
} from "./schema.ts";
import type { InferInsertModel } from "drizzle-orm";
export type User = InferInsertModel<typeof users>;
export type Category = InferInsertModel<typeof categories>;
export type Product = InferInsertModel<typeof products>;
export type ProductAttribute = InferInsertModel<typeof productAttributes> & {
  values?: ProductAttributeValue[];
};
export type ProductAttributeValue = InferInsertModel<
  typeof productAttributeValues
>;
export type ProductVariant = InferInsertModel<typeof producrVariants>;
