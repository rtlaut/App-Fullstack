import React, { useState, useEffect } from "react";
import personsService from "./services/persons";
import "./styles.css";

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }

  return <div className={`notification ${message.type}`}>{message.text}</div>;
};

const Person = ({ person, onDelete }) => (
  <li>
    {person.name} {person.number}
    <button onClick={() => onDelete(person.id, person.name)}>delete</button>
  </li>
);

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [notificationMessage, setNotificationMessage] = useState(null);

  useEffect(() => {
    personsService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const handleOperation = (promise, successMessage, errorMessage) => {
    promise
      .then((data) => {
        setNotificationMessage({ text: successMessage, type: "success" });
        setTimeout(() => {
          setNotificationMessage(null);
        }, 5000);
        return data;
      })
      .catch((error) => {
        console.error(errorMessage, error);
        setNotificationMessage({ text: errorMessage, type: "error" });
        setTimeout(() => {
          setNotificationMessage(null);
        }, 5000);
      });
  };

  const addPerson = (event) => {
    event.preventDefault();
    const personObject = {
      name: newName,
      number: newNumber,
    };

    const existingPerson = persons.find((person) => person.name === newName);
    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      );
      if (confirmUpdate) {
        handleOperation(
          personsService.update(existingPerson.id, personObject),
          `Updated ${newName}`,
          `Information of ${newName} has already been removed from server`
        );
      }
    } else {
      handleOperation(
        personsService.create(personObject),
        `Added ${newName}`,
        `Could not add ${newName}`
      );
    }

    setNewName("");
    setNewNumber("");
  };

  const deletePerson = (id, name) => {
    const confirmDelete = window.confirm(`Delete ${name}?`);
    if (confirmDelete) {
      handleOperation(
        personsService.remove(id),
        `Deleted ${name}`,
        `Information of ${name} has already been removed from server`
      );
    }
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} />
      <div>
        filter shown with <input value={filter} onChange={handleFilterChange} />
      </div>
      <h2>Add a new</h2>
      <form onSubmit={addPerson}>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      <ul>
        {personsToShow.map((person) => (
          <Person key={person.id} person={person} onDelete={deletePerson} />
        ))}
      </ul>
    </div>
  );
};

export default App;
