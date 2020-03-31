# Builder image
FROM node:alpine as build
WORKDIR /build/

COPY . .

# Build TypeScript
RUN yarn
RUN yarn build

# Container
FROM node:alpine
WORKDIR /snepalysis

# OS dependancies
RUN apk add git

# Code dependancies
COPY package.json .
COPY yarn.lock .

RUN yarn --prod
COPY --from=build /build/dist dist

RUN yarn prod
