require('dotenv').config();

const express = require('express');
const app = express();
const port = 4000;
const tasksRouter = require('./router');

app.use(express.json());
app.use('/api', tasksRouter);

const path = require('path');

// Serve static files from the "frontend" directory
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});