#!/bin/sh

function jsonval {
    temp=`echo $json | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w $prop | cut -d":" -f2| sed -e 's/^ *//g' -e 's/ *$//g' | sed "s/'//g"`
    echo ${temp##*|}
}

json=`npm version`
prop='mexjs'
version=`jsonval`

echo 'Building latest docker image for mexjs '$version
docker build -f docker/Dockerfile -t tistaharahap/mexjs:latest .

echo 'Tagging latest to version '$version
docker tag tistaharahap/mexjs:latest tistaharahap/mexjs:$version

echo 'Pushing latest'
docker push tistaharahap/mexjs:latest

echo 'Pushing version '$version
docker push tistaharahap/mexjs:$version

echo 'Done.'
