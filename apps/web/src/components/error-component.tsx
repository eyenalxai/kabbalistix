import type { VariantProps } from "class-variance-authority"
import {
	Alert,
	AlertDescription,
	AlertTitle,
	type alertVariants
} from "./ui/alert"

type ErrorProps = {
	message: string
	title?: string
} & VariantProps<typeof alertVariants>

export const ErrorComponent = ({ message, title, variant }: ErrorProps) => {
	return (
		<Alert variant={variant}>
			<AlertTitle>{title || "Error"}</AlertTitle>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	)
}
