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

/*Skapa tabell om den inte finns och lägg till testdata om databasen är tom*/
db.serialize(() => {
  // Skapa tabellen
  db.run("CREATE TABLE IF NOT EXISTS trainTable (id INTEGER PRIMARY KEY AUTOINCREMENT, trainnr TEXT NOT NULL, destination TEXT NOT NULL, time TEXT NOT NULL, track TEXT NOT NULL, status TEXT NOT NULL)");

  // Kolla om det redan finns data
  db.get("SELECT COUNT(*) as count FROM trainTable", (err, row) => {
    if (row.count === 0) {
      console.log("Databasen är tom, lägger till testdata...");
      const stmt = db.prepare("INSERT INTO trainTable (trainnr, destination, time, track, status) VALUES (?, ?, ?, ?, ?)");
      
      // Lägg till x antal tåg
      stmt.run("SJ 412", "Borlänge", "13:45", "2", "on_time");
      stmt.run("MTR 705", "Göteborg", "14:10", "4", "delayed");
      stmt.run("SJ 120", "Stockholm", "15:00", "1", "cancelled");
      stmt.run("Snälltåget", "Malmö", "16:20", "12", "on_time");
      
      stmt.finalize();
    }
  });
});

server.listen(PORT, () => {
  console.log("Server körs på http://localhost:3000");
});

/*Get för att hämta alla objekt ur databasen*/
server.get('/trainTable', (req, res) => {
    db.all('SELECT id, trainnr, destination, time, track, status FROM trainTable', (err, row) => {
        res.send(row);
    });
});

/* Spara nytt tåg */
server.post('/trainTable', (req, res) => {
    const { trainnr, destination, time, track, status } = req.body;
    const sql = 'INSERT INTO trainTable (trainnr, destination, time, track, status) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [trainnr, destination, time, track, status], function(err) {
        if (err) res.status(500).send(err.message);
        else res.status(201).send({ id: this.lastID });
    });
});

/* Ta bort tåg */
server.delete('/trainTable/:id', (req, res) => {
    db.run('DELETE FROM trainTable WHERE id = ?', req.params.id, (err) => {
        if (err) res.status(500).send(err.message);
        else res.send({ message: "Borttagen" });
    });
});

/* Uppdatera befintligt tåg */
server.put('/trainTable/:id', (req, res) => {
    const { trainnr, destination, time, track, status } = req.body;
    const id = req.params.id;
    const sql = 'UPDATE trainTable SET trainnr = ?, destination = ?, time = ?, track = ?, status = ? WHERE id = ?';
    
    db.run(sql, [trainnr, destination, time, track, status, id], (err) => {
        if (err) {
            res.status(500).send({ error: err.message });
        } else {
            res.send({ message: "Uppdatering lyckades" });
        }
    });
});