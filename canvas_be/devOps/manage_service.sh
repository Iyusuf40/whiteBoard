#!/bin/bash
sudo cp ./whiteboard.service /lib/systemd/system

sudo systemctl daemon-reload
sudo systemctl start hello_env
