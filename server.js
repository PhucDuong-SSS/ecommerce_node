const app = require("./src/app");

const PORT = 3055;

const server = app.listen(PORT, () => {
  console.log(`WSV eCommerce service listening on port ${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => {
    console.log(`server is shutting down`);
    // notify.send("server is shutting down");
  });
});
