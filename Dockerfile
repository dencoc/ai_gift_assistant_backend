FROM node:22
WORKDIR /app
RUN npm init -y && \
    npm install express && \
    npm set-script dev "node index.js"
COPY . .
EXPOSE 13000
CMD ["npm", "run", "dev"]