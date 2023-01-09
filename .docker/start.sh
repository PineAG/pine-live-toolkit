#!/usr/bin/env bash
echo Using port: ${PORT}
node ./index.js --staticRoot /web --dbRoot /data --filesRoot /files --port ${PORT}
