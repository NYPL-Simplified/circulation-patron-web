# build environment
FROM node:12.2.0-alpine as build
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
    NODE_ENV=production \
    UID=990 \
    GID=99
EXPOSE $PORT

COPY ./build /build

WORKDIR /app/
# copy our entrypoint file
COPY --from=build /node_modules node_modules
COPY --from=build /lib lib
COPY --from=build /dist dist

RUN /build/build.sh

USER node
CMD ./entrypoint.sh