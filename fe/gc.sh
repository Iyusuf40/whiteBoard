#!/bin/bash

if [ ! "$2" ]
then
	echo "too short"
	exit 99
fi

git add "$1"
git commit -m "$2"
git push
