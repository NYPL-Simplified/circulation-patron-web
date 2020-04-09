# build environment
FROM node:12.2.0-alpine as builder
# we first copy just the package.json and run npm ci
# to take advantage of layer caching
COPY package*.json ./
RUN npm ci
# then copy the rest of the files and run the build command
COPY . ./
RUN npm run build:prod
# we are going to copy the node_modules over to the minimal image
# for the server to use, but we prune them first
RUN npm prune --production

# production environment
FROM node:12.2.0-alpine
ENV PORT=3000 \
    NODE_ENV=production
EXPOSE $PORT

WORKDIR /app/
COPY --from=builder /node_modules node_modules
COPY --from=builder /lib lib
COPY --from=builder /dist dist

USER node
CMD ["node", "lib/server/index.js"]