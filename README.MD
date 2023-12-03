1. To Run locally:
```shell
node app.js
```


1. To build docker:

```shell
docker build -t whatsapp-docker:latest .
```

2. To Run docker:

```shell
docker run -p 8080:8080 --name whatsapp-docker -it whatsapp-docker:latest
```
