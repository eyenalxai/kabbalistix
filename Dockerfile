FROM rust:alpine AS rust-builder
RUN apk add --no-cache musl-dev build-base
RUN rustup default nightly
WORKDIR /app
COPY kabbalistix-rs/ ./kabbalistix-rs/
WORKDIR /app/kabbalistix-rs
RUN cargo build --release

FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/

RUN yarn install --immutable

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV SKIP_VALIDATION=true

RUN yarn build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=rust-builder /app/kabbalistix-rs/target/release/kabbalistix ./kabbalistix-rs/target/release/kabbalistix
RUN chmod +x ./kabbalistix-rs/target/release/kabbalistix

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV HOST=0.0.0.0
ARG PORT
ENV PORT=${PORT:-3000}

CMD ["node", "server.js"]
