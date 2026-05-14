const isValidPrice = (price) => {
  return typeof price === "number" && price > 0;
};

const isValidQuantity = (qty) => {
  return Number.isInteger(qty) && qty > 0;
};

const isValidImageCount = (files) => {
  if (!files) return true;
  return files.length >= 1 && files.length <= 5;
};

module.exports = {
  isValidPrice,
  isValidQuantity,
  isValidImageCount,
};
