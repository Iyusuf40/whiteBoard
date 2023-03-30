#!/bin/bash
# deploys whiteboard app
cd whiteBoard/app
git checkout prod_test
git pull
sudo service whiteboard restart
