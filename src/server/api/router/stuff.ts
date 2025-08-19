import { TRPCError } from "@trpc/server"
import { err, ok } from "neverthrow"
import { z } from "zod"
import { parseJsonOutput } from "@/lib/json"
import { executeRust } from "@/lib/rust"
import { parseZodSchema } from "@/lib/zod/parse"
import { rustOutput } from "@/lib/zod/rust"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

const MAX_VALUE = 99999999

export const stuffRouter = createTRPCRouter({
	getPublicStuff: publicProcedure
		.input(
			z.object({
				input: z.number().min(1).max(MAX_VALUE),
				target: z.number().max(MAX_VALUE * 10)
			})
		)
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
					(data) => data,
					(error) => {
						throw new TRPCError({
							code: "INTERNAL_SERVER_ERROR",
							message: error
						})
					}
				)
		})
})
