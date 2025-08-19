"use client"

import { Copy } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { toast } from "sonner"
import type { z } from "zod"
import { ErrorComponent } from "@/components/error-component"
import { Loading } from "@/components/loading"
import { api } from "@/components/providers/trpc-provider"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"
import { cn } from "@/lib/utils"
import type { inputSchema } from "@/lib/zod/input"

// Markdown component for rendering content with LaTeX support
const MarkdownComponent = ({ content }: { content: string }) => {
	return (
		<div className="prose prose-sm max-w-none dark:prose-invert">
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex]}
			>
				{content}
			</ReactMarkdown>
		</div>
	)
}

export const ResultDisplay = (props: {
	input: z.infer<typeof inputSchema>
}) => {
	const { data, isPending, error } = api.stuff.getPublicStuff.useQuery(
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
		<div className={cn("flex", "flex-row", "gap-4", "items-center")}>
			<MarkdownComponent content={data?.latex || ""} />
			<Button
				variant="outline"
				size="icon"
				onClick={() =>
					copyToClipboard(data.expression).match(
						() =>
							toast.success("Copied to clipboard", {
								position: "bottom-center"
							}),
						(error) =>
							toast.error(error, {
								position: "bottom-center"
							})
					)
				}
			>
				<Copy className="h-4 w-4" />
			</Button>
		</div>
	)
}
