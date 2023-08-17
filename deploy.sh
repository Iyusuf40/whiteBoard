#!/bin/bash
# deploys whiteboard app
cd whiteBoard/app
git checkout prod_test
git pull -f
sudo service whiteboard restart
