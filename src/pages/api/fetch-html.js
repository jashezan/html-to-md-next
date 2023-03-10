import axios from 'axios';  

export default async (req, res) => {
  const { url } = req.query;
  
  try {
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching HTML content');
  }
};
