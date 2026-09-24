import { useState } from "react";
import PersonTotalCard from "./PersonTotalCard.jsx";
import { calculatePersonTotals, formatCents } from "../utils/calculations.js";

/** The plain-text version of the split, for pasting into a group chat. */
function buildSummaryText(totals, allocatedTotalCents) {
  const lines = totals.map(
    (person) => `${person.name}: ${formatCents(person.totalCents)}`,
  );

  return [
    "Dinner Split",
    "",
    ...lines,
    "",
    `Total: ${formatCents(allocatedTotalCents)}`,
  ].join("\n");
}

/**
 * "Everyone owes" — the payoff.
 *
 * It takes the raw bill (people, items, tax rate, tip rate) as props and
 * calculates the totals during render. Nothing is stored: when App's state
 * changes, this runs again and the numbers can never be out of date.
 */
function PersonTotals({ people, items, taxRate, tipRate }) {
  const [copyStatus, setCopyStatus] = useState("");

  const { totals, unassignedCents, allocatedTotalCents } =
    calculatePersonTotals(people, items, taxRate, tipRate);

  const biggest = totals.reduce(
    (most, person) => Math.max(most, person.totalCents),
    0,
  );
  const isTie = totals.filter((p) => p.totalCents === biggest).length > 1;

  async function handleCopy() {
    const text = buildSummaryText(totals, allocatedTotalCents);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied!");
    } catch {
      // Clipboard access can be blocked (an insecure page, or a browser that
      // asks first), so say so rather than pretending it worked.
      setCopyStatus("Couldn't copy");
    }
    window.setTimeout(() => setCopyStatus(""), 2000);
  }

  if (people.length === 0 || items.length === 0) {
    return (
      <section className="card totals-card">
        <div className="card-head">
          <h2>Everyone owes</h2>
        </div>
        <div className="empty">
          <strong>Nothing to split yet.</strong>
          <span>
            {people.length === 0
              ? "Add the people at your table to get started."
              : "Add what everyone ordered and the totals will show up here."}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="card totals-card">
      <div className="card-head">
        <h2>Everyone owes</h2>
        <span className="badge">{formatCents(allocatedTotalCents)} split</span>
        <button type="button" className="ghost copy" onClick={handleCopy}>
          {copyStatus === "" ? "Copy summary" : copyStatus}
        </button>
      </div>

      {unassignedCents > 0 && (
        <p className="warning-banner" role="status">
          ⚠ {formatCents(unassignedCents)} of the bill still needs to be
          assigned, so it isn&apos;t in anyone&apos;s total yet.
        </p>
      )}

      <ul className="total-grid">
        {totals.map((person) => (
          <PersonTotalCard
            key={person.id}
            person={person}
            isBiggest={!isTie && biggest > 0 && person.totalCents === biggest}
          />
        ))}
      </ul>
    </section>
  );
}

export default PersonTotals;
