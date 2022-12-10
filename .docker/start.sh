#!/usr/bin/env bash
cat /docker/server.conf | sed "s/proxy_data_server/$DATA_SERVER_HOST/" | sed "s/proxy_file_server/$FILE_SERVER_HOST/" > /etc/nginx/conf.d/server.conf
echo "====== Generated NGINX Config ======"
cat /etc/nginx/conf.d/server.conf
echo "======                        ======"
nginx -t
nginx -g "daemon off;"