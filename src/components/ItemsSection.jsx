import { useState } from "react";
import BillItem from "./BillItem.jsx";
import PersonSelector from "./PersonSelector.jsx";
import { parsePriceToCents } from "../utils/calculations.js";

/**
 * "What did everyone order?" — the add-an-item form plus the list of items.
 * The form's three fields are this component's own state; finished items are
 * handed up to App through `onAddItem`.
 */
function ItemsSection({
  items,
  people,
  onAddItem,
  onToggleAssignment,
  onSelectEveryone,
  onDeleteItem,
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");

  const noPeopleYet = people.length === 0;

  function toggleSelected(personId) {
    // Build a new array instead of pushing into the old one: React compares
    // by identity, so mutating the existing array wouldn't trigger a re-render.
    setSelectedIds((current) =>
      current.includes(personId)
        ? current.filter((id) => id !== personId)
        : [...current, personId],
    );
  }

  function selectEveryone() {
    const everyone = people.map((person) => person.id);
    setSelectedIds(selectedIds.length === people.length ? [] : everyone);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const priceCents = parsePriceToCents(price);

    if (trimmedName === "") {
      setError("Give the item a name.");
      return;
    }
    if (priceCents === null) {
      setError("Enter a price like 12.50.");
      return;
    }

    onAddItem(trimmedName, priceCents, selectedIds);
    setName("");
    setPrice("");
    setSelectedIds([]);
    setError("");
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>What did everyone order?</h2>
        {items.length > 0 && <span className="badge">{items.length}</span>}
      </div>

      <form className="item-form" onSubmit={handleSubmit}>
        <div className="inline-form">
          <input
            type="text"
            className="grow"
            value={name}
            placeholder="Item name"
            aria-label="Item name"
            disabled={noPeopleYet}
            onChange={(event) => {
              setName(event.target.value);
              if (error !== "") setError("");
            }}
          />
          <input
            type="text"
            className="price-field"
            inputMode="decimal"
            value={price}
            placeholder="0.00"
            aria-label="Price"
            disabled={noPeopleYet}
            onChange={(event) => {
              setPrice(event.target.value);
              if (error !== "") setError("");
            }}
          />
          <button type="submit" className="primary" disabled={noPeopleYet}>
            Add item
          </button>
        </div>

        {noPeopleYet ? (
          <p className="hint">Add someone to the table first.</p>
        ) : (
          <>
            <p className="hint">Who had it?</p>
            <PersonSelector
              people={people}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
              onSelectEveryone={selectEveryone}
            />
          </>
        )}

        {error !== "" && <p className="error">{error}</p>}
      </form>

      {items.length === 0 ? (
        <div className="empty">
          <strong>Nothing on the check yet.</strong>
          <span>Add the first item above.</span>
        </div>
      ) : (
        <ul className="item-list">
          {items.map((item) => (
            <BillItem
              key={item.id}
              item={item}
              people={people}
              onToggleAssignment={onToggleAssignment}
              onSelectEveryone={onSelectEveryone}
              onDelete={onDeleteItem}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default ItemsSection;
