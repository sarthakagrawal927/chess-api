FROM node:16
# Installing libvips-dev for sharp Compatability
RUN apt-get update && apt-get install libvips-dev -y
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
ENV PATH /opt/node_modules/.bin:$PATH
COPY ./ .
RUN npm install
WORKDIR /opt
EXPOSE 8080
CMD ["node", "app.js"]
