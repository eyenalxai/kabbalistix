import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		REDIS_URL: z.url(),
		TIMEOUT_SECONDS: z.coerce.number().default(15),
		RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().default(60),
		RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(2)
	},
	client: {
		NEXT_PUBLIC_APP_URL: z.url()
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		REDIS_URL: process.env.REDIS_URL,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		TIMEOUT_SECONDS: process.env.TIMEOUT_SECONDS,
		RATE_LIMIT_WINDOW_SECONDS: process.env.RATE_LIMIT_WINDOW_SECONDS,
		RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS
	},
	skipValidation: process.env.SKIP_VALIDATION?.toLowerCase() === "true"
})
