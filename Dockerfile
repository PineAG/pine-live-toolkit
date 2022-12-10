FROM node:lts as FrontendBuild
COPY . /app
RUN cd /app/projects/client &&\
    yarn install && yarn build &&\
    cd ../dualies &&\
    yarn install && yarn build
RUN mv /app/projects/dualies/build /web

FROM nginx:latest
COPY --chown=1000:1000 --from=FrontendBuild /web /web
COPY ./.docker /docker
CMD sh /docker/start.sh
