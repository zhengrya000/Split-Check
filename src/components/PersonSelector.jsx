/**
 * The row of name buttons used to say who had an item.
 *
 * Used twice with different parents: once by the "add item" form (where the
 * selection is that form's local state) and once by every BillItem (where the
 * selection is the item's `assignedTo` array in App). It works in both places
 * because it keeps no state of its own — it just renders `selectedIds` and
 * reports clicks back through callbacks.
 */
function PersonSelector({ people, selectedIds, onToggle, onSelectEveryone }) {
  const everyoneSelected =
    people.length > 0 && selectedIds.length === people.length;

  return (
    <div className="selector">
      {people.map((person) => {
        const isSelected = selectedIds.includes(person.id);
        return (
          <button
            key={person.id}
            type="button"
            className={isSelected ? "toggle on" : "toggle"}
            aria-pressed={isSelected}
            onClick={() => onToggle(person.id)}
          >
            {isSelected && <span aria-hidden="true">✓ </span>}
            {person.name}
          </button>
        );
      })}

      <button
        type="button"
        className={everyoneSelected ? "toggle everyone on" : "toggle everyone"}
        aria-pressed={everyoneSelected}
        onClick={onSelectEveryone}
      >
        Everyone
      </button>
    </div>
  );
}

export default PersonSelector;
