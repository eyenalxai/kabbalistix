import { z } from "zod"

const MAX_VALUE = 99999999

export const inputSchema = z.object({
	input: z.number().min(1).max(MAX_VALUE),
	target: z.number().max(MAX_VALUE * 10)
})
