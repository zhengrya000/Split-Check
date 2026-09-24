// All of the bill math lives here, away from the UI. Every function is pure:
// give it the same people and items and it returns the same numbers, which
// makes it easy to test (see calculations.test.js) and easy to reason about.
//
// Money is stored as a whole number of CENTS, never as dollars in a float.
// 0.1 + 0.2 === 0.30000000000000004 in JavaScript, and those tiny errors show
// up as totals like $19.999999. Integers can't drift.

/** "12.50" or "$12.50" -> 1250. Returns null for anything unusable. */
export function parsePriceToCents(input) {
  const cleaned = String(input).replace(/[$,\s]/g, "");
  if (cleaned === "") return null;

  // Digits with at most one decimal point. A leading "-" fails this test,
  // which is how negative prices get rejected.
  if (!/^\d*\.?\d*$/.test(cleaned)) return null;

  const dollars = Number(cleaned);
  if (!Number.isFinite(dollars) || dollars < 0) return null;

  return Math.round(dollars * 100);
}

/** 1250 -> "$12.50" */
export function formatCents(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  const dollars = Math.floor(abs / 100);
  const remainder = String(abs % 100).padStart(2, "0");
  return `${sign}$${dollars.toLocaleString()}.${remainder}`;
}

/** "8.5" -> 8.5, and anything that isn't a sensible percentage -> 0. */
export function parseRate(input) {
  const value = Number(String(input).replace(/[%\s]/g, ""));
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

/** A nice label for a shared item: 2 -> "½", 3 -> "⅓", 7 -> "1/7". */
export function fractionLabel(count) {
  const nice = { 2: "½", 3: "⅓", 4: "¼", 5: "⅕", 6: "⅙", 8: "⅛" };
  return nice[count] ?? `1/${count}`;
}

/**
 * Split one item's price between the people who shared it.
 *
 * $10.00 between 3 people is 334 / 333 / 333 — not 333.33 three times, which
 * would lose a penny. The leftover cents go to the first people in the list.
 * Arbitrary, but it has to land somewhere, and the shares always add back up
 * to the item's price.
 */
export function splitItem(priceCents, peopleCount) {
  if (peopleCount <= 0) return [];

  const base = Math.floor(priceCents / peopleCount);
  const leftover = priceCents - base * peopleCount;

  return Array.from(
    { length: peopleCount },
    (_, index) => base + (index < leftover ? 1 : 0),
  );
}

/** Adds up every item on the check. */
export function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + item.priceCents, 0);
}

/** Tax is a percentage of the food. */
export function calculateTax(subtotalCents, taxRate) {
  return Math.round((subtotalCents * taxRate) / 100);
}

/** Tip is a percentage of the food, before tax. */
export function calculateTip(subtotalCents, tipRate) {
  return Math.round((subtotalCents * tipRate) / 100);
}

/**
 * Hand out `totalCents` in proportion to `weights` — used for tax and tip, so
 * whoever ordered 40% of the food carries about 40% of each.
 *
 * Plain multiplication would leave pennies unaccounted for, so this floors
 * every share first and then gives the leftover cents to whoever was rounded
 * down the hardest (the "largest remainder" method). The shares always add
 * back up to exactly `totalCents`.
 */
export function distributeProportionally(totalCents, weights) {
  if (weights.length === 0) return [];

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum <= 0) return splitItem(totalCents, weights.length);

  const exact = weights.map((weight) => (totalCents * weight) / weightSum);
  const shares = exact.map((value) => Math.floor(value));
  let leftover = totalCents - shares.reduce((sum, share) => sum + share, 0);

  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; leftover > 0; i += 1) {
    shares[byRemainder[i].index] += 1;
    leftover -= 1;
  }

  return shares;
}

/** The whole check, assigned or not — what the restaurant is charging. */
export function calculateBill(items, taxRate, tipRate) {
  const subtotalCents = calculateSubtotal(items);
  const taxCents = calculateTax(subtotalCents, taxRate);
  const tipCents = calculateTip(subtotalCents, tipRate);

  return {
    subtotalCents,
    taxCents,
    tipCents,
    totalCents: subtotalCents + taxCents + tipCents,
  };
}

/**
 * Work out what each person owes.
 *
 * Items nobody has been assigned to are deliberately left out: they are
 * reported as `unassignedCents` so the UI can warn about them instead of
 * quietly charging them to the group.
 */
export function calculatePersonTotals(people, items, taxRate, tipRate) {
  // Ignore assignments pointing at people who have since been removed, so a
  // deleted person can never keep a share of an item.
  const peopleIds = new Set(people.map((person) => person.id));
  const cleaned = items.map((item) => ({
    ...item,
    assignedTo: item.assignedTo.filter((id) => peopleIds.has(id)),
  }));

  const unassignedItems = cleaned.filter((item) => item.assignedTo.length === 0);
  const assignedItems = cleaned.filter((item) => item.assignedTo.length > 0);

  // Start everyone with an empty receipt, then walk the items adding shares.
  const lines = new Map(people.map((person) => [person.id, []]));
  for (const item of assignedItems) {
    const shares = splitItem(item.priceCents, item.assignedTo.length);

    item.assignedTo.forEach((personId, index) => {
      lines.get(personId).push({
        itemId: item.id,
        name: item.name,
        shareCents: shares[index],
        sharedBy: item.assignedTo.length,
      });
    });
  }

  const foodByPerson = people.map((person) =>
    lines.get(person.id).reduce((sum, line) => sum + line.shareCents, 0),
  );

  // Tax and tip are charged on the food that has actually been claimed, then
  // split in proportion to how much of that food each person ordered.
  const assignedSubtotalCents = calculateSubtotal(assignedItems);
  const taxCents = calculateTax(assignedSubtotalCents, taxRate);
  const tipCents = calculateTip(assignedSubtotalCents, tipRate);
  const taxShares = distributeProportionally(taxCents, foodByPerson);
  const tipShares = distributeProportionally(tipCents, foodByPerson);

  const totals = people.map((person, index) => ({
    id: person.id,
    name: person.name,
    lines: lines.get(person.id),
    foodCents: foodByPerson[index],
    taxCents: taxShares[index] ?? 0,
    tipCents: tipShares[index] ?? 0,
    totalCents:
      foodByPerson[index] + (taxShares[index] ?? 0) + (tipShares[index] ?? 0),
  }));

  return {
    totals,
    unassignedItems,
    unassignedCents: calculateSubtotal(unassignedItems),
    assignedSubtotalCents,
    assignedTaxCents: taxCents,
    assignedTipCents: tipCents,
    allocatedTotalCents: assignedSubtotalCents + taxCents + tipCents,
  };
}
