docker build -t raspi-custom .
pause
id=$(docker create raspi-custom)
docker cp $id:custom.img - > build/custom.img
docker rm -v $id
