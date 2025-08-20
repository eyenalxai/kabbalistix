"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { skipToken } from "@tanstack/react-query"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { ErrorComponent } from "@/components/error-component"
import { Loading } from "@/components/loading"
import { api } from "@/components/providers/trpc-provider"
import { ResultDisplay } from "@/components/result-display"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { inputSchema } from "@/lib/zod/input"

export default function Page() {
	const [input, setInput] = useState<z.infer<typeof inputSchema> | null>(null)

	const { data, isFetching, error, refetch } =
		api.expression.findExpression.useQuery(input ?? skipToken, {
			enabled: !!input,
			retry: false,
			retryOnMount: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			refetchOnReconnect: false
		})

	useEffect(() => {
		if (error) {
			toast.error(error.message)
		}
	}, [error])

	const methods = useForm<z.infer<typeof inputSchema>>({
		resolver: zodResolver(inputSchema),
		mode: "onSubmit",
		reValidateMode: "onSubmit",
		defaultValues: {
			input: undefined,
			target: undefined
		}
	})

	const onSubmit = (values: z.infer<typeof inputSchema>) => {
		setInput(values)
		// Force refetch even if input values are the same
		if (
			input &&
			input.input === values.input &&
			input.target === values.target
		) {
			refetch()
		}
	}

	const animationConfig = {
		initial: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
		animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
		exit: { opacity: 0, scale: 1.05, filter: "blur(6px)" }
	}

	return (
		<div
			className={cn(
				"w-full",
				"flex",
				"flex-col",
				"items-center",
				"justify-center",
				"gap-4"
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
								</FormItem>
							)}
						/>
						<Button
							disabled={isFetching || !methods.formState.isValid}
							className={cn("w-fit")}
							type="submit"
						>
							Find Expression
						</Button>
					</form>
				</Form>
			</Card>
			<MotionConfig
				transition={{ type: "spring", stiffness: 300, damping: 30 }}
			>
				<AnimatePresence mode="popLayout">
					{isFetching && !!input && (
						<motion.div key="loading" {...animationConfig}>
							<Loading />
						</motion.div>
					)}
					{!isFetching && data && (
						<motion.div key="result-display" {...animationConfig}>
							<ResultDisplay latex={data.latex} expression={data.expression} />
						</motion.div>
					)}
					{error && (
						<motion.div
							className={cn("w-full")}
							key="error"
							{...animationConfig}
						>
							<ErrorComponent message={error.message} />
						</motion.div>
					)}
				</AnimatePresence>
			</MotionConfig>
		</div>
	)
}
