#!/bin/bash

sudo cp collab_nginx.conf /etc/nginx/conf.d/
sudo nginx -t && sudo nginx -s reload