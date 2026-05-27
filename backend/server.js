console.log('server nuevo funcionando');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/generate-tattoo', async (req, res) => {

  try {

    const { prompt } = req.body;

    const response = await axios.post(

      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',

      {
        inputs: `Genera una idea creativa para un tatuaje: ${prompt}`
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }

    );

    console.log(response.data);

    res.json({
      result: response.data.generated_text || JSON.stringify(response.data)
    });

  } catch (error) {

    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: 'Error con Hugging Face'
    });

  }

});

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});