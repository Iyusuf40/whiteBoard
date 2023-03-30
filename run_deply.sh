#!/bin/bash

fab -f fab_run_script_remote.py run_script:deploy.sh -u ubuntu
# run fab -h for help
# signature = fab -f FABFILE_PATH COMMAND:ARGS -u USER
