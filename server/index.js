const {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite,
  } = require("./db");
  
  const express = require("express");
  const app = express();
  
  app.use(express.json());
  
  app.get("/api/users", async (req, res, next) => {
    try {
      res.send(await fetchUsers());
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/users/:id/favorites", async (req, res, next) => {
    try {
      res.send(await fetchFavorites(req.params.id));
    } catch (ex) {
      next(ex);
    }
  });
  
  app.post("/api/users/:id/favorites", async (req, res, next) => {
    try {
      res.status(201).send(
        await createFavorite({
          user_id: req.params.id,
          product_id: req.body.product_id,
        })
      );
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete("/api/users/:user_id/favorites/:id", async (req, res, next) => {
    try {
      await destroyFavorite({ user_id: req.params.user_id, id: req.params.id });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });
  
  app.get("/api/products", async (req, res, next) => {
    try {
      res.send(await fetchProducts());
    } catch (ex) {
      next(ex);
    }
  });
  
  const init = async () => {
    const port = process.env.PORT || 3000;
    await client.connect();
    console.log("connected to database");
  
    await createTables();
    console.log("tables created");
  
    const [moe, lucy, ethyl, curly, foo, bar, bazz, quq, fip] = await Promise.all(
      [
        createUser({ username: "moe", password: "m_pw" }),
        createUser({ username: "lucy", password: "l_pw" }),
        createUser({ username: "ethyl", password: "e_pw" }),
        createUser({ username: "curly", password: "c_pw" }),
        createProduct({ name: "foo" }),
        createProduct({ name: "bar" }),
        createProduct({ name: "bazz" }),
        createProduct({ name: "quq" }),
        createProduct({ name: "fip" }),
      ]
    );
  
    console.log(await fetchUsers());
    console.log(await fetchProducts());
  
    console.log(await fetchFavorites(moe.id));
    const favorite = await createFavorite({
      user_id: moe.id,
      product_id: foo.id,
    });
  
    console.log(await fetchFavorites(moe.id));
    console.log(await fetchFavorites(moe.id));
    console.log("CURL commands for testing");
    console.log(`curl localhost:${port}/api/users`);
    console.log(`curl localhost:${port}/api/products`);
    console.log("=== RUN TO TEST POST ===");
    console.log(`curl localhost:${port}/api/users/${moe.id}/favorites -v`);
    console.log(
      `curl -X POST localhost:${port}/api/users/${moe.id}/favorites -d '{"product_id": "${foo.id}"}' -H "Content-Type:application/json" -v`
    );
    console.log(`curl localhost:${port}/api/users/${moe.id}/favorites -v`);
    const favoriteToDelete = await createFavorite({
      user_id: lucy.id,
      product_id: fip.id,
    });
  
    console.log("==== RUN TO TEST DELETE ====");
    console.log(`curl localhost:${port}/api/users/${lucy.id}/favorites`);
    console.log(
      `curl -X DELETE localhost:${port}/api/users/${lucy.id}/favorites/${favoriteToDelete.id} -v`
    );
    console.log(`curl localhost:${port}/api/users/${lucy.id}/favorites`);
  
    app.listen(port, () => console.log(`listening on port ${port}`));
  };
  
  init();