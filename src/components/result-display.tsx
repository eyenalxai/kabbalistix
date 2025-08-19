"use client"

import { markdownLookBack } from "@llm-ui/markdown"
import { type LLMOutputComponent, useLLMOutput } from "@llm-ui/react"
import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import "katex/dist/katex.min.css"
import { toast } from "sonner"
import type { z } from "zod"
import { api } from "@/components/providers/trpc-provider"
import { Button } from "@/components/ui/button"
import { copyToClipboard } from "@/lib/clipboard"
import type { inputSchema } from "@/lib/zod/input"

// Markdown component for rendering LLM output with LaTeX support
const MarkdownComponent: LLMOutputComponent = ({ blockMatch }) => {
	const markdown = blockMatch.output
	return (
		<div className="prose prose-sm max-w-none dark:prose-invert">
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex]}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	)
}

export const ResultDisplay = (props: {
	input: z.infer<typeof inputSchema>
}) => {
	const { data, isPending, error } = api.stuff.getPublicStuff.useQuery(
		props.input
	)

	// Use LLM output processing for the result
	const { blockMatches } = useLLMOutput({
		llmOutput: data?.latex || "",
		blocks: [],
		fallbackBlock: {
			component: MarkdownComponent,
			lookBack: markdownLookBack()
		},
		isStreamFinished: true // No streaming, so always finished
	})

	if (isPending) {
		return <div>Loading...</div>
	}

	if (error) {
		return <div>Error: {error.message}</div>
	}

	return (
		<div className="space-y-4">
			{blockMatches.map((blockMatch, index) => {
				const Component = blockMatch.block.component
				return (
					<Component
						key={`block-${index}-${blockMatch.output.slice(0, 10)}`}
						blockMatch={blockMatch}
					/>
				)
			})}
			<Button
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
				Copy Expression
			</Button>
		</div>
	)
}
