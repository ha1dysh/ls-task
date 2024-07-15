FROM node:22-bullseye

ARG UID=1000
ARG GID=1000
ARG USER_NAME=dev

RUN groupadd --gid $GID $GID $USER_NAME || echo "exists"
RUN useradd --uid $UID --gid $USER_NAME --shell /bin/bash --create-home $USER_NAME || echo "exists"

RUN mkdir /app && chown $UID:$GID /app

WORKDIR /app

EXPOSE 5173

CMD ["node", "server.cjs"]
