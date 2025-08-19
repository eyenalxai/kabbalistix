import { err, ok, type Result } from "neverthrow"
import type { ZodType } from "zod/v4"

export const parseZodSchema = <T>(
	schema: ZodType<T>,
	data: unknown
): Result<T, string> => {
	const result = schema.safeParse(data)

	if (result.success) return ok(result.data)

	return err(
		result.error.issues
			.map(({ message, path }) => {
				if (path.length === 0) return message
				return `${path.join(".")}: ${message}`
			})
			.join(", ")
	)
}
