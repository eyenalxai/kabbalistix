import type { VariantProps } from "class-variance-authority"
import {
	Alert,
	AlertDescription,
	AlertTitle,
	type alertVariants
} from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type ErrorProps = (
	| {
			message: string
			title?: string
	  }
	| { message: string; error?: boolean }
) &
	VariantProps<typeof alertVariants>

export const ErrorComponent = (props: ErrorProps) => {
	return (
		<Alert variant={props.variant} className={cn("w-full")}>
			{"title" in props && <AlertTitle>{props.title}</AlertTitle>}
			{"error" in props && <AlertTitle>Error</AlertTitle>}
			<AlertDescription>{props.message}</AlertDescription>
		</Alert>
	)
}
