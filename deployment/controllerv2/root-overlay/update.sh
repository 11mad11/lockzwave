systemctl stop zwave_controller.service
rm /app -R
git clone https://github.com/11mad11/lockzwave.git /app
cd /app
npm i
npm run build:controller
systemctl start zwave_controller.service
reboot
