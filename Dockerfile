FROM node:lts as FrontendBuild
COPY . /app
WORKDIR /app
# RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn install &&\
    cd maintenance &&\
    npx gulp installAllDependencies &&\
    npx gulp enableProductionFeatures &&\
    npx gulp buildAllProjects
RUN mv /app/projects/dualies/build /web

FROM nginx:latest
COPY --chown=1000:1000 --from=FrontendBuild /web /web
COPY ./.docker /docker
CMD sh /docker/start.sh
