"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

import type { z } from "zod"
import { ResultDisplay } from "@/components/result-display"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"
import { inputSchema } from "@/lib/zod/input"

type FormData = z.infer<typeof inputSchema>

export default function Page() {
	const [input, setInput] = useState<FormData | null>(null)

	const methods = useForm<FormData>({
		resolver: zodResolver(inputSchema),
		defaultValues: {
			input: undefined,
			target: undefined
		}
	})

	const onSubmit = (values: FormData) => {
		setInput(values)
	}

	return (
		<div
			className={cn(
				"flex",
				"flex-col",
				"items-center",
				"justify-center",
				"gap-4",
				"w-full"
			)}
		>
			<Card className={cn("p-4", "w-full")}>
				<Form {...methods}>
					<form
						onSubmit={methods.handleSubmit(onSubmit)}
						className={cn("w-full", "flex", "flex-col", "gap-4")}
					>
						<FormField
							control={methods.control}
							name="input"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Input</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="1"
											{...field}
											value={field.value ?? ""}
											onChange={(e) => {
												const value = e.target.value
												field.onChange(value === "" ? undefined : Number(value))
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={methods.control}
							name="target"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Target</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="10"
											{...field}
											value={field.value ?? ""}
											onChange={(e) => {
												const value = e.target.value
												field.onChange(value === "" ? undefined : Number(value))
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button className={cn("w-fit")} type="submit">
							Find Expression
						</Button>
					</form>
				</Form>
			</Card>
			{input && <ResultDisplay input={input} />}
		</div>
	)
}
