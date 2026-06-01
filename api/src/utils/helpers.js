// Remove password from user object
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// Remove password from array of users
const sanitizeUsers = (users) => {
  return users.map(user => sanitizeUser(user));
};

module.exports = { sanitizeUser, sanitizeUsers };
