const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();
const port = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const app = express();
app.use(express.json());

app.listen(port, () => {
    console.log('Server is running on port ${port}');
});

app.get('/allperfumes', async (req, res) => {
  try {
    let connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM perfumes;');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server errorz for allperfumes' });
  }
});


app.post('/addperfume', async (req, res) => {
  const { perfume_name, brand, price } = req.body;

  if (!perfume_name || !brand) {
    return res.status(400).json({ message: 'perfume_name and brand are required' });
  }

  try {
    let connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'INSERT INTO perfumes (perfume_name, brand, price) VALUES (?, ?, ?)',
      [perfume_name, brand, price ?? 0]
    );

    res.status(201).json({ message: 'Perfume ' + perfume_name + ' added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error - could not add perfume ' + perfume_name });
  }
});


app.put('/updateperfume', async (req, res) => {
  const { id, perfume_name, brand, price } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'id is required to update a perfume' });
  }

  try {
    let connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `UPDATE perfumes
       SET perfume_name = COALESCE(?, perfume_name),
           brand        = COALESCE(?, brand),
           price        = COALESCE(?, price)
       WHERE id = ?;`,
      [perfume_name ?? null, brand ?? null, price ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No perfume found with id ' + id });
    }

    res.json({ message: 'Perfume id ' + id + ' updated successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error - could not update perfume id ' + id });
  }
});


app.delete('/deleteperfume', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'id is required to delete a perfume' });
  }

  try {
    let connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'DELETE FROM perfumes WHERE id = ?;',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No perfume found with id ' + id });
    }

    res.json({ message: 'Perfume id ' + id + ' deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error - could not delete perfume id ' + id });
  }
});
