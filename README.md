# PLTK: Pine's Live Toolkit / 派因的直播工具包

[![Docker Build](https://github.com/PineAG/pine-live-toolkit/actions/workflows/docker-image.yml/badge.svg)](https://github.com/PineAG/pine-live-toolkit/actions/workflows/docker-image.yml)
[![Electron Build](https://github.com/PineAG/pine-live-toolkit/actions/workflows/build-electron.yml/badge.svg)](https://github.com/PineAG/pine-live-toolkit/actions/workflows/build-electron.yml)
[![NPM Publish](https://github.com/PineAG/pine-live-toolkit/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/PineAG/pine-live-toolkit/actions/workflows/npm-publish.yml)

PLTK是一款为OBS用户设计的直播小工具服务器，您可以创建面板，在面板中添加小工具，以及实时修改小工具的位置及设置。
PLTK无需向OBS安装任何插件，只要将展示页链接作为网页添加到OBS即可。


## 在线试用

可以点击下方链接在本地试用基本功能与插件

* 所有数据保存在浏览器内部存储
* 数据同步功能只能在同一浏览器的标签页之间进行
* 隐私模式可能无法正常使用(部分浏览器会禁用本地存储)

[试用地址](https://pltk-example.pine-ag.com/)


## 居家部署

### 桌面版

基于Electron的桌面版，还在做，做出来了Release能看到。

### Docker镜像

可使用Docker镜像部署

[pineag/pltk](https://hub.docker.com/repository/docker/pineag/pltk/general)

* 使用SQLite作为数据库
* 数据库挂载点: /data
* 上传文件挂载点: /files
* 可使用PORT环境变量指定端口
* [docker-compose.yml 例子](./docker-compose.yml)


