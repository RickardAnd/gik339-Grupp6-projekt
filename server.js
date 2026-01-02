const PORT = process.env.PORT || 3000;

const express = require("express");
const server = express();

server
.use(express.json())
.use(express.urlencoded({ extended: false }))
.use((req, res, next) => {
 res.header('Access-Control-Allow-Origin', '*');
 res.header('Access-Control-Allow-Methods', '*');
 res.header('Access-Control-Allow-Headers', '*');
 next();
});

/*Databas*/
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./trainTable.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS trainTable (id INTEGER PRIMARY KEY AUTOINCREMENT, trainnr TEXT NOT NULL, destination TEXT NOT NULL, time TEXT NOT NULL, track TEXT NOT NULL, status TEXT NOT NULL)"
  );
});

server.listen(PORT, () => {
  console.log("Server körs på http://localhost:3000");
});

/*Get för att hämta alla objekt ur databasen*/
server.get('/trainTable', (req, res) => {
    db.all('SELECT trainnr, destination, time, track, status FROM trainTable', (err, row) => {
        res.send(row);
    });
});