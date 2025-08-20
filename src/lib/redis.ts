import { ResultAsync } from "neverthrow"
import { createClient } from "redis"
import { env } from "@/lib/env"

let client: ReturnType<typeof createClient> | undefined =
	globalThis.__redisClient__
let connectPromise: Promise<void> | null =
	globalThis.__redisConnectPromise__ ?? null

const buildClient = (): ReturnType<typeof createClient> => {
	const built = createClient({
		url: env.REDIS_URL,
		socket: {
			reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
			keepAlive: true
		}
	})

	built.on("error", (err) => {
		console.error("[redis] client error:", err)
	})

	return built
}

declare global {
	var __redisClient__: ReturnType<typeof createClient> | undefined
	var __redisConnectPromise__: Promise<void> | null | undefined
}

export const getRedisClient = (): ResultAsync<
	ReturnType<typeof createClient>,
	Error
> =>
	ResultAsync.fromPromise(
		(async () => {
			if (client === undefined) {
				client = buildClient()
			}
			if (!client.isOpen) {
				if (connectPromise === null) {
					connectPromise = client
						.connect()
						.then(() => undefined)
						.finally(() => {
							connectPromise = null
						})
					globalThis.__redisConnectPromise__ = connectPromise
				}
				await connectPromise
			}
			if (env.NODE_ENV !== "production") {
				globalThis.__redisClient__ = client
			}
			return client
		})(),
		(e) => new Error(e instanceof Error ? e.message : "Redis connect failed")
	)

export const pingRedis = (): ResultAsync<string, Error> =>
	getRedisClient().andThen((c) =>
		ResultAsync.fromPromise(
			(async () => {
				const res = await c.ping()
				if (res !== "PONG") {
					throw new Error("Unexpected PING response")
				}
				return "PONG"
			})(),
			(e) => new Error(e instanceof Error ? e.message : "PING failed")
		)
	)

export const closeRedis = (): ResultAsync<void, Error> =>
	ResultAsync.fromPromise(
		(async () => {
			if (client?.isOpen) {
				await client.quit()
			}
			return undefined
		})(),
		(e) => new Error(e instanceof Error ? e.message : "Failed to close Redis")
	)
