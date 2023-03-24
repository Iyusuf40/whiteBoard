#!/bin/bash
sudo cp ./whiteboard.service /lib/systemd/system

sudo systemctl daemon-reload
sudo systemctl enable whiteboard
sudo systemctl start whiteboard
