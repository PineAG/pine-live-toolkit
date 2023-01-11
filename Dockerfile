FROM node:lts as FrontendBuild
COPY . /app
WORKDIR /app
# RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn install &&\
    cd maintenance &&\
    npx gulp enableProductionFeatures &&\
    npx gulp buildLibs &&\
    npx gulp buildApps &&\
    npx gulp bundleBackend
RUN mv /app/projects/frontend/build /web && \
    mv /backend-release /server

FROM node:lts-slim
COPY --chown=1000:1000 --from=FrontendBuild /web /web
COPY --chown=1000:1000 --from=FrontendBuild /server /server
RUN cd /server && yarn install && cd /server/projects/server && yarn install --prod
VOLUME [ "/data", "/files" ]
ENV PORT=8000
WORKDIR /server/projects/server
CMD ["sh", "./start.sh"]
