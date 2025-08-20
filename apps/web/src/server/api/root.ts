import { expressionRouter } from "./router/expression"
import { createCallerFactory, createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
	expression: expressionRouter
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
