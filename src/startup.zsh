#!/bin/zsh
if [[ `hostname` == *.local ]]; then
    ENV="DEV"
else
    ENV="PRD"
fi
screen -S diendee
node ./server.js