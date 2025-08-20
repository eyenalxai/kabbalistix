import type { NextConfig } from "next"

if (!process.env.NEXT_PUBLIC_APP_URL) {
	throw new Error("NEXT_PUBLIC_APP_URL environment variable is required")
}

const extractDomain = (url: string) => {
	const urlObj = new URL(url)
	return urlObj.hostname
}

const nextConfig: NextConfig = {
	transpilePackages: ["geist"],
	allowedDevOrigins: [extractDomain(process.env.NEXT_PUBLIC_APP_URL)]
}

module.exports = nextConfig
