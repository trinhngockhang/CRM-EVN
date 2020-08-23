export default {
  port: process.env.PORT || 3002,
  oracle: {
    user: process.env.USERDB,
    password: process.env.PASSWORD,
    connectString: process.env.CONNECTSTRING,
  },
  p_dblink: process.env.PDBLINK,
};
