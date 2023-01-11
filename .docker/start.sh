#!/usr/bin/env bash
echo Using port: ${PORT}
node ./lib/index.js --staticRoot /web --dbRoot /data --filesRoot /files --port ${PORT}
