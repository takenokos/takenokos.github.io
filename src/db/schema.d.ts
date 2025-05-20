import { users } from './schema.ts'
import type { InferInsertModel } from 'drizzle-orm';
export type User = InferInsertModel<typeof users>;



