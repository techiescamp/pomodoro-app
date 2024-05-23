FROM node:20.12.2-alpine

# Work directory for all steps
WORKDIR /app

# Copy files from local to the work directory
COPY /pomodoro-app/public ./public
COPY /pomodoro-app/src ./src
COPY /pomodoro-app/package*.json ./

# Install all dependencies
RUN npm install

# Expose package
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
