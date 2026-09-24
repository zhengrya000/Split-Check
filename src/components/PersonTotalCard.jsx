import { useState } from "react";
import { fractionLabel, formatCents } from "../utils/calculations.js";

/**
 * What one person owes, with an expandable receipt underneath.
 *
 * Whether the receipt is open is purely a display detail, so it lives here as
 * local state rather than in App. The money all arrives through `person`.
 */
function PersonTotalCard({ person, isBiggest }) {
  const [showItems, setShowItems] = useState(false);
  const hasItems = person.lines.length > 0;

  return (
    <li className={isBiggest ? "total-card biggest" : "total-card"}>
      <div className="total-head">
        <span className="total-name">{person.name}</span>
        <span className="total-amount">{formatCents(person.totalCents)}</span>
      </div>

      {hasItems ? (
        <>
          <dl className="total-parts">
            <div>
              <dt>Food</dt>
              <dd>{formatCents(person.foodCents)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd>{formatCents(person.taxCents)}</dd>
            </div>
            <div>
              <dt>Tip</dt>
              <dd>{formatCents(person.tipCents)}</dd>
            </div>
          </dl>

          <button
            type="button"
            className="link-button"
            aria-expanded={showItems}
            onClick={() => setShowItems((open) => !open)}
          >
            {showItems
              ? "Hide items"
              : `Show ${person.lines.length} ${
                  person.lines.length === 1 ? "item" : "items"
                }`}
          </button>

          {showItems && (
            <ul className="receipt">
              {person.lines.map((line) => (
                <li key={line.itemId}>
                  <span>
                    {line.name}
                    {line.sharedBy > 1 && (
                      <span className="fraction">
                        {" "}
                        ({fractionLabel(line.sharedBy)})
                      </span>
                    )}
                  </span>
                  <span>{formatCents(line.shareCents)}</span>
                </li>
              ))}
              <li className="receipt-extra">
                <span>Tax</span>
                <span>{formatCents(person.taxCents)}</span>
              </li>
              <li className="receipt-extra">
                <span>Tip</span>
                <span>{formatCents(person.tipCents)}</span>
              </li>
            </ul>
          )}
        </>
      ) : (
        <p className="hint">Nothing assigned yet.</p>
      )}
    </li>
  );
}

export default PersonTotalCard;
