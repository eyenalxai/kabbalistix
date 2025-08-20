import { initTRPC, TRPCError } from "@trpc/server"
import { ResultAsync } from "neverthrow"
import superjson from "superjson"
import { ZodError } from "zod"
import { env } from "@/lib/env"
import { getRedisClient } from "@/lib/redis"

export const createTRPCContext = async (opts: { headers: Headers }) => opts

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
			}
		}
	}
})

export const createCallerFactory = t.createCallerFactory

export const createTRPCRouter = t.router

const timingMiddleware = t.middleware(async ({ next, path }) => {
	const start = Date.now()

	if (t._config.isDev) {
		// artificial delay in dev
		const waitMs = Math.floor(Math.random() * 400) + 100
		await new Promise((resolve) => setTimeout(resolve, waitMs))
	}

	const result = await next()

	const end = Date.now()
	console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

	return result
})

const rateLimitMiddleware = t.middleware(async ({ ctx, path, next, type }) => {
	const ip =
		ctx.headers.get("x-forwarded-for") ??
		ctx.headers.get("x-real-ip") ??
		"unknown"
	const key = `rl:${ip}:${path}:${type}`

	const windowSeconds = env.RATE_LIMIT_WINDOW_SECONDS
	const maxRequests = env.RATE_LIMIT_MAX_REQUESTS

	return await getRedisClient()
		.andThen((client) =>
			ResultAsync.fromPromise(
				(async () => {
					const setResult = await client.set(key, "1", {
						EX: windowSeconds,
						NX: true
					})
					if (setResult === "OK") {
						return { count: 1 }
					}
					const count = await client.incr(key)
					return { count }
				})(),
				(e) => new Error(e instanceof Error ? e.message : "rate limit failed")
			)
		)
		.match(
			({ count }) => {
				if (count > maxRequests) {
					throw new TRPCError({
						code: "TOO_MANY_REQUESTS",
						message: "Rate limit exceeded"
					})
				}
				return next()
			},
			(error) => {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message
				})
			}
		)
})

export const publicProcedure = t.procedure
	.use(timingMiddleware)
	.use(rateLimitMiddleware)
