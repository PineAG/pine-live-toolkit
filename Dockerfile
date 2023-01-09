FROM node:lts as FrontendBuild
COPY . /app
WORKDIR /app
# RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn install &&\
    cd maintenance &&\
    npx gulp installAllDependencies &&\
    npx gulp enableProductionFeatures &&\
    npx gulp buildLibs &&\
    npx gulp generateServerSchema &&\
    npx gulp buildApps
RUN mv /app/projects/dualies/build /web && \
    mkdir -p /server/projects &&\
    mv /app/projects/server/lib /server/projects/server &&\
    cp /app/projects/server/package.json /server/projects/server &&\
    mkdir /server/projects/protocol &&\
    mv /app/projects/protocol/lib /server/projects/protocol/lib &&\
    mv /app/projects/protocol/package.json /server/projects/protocol &&\
    cp /app/.docker/package.json /server/package.json

FROM node:lts-slim
COPY --chown=1000:1000 --from=FrontendBuild /web /web
COPY --chown=1000:1000 --from=FrontendBuild /server /server
RUN cd /server && yarn install && cd /server/projects/server && yarn install --prod
VOLUME [ "/data", "/files" ]
ENV PORT=8000
WORKDIR /server/projects/server
CMD ["node", "./index.js", "--staticRoot", "/web", "--dbRoot", "/data", "--filesRoot", "/files", "--port", "$PORT"]
