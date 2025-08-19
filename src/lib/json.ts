import { Result } from "neverthrow"

export const parseJsonOutput = (stdout: string) => {
	return Result.fromThrowable(
		() => JSON.parse(stdout),
		() => `Failed to parse program output as JSON: ${stdout}`
	)()
}
