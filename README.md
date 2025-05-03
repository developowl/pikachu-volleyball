# pikachu-volleyball(with Deuse) to use Sejong Univ festival booth


Forked from [original/project from gorisanson](https://github.com/gorisanson/pikachu-volleyball).  
This version includes additional features and customizations for [Univ festival].  


Additional feature is Deuse. And i changed winning score 15 to 7.


## How to run locally

1. Clone this repository and get into the directory.

```sh
git clone https://github.com/developowl/pikachu-volleyball
cd pikachu-volleyball
```

2. Install dependencies. (If errors occur, you can try with `node v16` and `npm v8`.)

```sh
npm install
```

3. Bundle the code.

```sh
npm run build
```

4. Run a local web server.

```sh
npx http-server dist
```

5. Connect to the local web server on a web browser. (In most cases, the URL for connecting to the server would be `http://localhost:8080`. For the exact URL, it is supposed to be found on the printed messages on your terminal.)
