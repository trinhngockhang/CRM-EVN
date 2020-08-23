import * as dbAccess from './UserDAL';

export const getPayment = async (req, res) => {
  const { id } = req.query;
  const data = await dbAccess.getPayment(id);
  res.send(data);
};
