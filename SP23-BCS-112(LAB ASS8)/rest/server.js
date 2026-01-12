const express = require('express');
const cors = require('cors');
const { data } = require('../utils/payload');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/user', (req, res) => {
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`REST Server running on http://localhost:${PORT}`);
});
