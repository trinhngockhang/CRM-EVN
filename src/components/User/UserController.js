import * as dbAccess from './UserDAL';

export const getPayment = async (req, res) => {
  const { id } = req.query;
  try {
    const data = await dbAccess.getPayment(id);
    res.send(data);
  } catch (e) {
    res.status(500).json({ mess: 'Something happen' });
    process.exit(0);
  }
};
