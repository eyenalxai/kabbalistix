import { NextResponse } from "next/server"

export const GET = async (_request: Request) =>
	new NextResponse("Healthy.", { status: 200 })

export const OPTIONS = async (_request: Request) =>
	new NextResponse(null, { status: 200 })
