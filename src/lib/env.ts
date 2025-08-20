import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		TIMEOUT_SECONDS: z.coerce.number().default(15)
	},
	client: {
		NEXT_PUBLIC_APP_URL: z.url()
	},
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		TIMEOUT_SECONDS: process.env.TIMEOUT_SECONDS
	},
	skipValidation: process.env.SKIP_VALIDATION?.toLowerCase() === "true"
})
