import PersonSelector from "./PersonSelector.jsx";
import { formatCents, splitItem } from "../utils/calculations.js";

/**
 * One line of the check. The name buttons underneath are live: tapping one
 * changes who the item belongs to and every total on the page updates, because
 * the totals are calculated from this same state on each render.
 */
function BillItem({ item, people, onToggleAssignment, onSelectEveryone, onDelete }) {
  const sharedBy = item.assignedTo.length;
  const isUnassigned = sharedBy === 0;

  // The same function the totals use, so the preview can't disagree with them.
  // A price that doesn't divide cleanly leaves some shares a penny apart.
  const shares = sharedBy > 0 ? splitItem(item.priceCents, sharedBy) : [];
  const isEven = sharedBy > 0 && shares[0] === shares[sharedBy - 1];

  return (
    <li className={isUnassigned ? "bill-item unassigned" : "bill-item"}>
      <div className="bill-item-top">
        <span className="item-name">{item.name}</span>
        <span className="item-price">{formatCents(item.priceCents)}</span>
        <button
          type="button"
          className="chip-remove"
          aria-label={`Delete ${item.name}`}
          onClick={() => onDelete(item.id)}
        >
          ×
        </button>
      </div>

      <PersonSelector
        people={people}
        selectedIds={item.assignedTo}
        onToggle={(personId) => onToggleAssignment(item.id, personId)}
        onSelectEveryone={() => onSelectEveryone(item.id)}
      />

      {isUnassigned ? (
        <p className="item-note warning">Unassigned — nobody is paying for this yet.</p>
      ) : (
        sharedBy > 1 && (
          <p className="item-note">
            {isEven ? "" : "about "}
            {formatCents(shares[sharedBy - 1])} each, split {sharedBy} ways
          </p>
        )
      )}
    </li>
  );
}

export default BillItem;
