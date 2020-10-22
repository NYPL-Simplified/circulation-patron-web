#!/bin/sh

if [ "$github_token" = "" ]; then 
  echo "Building Without AxisNow Decryption"
  npm i --no-optional
else 
  echo "Building with AxisNow using Github Packages Token"
  echo "\n//npm.pkg.github.com/:_authToken=${github_token}" >> ./.npmrc
  npm i
fi