import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Token inválido");
  }
};
