import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  real,
  json
} from "drizzle-orm/pg-core"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { type AdapterAccountType } from "@auth/core/adapters"

// 处理drizzle-kit 和 astro api route的环境变量问题
let url = ''
try {
  url = import.meta.env.POSTGRESQL_URL
} catch (err) {
  url = process.env.POSTGRESQL_URL!
}
const pool = postgres(url, { max: 1 })
export const db = drizzle(pool)

// user
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text('password_hash'), // For custom JWT, use bcrypt
  role: text('role').notNull().default('user'), // e.g., 'user' for front-end, 'admin' for back-end
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .primaryKey()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

// subscriber
export const subscribers = pgTable('subscribers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  status: text('status').default('active').notNull(),
});

// contact
export const contactMessages = pgTable('contact_messages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  status: text('status').default('pending').notNull(),
});

// comment
export const comments = pgTable('comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text('post_id').notNull(),
  userId: text('user_id',).notNull(),
  commentText: text('comment_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// product
export const categories = pgTable('categories', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(), // e.g., "Electronics"
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(), // Product name
  slug: text('slug').notNull().unique(), // For URL-friendly IDs, e.g., "apple-iphone-14"
  description: text('description').notNull(), // Markdown-supported description
  price: real('price').notNull(), // Price in currency
  stock: integer('stock').notNull().default(0), // Inventory count
  categoryId: text('category_id').references(() => categories.id), // Foreign key to categories
  imageUrl: text('image_url').notNull(), // URL to product image
  isFeatured: boolean('is_featured').default(false), // For featured products
  createdAt: timestamp('created_at').defaultNow(),
});
// Attributes表：存储规格类型 (e.g., Color, Size)
export const attributes = pgTable('attributes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(), // e.g., "Color"
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AttributeValues表：存储规格的具体值 (e.g., "Red" for Color)
export const attributeValues = pgTable('attribute_values', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  attributeId: text('attribute_id').references(() => attributes.id), // Foreign key to attributes
  value: text('value').notNull(), // e.g., "Red"
  createdAt: timestamp('created_at').defaultNow(),
});

// ProductAttributes表：关联产品和规格 (e.g., Product has Color and Size)
export const productAttributes = pgTable('product_attributes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id), // Foreign key to products
  attributeId: text('attribute_id').references(() => attributes.id), // Foreign key to attributes
  createdAt: timestamp('created_at').defaultNow(),
});
// Variants表：扩展为存储最终的变体组合 (e.g., specific SKU with combinations)
export const variants = pgTable('variants', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text('product_id').references(() => products.id), // Foreign key to products
  sku: text('sku').notNull().unique(), // Unique SKU, e.g., "PROD-001-RED-M-PAT1"
  combinations: json('combinations').notNull(), // JSON to store combinations, e.g., { "color": "Red", "size": "M", "pattern": "Pattern1" }
  additionalPrice: real('additional_price').default(0), // Extra price for this variant
  stock: integer('stock').notNull().default(0), // Inventory for this specific combination
  isAvailable: boolean('is_available').default(true), // Whether this variant is in stock
  createdAt: timestamp('created_at').defaultNow(),
});
