#!/bin/sh

if [ "$github_token" = "" ]; then 
  echo "Building docker image without AxisNow Github Packages Token"
  npm i --no-optional
else 
  echo "Building docker image with AxisNow using Github Packages Token"
  echo "@nypl-simplified-packages:registry=https://npm.pkg.github.com/nypl-simplified-packages" > ./.npmrc
  echo "//npm.pkg.github.com/:_authToken=${github_token}" >> ./.npmrc
  echo "//registry.npmjs.org/" >> ./.npmrc
  npm i
fi