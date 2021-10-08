FROM ubuntu:20.10

RUN apt-get update
RUN apt-get install wget -y
RUN apt-get install qemu-user-static -y

WORKDIR /workdir

RUN wget https://steele.debian.net/comitup/image_2021-06-30-Comitup.zip -O tmp.zip

RUN apt-get install unzip -y

RUN unzip tmp.zip
RUN rm tmp.zip

RUN ls
