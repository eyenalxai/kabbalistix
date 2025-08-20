import { env } from "@/lib/env"

const extractDomain = (url) => {
	const urlObj = new URL(url)
	return urlObj.hostname
}

const nextConfig = {
	transpilePackages: ["geist"],
	allowedDevOrigins: [extractDomain(env.NEXT_PUBLIC_APP_URL)]
}

module.exports = nextConfig
