# Use the official Node.js image as the base image
FROM node:24

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

RUN chmod +x wait-for-it.sh

# Generate Prisma client
# RUN npx prisma generate
# RUN npx prisma migrate dev --name init



# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
# CMD ["npm", "start"]
CMD ["./wait-for-it.sh", "postgres:5432", "--", "sh", "-c","npx prisma migrate dev --name init && node index.js"]