import express from "express";

const createOrderRouter = (db) => {
  const router = express.Router();

  router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    //Find the index of the order that matches the ID
    const orderIndex = db.findIndex((order) => order.id === id);
    // check if no items in the array 0 is still an item.
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found" });
    }
    // we merge the old object at that index with the new updates(updating the specific item in the array)
    db[orderIndex] = { ...db[orderIndex], ...updates };
    res.status(200).json(db[orderIndex]);
  });
  return router;
};
export default createOrderRouter;
