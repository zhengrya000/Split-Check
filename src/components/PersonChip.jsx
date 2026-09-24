/** "Alex" -> "A", "Mary Beth" -> "MB" */
function initials(name) {
  return name
    .split(" ")
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * One person at the table. It doesn't own any state — the name comes in
 * through `person` and removing is handled by the `onRemove` callback prop
 * that PeopleSection passes down.
 */
function PersonChip({ person, onRemove }) {
  return (
    <li className="person-chip">
      <span className="avatar" aria-hidden="true">
        {initials(person.name)}
      </span>
      <span className="person-name">{person.name}</span>
      <button
        type="button"
        className="chip-remove"
        aria-label={`Remove ${person.name}`}
        onClick={() => onRemove(person.id)}
      >
        ×
      </button>
    </li>
  );
}

export default PersonChip;
