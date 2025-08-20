FROM archlinux:latest AS base
RUN pacman -Sy --noconfirm nodejs git yarn

FROM base AS builder
RUN pacman -Sy --noconfirm rust cargo

FROM base AS pruner
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/
COPY packages/ ./packages/
COPY apps/ ./apps/
RUN yarn install --immutable
COPY . .
RUN yarn turbo prune --scope=@kabbalistix/web --docker

FROM builder AS installer
WORKDIR /app
# Install from pruned metadata first, then bring in sources
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --immutable
COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV SKIP_VALIDATION=true

# Build only the web app (CLI builds first via Turbo task graph)
RUN yarn turbo run build --filter=@kabbalistix/web

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs nextjs

# Copy pruned, installed, and built app
COPY --from=installer --chown=nextjs:nodejs /app ./

# Reduce to production dependencies for the web workspace so its binaries (e.g. next) are available
RUN yarn workspaces focus --production @kabbalistix/web && yarn cache clean

# Make CLI binary available in PATH for runtime
RUN cp /app/apps/cli/target/release/kabbalistix /usr/local/bin/kabbalistix && \
    chmod +x /usr/local/bin/kabbalistix

USER nextjs

ENV HOST=0.0.0.0
ARG PORT
ENV PORT=${PORT:-3000}
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
EXPOSE ${PORT}

WORKDIR /app/apps/web
ENV SKIP_VALIDATION=false
CMD ["yarn", "start", "--hostname", "0.0.0.0"]
