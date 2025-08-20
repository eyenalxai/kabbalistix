FROM archlinux:latest AS base
RUN pacman -Sy --noconfirm nodejs git yarn

FROM archlinux:latest AS rust-base
RUN pacman -Sy --noconfirm rust cargo git

FROM rust-base AS rust-builder
WORKDIR /app
RUN git clone https://github.com/eyenalxai/kabbalistix-rs.git --no-checkout \
    && cd kabbalistix-rs \
    && git fetch --depth 1 origin a7c3d443050b063efe4e08d09484d5d1f991470b \
    && git checkout FETCH_HEAD
WORKDIR /app/kabbalistix-rs
RUN cargo build --release

FROM base AS pruner
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ ./.yarn/
COPY packages/ ./packages/
COPY apps/ ./apps/
RUN yarn install --immutable
COPY . .
RUN yarn turbo prune --scope=@kabbalistix/web --docker

FROM base AS installer
WORKDIR /app
# Install from pruned metadata first, then bring in sources
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
RUN yarn install --immutable
COPY --from=pruner /app/out/full/ .

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV SKIP_VALIDATION=true

# Build only the web app
RUN yarn turbo run build --filter=@kabbalistix/web

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs nextjs

# Place Rust binary where the app expects it at runtime
RUN mkdir -p ./kabbalistix-rs/target/release
COPY --from=rust-builder /app/kabbalistix-rs/target/release/kabbalistix ./kabbalistix-rs/target/release/kabbalistix
RUN chmod +x ./kabbalistix-rs/target/release/kabbalistix
RUN chown -R nextjs:nodejs ./kabbalistix-rs

# Copy pruned, installed, and built app
COPY --from=installer --chown=nextjs:nodejs /app ./

# Reduce to production dependencies for the web workspace so its binaries (e.g. next) are available
USER root
RUN yarn workspaces focus --production @kabbalistix/web && yarn cache clean

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
