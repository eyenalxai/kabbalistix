import { exec } from "node:child_process"
import path from "node:path"
import { promisify } from "node:util"
import { TRPCError } from "@trpc/server"
import { err, ok, type Result } from "neverthrow"
import { z } from "zod"
import { parseZodSchema } from "@/lib/zod/parse"
import { rustOutput } from "@/lib/zod/rust"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

const MAX_VALUE = 99999999

const execAsync = promisify(exec)

// Helper function to execute the binary and return Result
const executeRust = async (
	input: number,
	target: number
): Promise<Result<{ stdout: string; stderr: string }, string>> => {
	const binaryPath = path.join(
		process.cwd(),
		"kabbalistix-rs",
		"target",
		"release",
		"kabbalistix"
	)

	const command = `${binaryPath} --log-level off --output-format latex --json ${input} ${target}`

	try {
		const { stdout, stderr } = await execAsync(command, {
			timeout: 15_000,
			encoding: "utf8"
		})
		return ok({ stdout, stderr })
	} catch (error: unknown) {
		const execError = error as {
			code?: string
			stderr?: string
			message?: string
		}

		if (execError.code === "ETIMEDOUT") {
			return err("Binary execution timed out after 15 seconds")
		}

		if (execError.code === "ENOENT") {
			return err(
				"Binary not found. Make sure kabbalistix binary is built at ./kabbalistix-rs/target/release/kabbalistix"
			)
		}

		const errorMessage = execError.stderr
			? `Binary execution failed: ${execError.stderr}`
			: `Binary execution failed: ${execError.message || "Unknown error"}`

		return err(errorMessage)
	}
}

// Helper function to parse JSON output
const parseJsonOutput = (stdout: string): Result<unknown, string> => {
	try {
		const parsed = JSON.parse(stdout)
		return ok(parsed)
	} catch {
		return err(`Failed to parse program output as JSON: ${stdout}`)
	}
}

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
				.then((execResult) =>
					execResult.andThen(({ stdout }) =>
						parseJsonOutput(stdout)
							.andThen((parsed) => parseZodSchema(rustOutput, parsed))
							.andThen((validated) => {
								if ("error" in validated) {
									return err(validated.error)
								}
								return ok(validated)
							})
					)
				)
				.then((result) =>
					result.match(
						(data) => data,
						(error) => {
							throw new TRPCError({
								code: "INTERNAL_SERVER_ERROR",
								message: error
							})
						}
					)
				)
		})
})
