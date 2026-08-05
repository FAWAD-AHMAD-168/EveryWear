import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const nanoid = customAlphabet(alphabet, 6);

const generateOrderId = () => {
  return `ORD-${nanoid()}`;
};

export default generateOrderId;