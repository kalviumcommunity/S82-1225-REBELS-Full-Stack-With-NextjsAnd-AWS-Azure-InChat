"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const serverSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).optional(),
    PORT: zod_1.z.coerce.number().int().positive().optional(),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(16, 'JWT_SECRET should be at least 16 characters'),
    REDIS_URL: zod_1.z.string().url().optional(),
});
const clientSchema = zod_1.z.object({
    NEXT_PUBLIC_API_BASE_URL: zod_1.z.string().url().optional(),
});
function parseEnv(schema, values) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
        const message = parsed.error.issues
            .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
            .join('\n');
        throw new Error(`Invalid environment variables:\n${message}`);
    }
    return parsed.data;
}
exports.env = {
    ...parseEnv(serverSchema, {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        REDIS_URL: process.env.REDIS_URL,
    }),
    ...parseEnv(clientSchema, {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    }),
};
