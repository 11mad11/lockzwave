FROM node:16 as build
WORKDIR /app

COPY ["./package.json", "./package-lock.json*", "./"]
RUN npm install

COPY ./src ./src
RUN npm run build:controller

FROM scratch

USER root
ADD root.tar /
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
RUN apt-get update && apt-get install wget nodejs -y

RUN wget -r https://davesteele.github.io/comitup/latest/comitup_latest.html
RUN dpkg -i davesteele.github.io/comitup/deb/comitup_*.deb; exit 0
RUN apt-get -f install -y

RUN rm /etc/wpa_supplicant/wpa_supplicant.conf

ARG PI_PASSWORD
RUN echo "pi:${PI_PASSWORD}" | chpasswd

ADD deployment/controllerv2/root-overlay /
RUN chown -R pi /home/pi

WORKDIR /app
COPY --from=build ./app/dist ./dist
COPY --from=build ./app/node_modules ./node_modules

CMD ["node","./dist/controller/index.js"]
