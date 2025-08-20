import { exec } from "node:child_process"
import path from "node:path"
import { promisify } from "node:util"
import { ResultAsync } from "neverthrow"
import { env } from "@/lib/env"

const execAsync = promisify(exec)

type ExecuteRustProps = {
	input: number
	target: number
}

export const executeRust = (props: ExecuteRustProps) => {
	const binaryPath = path.join(
		process.cwd(),
		"kabbalistix-rs",
		"target",
		"release",
		"kabbalistix"
	)

	const command = `${binaryPath} --log-level off --output-format both --json ${props.input} ${props.target}`

	return ResultAsync.fromPromise(
		execAsync(command, {
			timeout: env.TIMEOUT_SECONDS * 1000,
			encoding: "utf8"
		}),
		(error: unknown) => {
			const execError = error as {
				code?: string
				stderr?: string
				message?: string
			}

			if (execError.code === "ETIMEDOUT") {
				return `Binary execution timed out after ${env.TIMEOUT_SECONDS} seconds`
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
