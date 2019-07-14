FROM node:10.15.3-alpine

# Global dependencies
RUN apk --no-cache add --virtual native-deps \
    g++ gcc libgcc libstdc++ linux-headers git make python && \
    npm install --quiet node-gyp -g

# App dependencies
WORKDIR /app
COPY package.json ./
RUN npm --allow-root install

# Remove unneeded dependencies
RUN apk del native-deps

# Build assets
COPY . ./
RUN npm run build

# Default runtime configs and helpers
EXPOSE 8080
CMD sync; /app/docker/start.sh
