export const isValidPrice = (price: number): boolean => {
  return typeof price === "number" && price > 0;
};

export const isValidQuantity = (qty: number): boolean => {
  return Number.isInteger(qty) && qty > 0;
};

export const isValidImageCount = (files: FileList | null): boolean => {
  if (!files) return true;
  return files.length >= 1 && files.length <= 5;
};
