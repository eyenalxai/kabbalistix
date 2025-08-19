import { TRPCError } from "@trpc/server"
import { err, ok } from "neverthrow"
import { parseJsonOutput } from "@/lib/json"
import { executeRust } from "@/lib/rust"
import { inputSchema } from "@/lib/zod/input"
import { parseZodSchema } from "@/lib/zod/parse"
import { rustOutput } from "@/lib/zod/rust"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

export const expressionRouter = createTRPCRouter({
	findExpression: publicProcedure
		.input(inputSchema)
		.query(async ({ input }) => {
			return await executeRust(input.input, input.target)
				.andThen(({ stdout }) =>
					parseJsonOutput(stdout)
						.andThen((parsed) => parseZodSchema(rustOutput, parsed))
						.andThen((validated) => {
							if ("error" in validated) {
								return err(validated.error)
							}
							return ok(validated)
						})
				)
				.match(
					(data) => {
						console.log(data)
						return {
							latex: `$$${data.latex}$$`,
							expression: data.expression,
							value: data.value
						}
					},
					(error) => {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: error
						})
					}
				)
		})
})
