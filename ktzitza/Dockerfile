FROM node:10.0
LABEL environment="DEV"
EXPOSE 80
RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install --global forever
RUN npm install
VOLUME /usr/src/app
CMD ["forever","start ./forever.json"]
