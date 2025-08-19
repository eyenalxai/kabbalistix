"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { ResultDisplay } from "@/components/result-display"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { stringToNumber } from "@/lib/number"
import { cn } from "@/lib/utils"
import { inputSchema } from "@/lib/zod/input"

export default function Page() {
	const [input, setInput] = useState<z.infer<typeof inputSchema> | null>(null)

	const methods = useForm<z.infer<typeof inputSchema>>({
		resolver: zodResolver(inputSchema),
		defaultValues: {
			input: undefined,
			target: undefined
		}
	})

	const onSubmit = (values: z.infer<typeof inputSchema>) => {
		setInput(values)
	}

	return (
		<div className={cn("flex", "flex-col", "items-center", "gap-4")}>
			<Form {...methods}>
				<form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-2">
					<FormField
						control={methods.control}
						name="input"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Input</FormLabel>
								<FormControl>
									<Input
										placeholder="1"
										{...field}
										onChange={(e) => {
											stringToNumber(e.target.value).match(
												(value) => field.onChange(value),
												(error) => {
													toast.error(error, {
														position: "top-center"
													})
												}
											)
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
										placeholder="10"
										{...field}
										onChange={(e) => {
											stringToNumber(e.target.value).match(
												(value) => field.onChange(value),
												(error) => {
													toast.error(error, {
														position: "top-center"
													})
												}
											)
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
			{input && <ResultDisplay input={input} />}
		</div>
	)
}
