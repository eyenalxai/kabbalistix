"use client"

import { ResultAsync } from "neverthrow"
import { getErrorMessage } from "@/lib/error-message"

export const copyToClipboard = (text: string) => {
	return ResultAsync.fromPromise(navigator.clipboard.writeText(text), (error) =>
		getErrorMessage(error, "Failed to copy to clipboard")
	)
}
