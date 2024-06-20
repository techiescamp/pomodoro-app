FROM node:20.12.2-alpine

# Work directory for all steps
WORKDIR /app

# Copy files from local to the work directory
COPY . .

# Install all dependencies
RUN npm install

# Expose package
EXPOSE 7000

# Command to run the application
CMD ["npm", "start"]
