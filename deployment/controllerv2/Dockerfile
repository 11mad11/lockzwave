FROM ubuntu:20.10

RUN apt-get update
RUN apt-get install git -y

RUN git clone https://github.com/eringr/pidock.git
RUN cd pidlock

ADD ./content ./

RUN ./pidock.py extract --img ./2021-06-30-Comitup.img
RUN ./pidock.py build --passwd lithdomo
RUN ./pidock.py compose --host lithdomo

