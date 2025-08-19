FROM rust:1.83-alpine AS rust-builder
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY kabbalistix-rs/ ./kabbalistix-rs/
WORKDIR /app/kabbalistix-rs
RUN cargo build --release

FROM node:24-alpine AS node-builder
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV SKIP_VALIDATION=true

RUN yarn build

FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=rust-builder /app/kabbalistix-rs/target/release/kabbalistix ./kabbalistix-rs/target/release/kabbalistix
RUN chmod +x ./kabbalistix-rs/target/release/kabbalistix

COPY --from=node-builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=node-builder --chown=nextjs:nodejs /app/yarn.lock ./yarn.lock
COPY --from=node-builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=node-builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=node-builder --chown=nextjs:nodejs /app/public ./public
COPY --from=node-builder --chown=nextjs:nodejs /app/src ./src

RUN yarn install --frozen-lockfile --production && yarn cache clean

USER nextjs

ENV HOST=0.0.0.0
ARG PORT
ENV PORT=${PORT:-3000}
EXPOSE ${PORT}

CMD ["yarn", "start"]
