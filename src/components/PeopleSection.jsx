import { useState } from "react";
import PersonChip from "./PersonChip.jsx";

/**
 * "Who's splitting?" — the add-a-person form and the list of chips.
 *
 * The people themselves live in App's state. This component only owns the text
 * sitting in its own input box, and calls `onAddPerson` / `onRemovePerson`
 * when the list needs to change.
 */
function PeopleSection({ people, onAddPerson, onRemovePerson }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    // The form's onSubmit covers both the button and pressing Enter.
    // Without this the browser would reload the page.
    event.preventDefault();

    const trimmed = name.trim();
    if (trimmed === "") {
      setError("Type a name first.");
      return;
    }

    const alreadyHere = people.some(
      (person) => person.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (alreadyHere) {
      setError(`${trimmed} is already at the table.`);
      return;
    }

    onAddPerson(trimmed);
    setName("");
    setError("");
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>Who&apos;s splitting?</h2>
        {people.length > 0 && <span className="badge">{people.length}</span>}
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="grow"
          value={name}
          placeholder="Person's name"
          aria-label="Person's name"
          onChange={(event) => {
            setName(event.target.value);
            if (error !== "") setError("");
          }}
        />
        <button type="submit" className="primary">
          Add person
        </button>
      </form>

      {error !== "" && <p className="error">{error}</p>}

      {people.length === 0 ? (
        <div className="empty">
          <strong>Who&apos;s at the table?</strong>
          <span>Add your friends to get started.</span>
        </div>
      ) : (
        <ul className="chip-list">
          {people.map((person) => (
            <PersonChip
              key={person.id}
              person={person}
              onRemove={onRemovePerson}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default PeopleSection;
