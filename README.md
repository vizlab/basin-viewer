# basin-viewer

SI-CAT project

## Setup

### Preparation

```shell-session
$ gem install mongo
$ npm install
```

### MongoDB

```shell-session
$ docker run -p 27017:27017 -v `pwd`/mongo:/data/db mongo
```

### Data Initialization

Put {connections,japan-basin,rainfall}.json in ./data and run the following command.

```shell-session
$ ruby insert.rb
```

### Watch Client Code

```shell-session
$ npm run watch
```

### Production Build

```shell-session
$ npm run build
```

### Run Server

Run the following command and open http://localhost:3000/ .

```shell-session
$ npm start
```
