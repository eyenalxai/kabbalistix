"use client"

import { toast } from "sonner"
import { MarkdownComponent } from "@/components/markdown"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"

export const ResultDisplay = (props: { latex: string; expression: string }) => {
	return (
		<Card className={cn("p-4", "w-full")}>
			<MarkdownComponent content={props.latex} />
			<div className={cn("flex", "flex-row", "gap-4", "items-center")}>
				<Button
					variant="outline"
					onClick={() =>
						copyToClipboard(props.expression).match(
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
						copyToClipboard(props.expression).match(
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
