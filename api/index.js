module.exports = async (req, res) => {
  try {
    await fetchOrderData(req, res);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
