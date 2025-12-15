FROM node:lts-trixie-slim AS builder

WORKDIR /app
COPY . .
RUN npm ci

RUN npx prisma generate
RUN npm run build

FROM node:lts-trixie-slim AS deployer

WORKDIR /app

COPY --from=builder /app/build .
COPY --from=builder /app/res res/
COPY --from=builder /app/prisma prisma/
COPY --from=builder /app/package.json .
COPY --from=builder /app/.npmrc .

RUN npm install --omit=dev

RUN rm -f .npmrc

RUN npx prisma generate


EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm","run", "production:entry"]
