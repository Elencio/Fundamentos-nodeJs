import { Database } from './database.js';

const database = new Database();

export const authenticateUser = (email, tempPassword) => {
  const user = database.getUserByEmail(email);
  return user && user.tempPassword === tempPassword;
};
