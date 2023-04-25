#!/bin/bash
# deploys flex_records
git clone -b prod_test https://github.com/Iyusuf40/whiteBoard

cd whiteBoard/app

npm install

cd

cd whiteBoard/app/devOps

./manage_service.sh
./setup_nginx_conf.sh
