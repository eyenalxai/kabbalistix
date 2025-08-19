FROM archlinux:latest AS rust-builder
RUN pacman -Sy --noconfirm rust cargo
WORKDIR /app
COPY kabbalistix-rs/ ./kabbalistix-rs/
WORKDIR /app/kabbalistix-rs
RUN cargo build --release

FROM archlinux:latest AS deps
RUN pacman -Sy --noconfirm nodejs npm yarn
WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/

RUN yarn install --immutable

FROM archlinux:latest AS builder
RUN pacman -Sy --noconfirm nodejs npm yarn
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV SKIP_VALIDATION=true

RUN yarn build

FROM archlinux:latest AS runner
RUN pacman -Sy --noconfirm nodejs npm
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs nextjs

RUN mkdir -p ./kabbalistix-rs/target/release
COPY --from=rust-builder /app/kabbalistix-rs/target/release/kabbalistix ./kabbalistix-rs/target/release/kabbalistix
RUN chmod +x ./kabbalistix-rs/target/release/kabbalistix
RUN chown -R nextjs:nodejs ./kabbalistix-rs

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
