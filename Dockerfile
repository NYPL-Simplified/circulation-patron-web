# build environment
FROM node:12.2.0-alpine as build
COPY package*.json ./
# CI is a faster npm install for use in CI environments
RUN npm ci
COPY . ./
RUN npm run build:prod
# we are going to copy the node_modules over for the server,
# but should prune them first
RUN npm prune --production

# production environment
FROM node:12.2.0-alpine
ENV PORT=3000
EXPOSE $PORT

WORKDIR /app/

COPY --from=build /node_modules node_modules
COPY --from=build /lib lib
COPY --from=build /dist dist

USER node
CMD ["node", "lib/server/index.js"]