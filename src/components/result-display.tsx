"use client"

import type { z } from "zod"
import { api } from "@/components/providers/trpc-provider"
import type { inputSchema } from "@/lib/zod/input"

export const ResultDisplay = (props: {
	input: z.infer<typeof inputSchema>
}) => {
	const { data, isPending, error } = api.stuff.getPublicStuff.useQuery(
		props.input
	)

	if (isPending) {
		return <div>Loading...</div>
	}

	if (error) {
		return <div>Error: {error.message}</div>
	}

	return <div>Result: {data?.latex}</div>
}
