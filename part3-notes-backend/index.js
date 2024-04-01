const express = require("express");
const morgan = require("morgan"); // Tuodaan morgan-moduuli
const cors = require("cors");
const app = express();

// Luodaan uusi token, joka palauttaa pyynnön bodyn JSON-muodossa.
morgan.token("body", (req) => JSON.stringify(req.body));

// Morgan-konfiguraatio, joka sisältää määritellyn tokenin POST-pyynnöille
const morganConfig =
  ":method :url :status :res[content-length] - :response-time ms :body";

// Muuttuja, joka sisältää henkilöiden tiedot
let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122",
  },
];

// Middleware määritelty käyttämään JSON-pyynnön käsittelyyn
app.use(express.json());

app.use(cors());

// Käytetään morgan-middlewarea loggaamaan pyynnöt konsoliin.
// Huom: 'body'-token lisätään vain POST-pyyntöjen loggaukseen.
app.use(
  morgan((tokens, req, res) => {
    // Tarkistetaan, että logataan vain POST-pyynnöt.
    if (tokens.method(req, res) === "POST") {
      return morganConfig;
    }
    // Palauttaa perus 'tiny' konfiguraation muille pyyntötyypeille.
    return morgan["tiny"](tokens, req, res);
  })
);

// Reitti juureen
app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Phonebook!</h1>");
});

// Reitti kaikkien puhelinnumerotietojen hakuun
app.get("/api/persons", (req, res) => {
  res.json(persons);
});

// Reitti yksittäisen puhelinnumerotiedon näyttämiseen id:n perusteella
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    res.status(404).send({ error: "Person not found" });
  }
});

// Reitti uuden puhelinnumerotiedon lisäämiseen
app.post("/api/persons", (req, res) => {
  const body = req.body;

  // Tarkistetaan, että sekä nimi että numero on annettu
  if (!body.name || !body.number) {
    return res.status(400).json({ error: "Name or number is missing" });
  }

  // Tarkistetaan, ettei nimi ole jo luettelossa
  const nameExists = persons.some((person) => person.name === body.name);
  if (nameExists) {
    return res.status(400).json({ error: "Name must be unique" });
  }

  const person = {
    id: Math.floor(Math.random() * 10000), // Arvotaan id riittävän suurelta alueelta
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  res.json(person);
});

// Reitti puhelinnumerotiedon poistamiseen id:n perusteella
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end(); // 204 No Content, poisto onnistui
});

app.get("/info", (req, res) => {
  const info = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `;
  res.send(info);
});

// Portin määrittely ja palvelimen käynnistys
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
