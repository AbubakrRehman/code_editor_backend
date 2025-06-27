FROM node:19.9.0

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update and install Python and Node.js and cpp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential -y \
    openjdk-17-jdk \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8091

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]