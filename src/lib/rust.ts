import { exec } from "node:child_process"
import path from "node:path"
import { promisify } from "node:util"
import { ResultAsync } from "neverthrow"

const execAsync = promisify(exec)

export const executeRust = (input: number, target: number) => {
	const binaryPath = path.join(
		process.cwd(),
		"kabbalistix-rs",
		"target",
		"release",
		"kabbalistix"
	)

	const command = `${binaryPath} --log-level off --output-format both --json ${input} ${target}`

	return ResultAsync.fromPromise(
		execAsync(command, {
			timeout: 15_000,
			encoding: "utf8"
		}),
		(error: unknown) => {
			const execError = error as {
				code?: string
				stderr?: string
				message?: string
			}

			if (execError.code === "ETIMEDOUT") {
				return "Binary execution timed out after 15 seconds"
			}

			if (execError.code === "ENOENT") {
				return "Binary not found. Make sure kabbalistix binary is built at ./kabbalistix-rs/target/release/kabbalistix"
			}

			const errorMessage = execError.stderr
				? `Binary execution failed: ${execError.stderr}`
				: `Binary execution failed: ${execError.message || "Unknown error"}`

			return errorMessage
		}
	)
}
