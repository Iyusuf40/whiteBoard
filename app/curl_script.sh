#!/bin/bash
# $1 == method, $2 == path, $3 == data

method="$1"
path="$2"
data="$3"
pre_path="$pre_path"

# echo $method $path $data $pre_path

if [[ -z $pre_path ]]
then
	pre_path=/
	# echo $pre_path
fi

if [[ $path == "/"* ]]
then
	path=$(echo $path | cut -c 2-)
	echo $path
fi

full_path="$pre_path$path"

if [ -z $method ]
then
	echo "method must be provided"
	echo "usage ./curl_script.sh method path data"
	exit 98
fi

if [[ $method == "GET" || $method == "get" ]]
then
	curl -i "localhost:3000$full_path"
fi

if [[ $method == "DELETE" || $method == "delete" ]]
then
	curl -i -X DELETE "localhost:3000$full_path"
fi

if [[ $method == "POST" || $method == "post" ]]
then
	if [ -z $data ]; then
		echo "data field required"
		echo "usage ./curl_script.sh method path data"
		exit 99
	fi
	curl -i -X POST -d "$data" -H "Content-type: application/json" "localhost:3000$full_path"
fi

if [[ $method == "PUT" || $method == "put" ]]
then
	if [ -z $data ]; then
		echo "data field required"
		echo "usage ./curl_script.sh method path data"
		exit 99
	fi
	curl -i -X PUT -d "$data" -H "Content-type: application/json" "localhost:3000$full_path"
fi

