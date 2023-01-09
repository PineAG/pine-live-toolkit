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
    mv /app/projects/server/lib /server &&\
    cp /app/projects/server/package.json /server

FROM node:lts-slim
COPY --chown=1000:1000 --from=FrontendBuild /web /web
COPY --chown=1000:1000 --from=FrontendBuild /server /server
RUN cd /server && yarn install --prod
VOLUME [ "/data", "/files" ]
ENV PORT=8000
WORKDIR /server
CMD ["node", "./index.js", "--staticRoot", "/web", "--dbRoot", "/data", "--filesRoot", "/files", "--port", "$PORT"]
