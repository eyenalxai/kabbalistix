import { z } from "zod"

export const rustOutput = z.union([
	z.object({
		latex: z.string(),
		value: z.number()
	}),
	z.object({
		error: z.string()
	})
])
