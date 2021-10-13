FROM scratch

USER root
ADD root.tar /
RUN apt-get update

RUN wget https://unofficial-builds.nodejs.org/download/release/v16.9.1/node-v16.9.1-linux-armv6l.tar.gz
RUN tar -xzf node-v16.9.1-linux-armv6l.tar.gz; rm node-v16.9.1-linux-armv6l.tar.gz
RUN mv node-v16.9.1-linux-armv6l /opt/nodejs/
RUN ln -s /opt/nodejs/bin/node /usr/bin/node; \
  ln -s /opt/nodejs/bin/node /usr/sbin/node; \
  ln -s /opt/nodejs/bin/node /sbin/node; \
  ln -s /opt/nodejs/bin/node /usr/local/bin/node; \
  ln -s /opt/nodejs/bin/npm /usr/bin/npm; \
  ln -s /opt/nodejs/bin/npm /usr/sbin/npm; \
  ln -s /opt/nodejs/bin/npm /sbin/npm; \
  ln -s /opt/nodejs/bin/npm /usr/local/bin/npm; \
  ln -s /opt/nodejs/bin/npx /usr/bin/npx; \
  ln -s /opt/nodejs/bin/npx /usr/sbin/npx; \
  ln -s /opt/nodejs/bin/npx /sbin/npx; \
  ln -s /opt/nodejs/bin/npx /usr/local/bin/npx; \
  exit 0;

RUN wget -r https://davesteele.github.io/comitup/latest/comitup_latest.html
RUN dpkg -i davesteele.github.io/comitup/deb/comitup_*.deb; exit 0
RUN apt-get -f install -y

RUN rm /etc/wpa_supplicant/wpa_supplicant.conf

ARG PI_PASSWORD
RUN echo "pi:${PI_PASSWORD}" | chpasswd

ADD deployment/controllerv2/root-overlay /
RUN chown -R pi /home/pi
RUN usermod -a -G dialout pi

WORKDIR /app

COPY ["./package.json", "./package-lock.json*", "./"]
RUN npm install

COPY ./src ./src
RUN npm run build:controller

RUN chmod -R 744 /app

CMD ["node","./dist/controller/index.js"]
