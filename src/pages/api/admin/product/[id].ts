import { eq, inArray } from "drizzle-orm";
import {
  db,
  products,
  productAttributes,
  productAttributeValues,
  productVariants,
} from "@db/schema";
import type { APIRoute } from "astro";
import { verifyAdminToken } from "../JWT";
import {
  errorResponse,
  jsonResponse,
  responseFromError,
} from "@/utils/apiResponse";
import type {
  ProductAttribute,
  ProductAttributeValue,
  ProductVariant,
} from "@db/schema.d";

export const GET: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;

    if (!id) {
      return errorResponse("Product ID is required", 400);
    }
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        attributes: {
          with: {
            values: true,
          },
        },
        variants: true,
      },
    });

    if (!product) {
      return errorResponse("Product not found", 404);
    }
    return jsonResponse(product);
  } catch (error) {
    return responseFromError(error);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    await verifyAdminToken(request);
    const body = await request.json(); // 解析请求体

    // 输入验证
    if (!body.name || !body.price || !body.categoryId) {
      return errorResponse(
        "Missing required fields: name, price, categoryId",
        400,
      );
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock || 0,
        categoryId: body.categoryId,
        imageUrl: body.imageUrl || "",
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"), // 生成slug
      })
      .returning(); // 返回插入后的数据

    // 处理属性关联（如果提供）
    if (body.attributes) {
      const attributes = await db
        .insert(productAttributes)
        .values(
          body.attributes.map((attr: ProductAttribute) => ({
            productId: newProduct.id,
            attribute: attr.attribute,
          })),
        )
        .returning();

      if (body.variants) {
        const attributeValues: ProductAttributeValue[] = [];
        body.variants.map((variant: ProductVariant) => {
          Object.entries(variant.combinations).forEach(([key, val]) => {
            const attr = attributes.find((attr) => attr.attribute === key);
            if (
              !attr ||
              attributeValues.some(
                (value) =>
                  value.attributeId === attr.id &&
                  value.value === (val as string),
              )
            )
              return;
            attributeValues.push({
              attributeId: attr.id,
              value: val as string,
            });
          });
        });
        if (attributeValues.length > 0) {
          await db.insert(productAttributeValues).values(attributeValues);
        }
        await db.insert(productVariants).values(
          body.variants.map((v: ProductVariant) => ({
            ...v,
            productId: newProduct.id,
          })),
        );
      }
    }
    return jsonResponse({ success: true, productId: newProduct.id }, 201);
  } catch (error) {
    return responseFromError(error);
  }
};

export const PUT: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request);
    const { id } = params;
    const body = await request.json(); // e.g., { id: number, role: string }

    if (!id) {
      return errorResponse("Product ID is required", 400);
    }

    const updatedProduct = await db
      .update(products)
      .set({
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        categoryId: body.categoryId,
        slug: body.slug,
        imageUrl: body.imageUrl,
        isFeatured: body.isFeatured,
      })
      .where(eq(products.id, id))
      .returning();

    // 更新属性关联
    if (body.attributes) {
      // await db
      //   .delete(productAttributes)
      //   .where(eq(productAttributes.productId, id));
      for (const attr of body.attributes) {
        if (!attr.id) {
          const [newAttr] = await db
            .insert(productAttributes)
            .values({
              productId: id,
              attribute: attr.attribute,
            })
            .returning({ id: productAttributes.id });
          attr.id = newAttr.id;
        } else {
          await db
            .update(productAttributes)
            .set({
              attribute: attr.attribute,
            })
            .where(eq(productAttributes.id, attr.id));
        }
      }
    }

    // 更新变体（示例：直接更新或替换）
    if (body.variants) {
      // await db.delete(productVariants).where(eq(productVariants.productId, id));
      const attributeValues: ProductAttributeValue[] = [];
      body.variants.map((variant: ProductVariant) => {
        Object.entries(variant.combinations).forEach(([key, val]) => {
          const attr = (body.attributes || []).find(
            (attr: ProductAttribute) => attr.attribute === key,
          );
          if (
            !attr ||
            attributeValues.some(
              (value) =>
                value.attributeId === attr.id &&
                value.value === (val as string),
            )
          )
            return;
          attributeValues.push({
            attributeId: attr.id,
            value: val as string,
          });
        });
      });
      const attributeIds = (body.attributes || [])
        .map((attr: ProductAttribute) => attr.id)
        .filter(Boolean);
      if (attributeIds.length > 0) {
        await db
          .delete(productAttributeValues)
          .where(inArray(productAttributeValues.attributeId, attributeIds));
      }
      if (attributeValues.length > 0) {
        await db.insert(productAttributeValues).values(attributeValues);
      }
      for (const variant of body.variants) {
        if (variant.id) {
          const { id, createdAt, updatedAt, productId, ...updateVariant } =
            variant;
          await db
            .update(productVariants)
            .set(updateVariant)
            .where(eq(productVariants.id, variant.id));
        } else {
          await db.insert(productVariants).values({
            ...variant,
            productId: id,
          });
        }
      }
    }

    return jsonResponse({ success: true, data: updatedProduct });
  } catch (error) {
    return responseFromError(error);
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    await verifyAdminToken(request); // 验证Admin Token
    const { id } = params;

    if (!id) {
      return errorResponse("Product ID is required", 400);
    }

    const existingAttributes = await db
      .select({ id: productAttributes.id })
      .from(productAttributes)
      .where(eq(productAttributes.productId, id));
    const attributeIds = existingAttributes.map((attr) => attr.id);

    if (attributeIds.length > 0) {
      await db
        .delete(productAttributeValues)
        .where(inArray(productAttributeValues.attributeId, attributeIds));
    }
    await db.delete(productVariants).where(eq(productVariants.productId, id));
    await db
      .delete(productAttributes)
      .where(eq(productAttributes.productId, id));
    await db.delete(products).where(eq(products.id, id));

    return jsonResponse({ success: true });
  } catch (error) {
    return responseFromError(error);
  }
};
