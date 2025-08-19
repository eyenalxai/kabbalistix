"use client"

import { toast } from "sonner"
import type { z } from "zod"
import { ErrorComponent } from "@/components/error-component"
import { Loading } from "@/components/loading"
import { MarkdownComponent } from "@/components/markdown"
import { api } from "@/components/providers/trpc-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"
import type { inputSchema } from "@/lib/zod/input"

export const ResultDisplay = (props: {
	input: z.infer<typeof inputSchema>
}) => {
	const { data, isPending, error } = api.expression.findExpression.useQuery(
		props.input,
		{
			retry: false
		}
	)

	if (isPending) {
		return <Loading />
	}

	if (error) {
		return <ErrorComponent message={error.message} />
	}

	return (
		<Card className={cn("p-4", "w-full")}>
			<MarkdownComponent content={data.latex} />
			<div className={cn("flex", "flex-row", "gap-4", "items-center")}>
				<Button
					variant="outline"
					onClick={() =>
						copyToClipboard(data.expression).match(
							() =>
								toast.success("LaTeX copied to clipboard", {
									position: "bottom-center"
								}),
							(error) =>
								toast.error(error, {
									position: "bottom-center"
								})
						)
					}
				>
					Copy LaTeX
				</Button>
				<Button
					variant="outline"
					onClick={() => {
						copyToClipboard(data.expression).match(
							() =>
								toast.success("Expression copied to clipboard", {
									position: "bottom-center"
								}),
							(error) =>
								toast.error(error, {
									position: "bottom-center"
								})
						)
					}}
				>
					Copy Expression
				</Button>
			</div>
		</Card>
	)
}
