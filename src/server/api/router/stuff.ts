import { exec } from "child_process"
import path from "path"
import { promisify } from "util"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"

const MAX_VALUE = 99999999

const execAsync = promisify(exec)

export const stuffRouter = createTRPCRouter({
	getPublicStuff: publicProcedure
		.input(
			z.object({
				input: z.number().min(1).max(MAX_VALUE),
				target: z.number().max(MAX_VALUE * 10)
			})
		)
		.query(async ({ input }) => {
			try {
				const binaryPath = path.join(
					process.cwd(),
					"kabbalistix-rs",
					"target",
					"release",
					"kabbalistix"
				)

				const command = `${binaryPath} --log-level off --output-format latex --json ${input.input} ${input.target}`

				const { stdout, stderr } = await execAsync(command, {
					timeout: 15_000, // 15 seconds in milliseconds
					encoding: "utf8"
				})

				let result: unknown
				try {
					result = JSON.parse(stdout)
				} catch {
					throw new Error(`Failed to parse binary output as JSON: ${stdout}`)
				}

				return {
					success: true,
					data: result,
					stderr: stderr || undefined
				}
			} catch (error: unknown) {
				const execError = error as {
					code?: string
					stderr?: string
					message?: string
				}

				if (execError.code === "ETIMEDOUT") {
					throw new Error("Binary execution timed out after 15 seconds")
				}

				if (execError.code === "ENOENT") {
					throw new Error(
						"Binary not found. Make sure kabbalistix binary is built at ./kabbalistix-rs/target/release/kabbalistix"
					)
				}

				const errorMessage = execError.stderr
					? `Binary execution failed: ${execError.stderr}`
					: `Binary execution failed: ${execError.message || "Unknown error"}`

				throw new Error(errorMessage)
			}
		})
})
