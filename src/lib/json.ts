import { Result } from "neverthrow"
import { getErrorMessage } from "@/lib/error-message"

export const parseJsonOutput = (stdout: string) => {
	return Result.fromThrowable(
		() => JSON.parse(stdout) as unknown,
		(e) => getErrorMessage(e, "Failed to parse program output as JSON")
	)()
}
