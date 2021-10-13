https://github.com/balenalabs/balena-dash


Deployment
===

Server
---
``
caprover deploy
``

Controller
---
[get os image](https://www.raspberrypi.com/software/operating-systems/) and put it there: ``./deployment/controllerv2/img``
````
./deployment/controllerv2/pidock.py all --img ./img/2021-05-07-raspios-buster-armhf-lite.img --passwd lithdomo --host lithdomo --dev /dev/null
````
while running change partition size

Admin
---
Cannot be deployed. Run with ``npm run start:admin``
