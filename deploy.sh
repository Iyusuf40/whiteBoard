#!/bin/bash
# deploys whiteboard app
cd whiteboard/app
git checkout prod_test
git pull
sudo service whiteboard restart
