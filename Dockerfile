FROM archlinux:latest AS rust-builder
RUN pacman -Sy --noconfirm rust cargo git
WORKDIR /app
RUN git clone https://github.com/eyenalxai/kabbalistix-rs.git
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
RUN pacman -Sy --noconfirm nodejs npm yarn
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs nextjs

RUN mkdir -p ./kabbalistix-rs/target/release
COPY --from=rust-builder /app/kabbalistix-rs/target/release/kabbalistix ./kabbalistix-rs/target/release/kabbalistix
RUN chmod +x ./kabbalistix-rs/target/release/kabbalistix
RUN chown -R nextjs:nodejs ./kabbalistix-rs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/yarn.lock ./yarn.lock
COPY --from=builder --chown=nextjs:nodejs /app/.yarnrc.yml ./.yarnrc.yml
COPY --from=builder --chown=nextjs:nodejs /app/.yarn ./.yarn
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

RUN yarn workspaces focus --production && yarn cache clean

USER nextjs

EXPOSE 3000

ARG HOST
ENV HOST=${HOST:-0.0.0.0}

ARG PORT
ENV PORT=${PORT:-3000}

CMD ["yarn", "start", "--hostname", "$HOST"]
