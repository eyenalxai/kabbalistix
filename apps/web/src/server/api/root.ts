import { expressionRouter } from "@/server/api/router/expression"
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc"

export const appRouter = createTRPCRouter({
	expression: expressionRouter
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
