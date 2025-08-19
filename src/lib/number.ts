import { Result } from "neverthrow"
import { getErrorMessage } from "@/lib/error-message"

export const stringToNumber = (value: string) => {
	return Result.fromThrowable(
		() => Number.parseInt(value, 10),
		(e) => getErrorMessage(e, "Invalid number")
	)()
}
