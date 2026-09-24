// Checks on the bill math, run with `npm run check`.
// Uses Node's built-in test runner so the project needs no extra packages.
import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateBill,
  calculatePersonTotals,
  calculateSubtotal,
  distributeProportionally,
  formatCents,
  parsePriceToCents,
  parseRate,
  splitItem,
} from "./calculations.js";

// The sample check used during development.
const people = [
  { id: "p1", name: "Alex" },
  { id: "p2", name: "Sam" },
  { id: "p3", name: "Jordan" },
  { id: "p4", name: "Taylor" },
];

const items = [
  { id: "i1", name: "Burger", priceCents: 1600, assignedTo: ["p1"] },
  { id: "i2", name: "Burger", priceCents: 1600, assignedTo: ["p2"] },
  { id: "i3", name: "Steak", priceCents: 3200, assignedTo: ["p3"] },
  { id: "i4", name: "Salad", priceCents: 1400, assignedTo: ["p4"] },
  { id: "i5", name: "Fries", priceCents: 1200, assignedTo: ["p1", "p2"] },
  {
    id: "i6",
    name: "Nachos",
    priceCents: 1800,
    assignedTo: ["p1", "p2", "p3", "p4"],
  },
  { id: "i7", name: "Dessert", priceCents: 1100, assignedTo: ["p3", "p4"] },
];

test("prices are parsed the way people type them", () => {
  assert.equal(parsePriceToCents("12.50"), 1250);
  assert.equal(parsePriceToCents("$1,299.99"), 129999);
  assert.equal(parsePriceToCents("16"), 1600);
  assert.equal(parsePriceToCents("abc"), null);
  assert.equal(parsePriceToCents("-5"), null);
  assert.equal(parsePriceToCents(""), null);
});

test("cents are formatted back into dollars", () => {
  assert.equal(formatCents(1250), "$12.50");
  assert.equal(formatCents(5), "$0.05");
  assert.equal(formatCents(0), "$0.00");
  assert.equal(formatCents(123456), "$1,234.56");
});

test("bad tax and tip rates fall back to zero", () => {
  assert.equal(parseRate("8.5"), 8.5);
  assert.equal(parseRate("20%"), 20);
  assert.equal(parseRate("abc"), 0);
  assert.equal(parseRate("-5"), 0);
});

test("splitting an item never loses or invents a penny", () => {
  assert.deepEqual(splitItem(1000, 3), [334, 333, 333]);
  assert.deepEqual(splitItem(1200, 2), [600, 600]);
  assert.deepEqual(splitItem(1, 3), [1, 0, 0]);

  for (let price = 0; price < 200; price += 7) {
    for (let count = 1; count <= 6; count += 1) {
      const shares = splitItem(price, count);
      assert.equal(
        shares.reduce((a, b) => a + b, 0),
        price,
      );
    }
  }
});

test("tax and tip are shared out in proportion to what people ordered", () => {
  assert.deepEqual(distributeProportionally(300, [3000, 1000]), [225, 75]);
  // Nobody has ordered anything yet, so it splits evenly instead.
  assert.deepEqual(distributeProportionally(500, [0, 0]), [250, 250]);

  const shares = distributeProportionally(1000, [1, 1, 1]);
  assert.deepEqual(shares, [334, 333, 333]);
});

test("the sample check adds up", () => {
  const bill = calculateBill(items, 8.5, 20);
  assert.equal(bill.subtotalCents, 11900);
  assert.equal(bill.taxCents, 1012); // 8.5% of $119.00
  assert.equal(bill.tipCents, 2380); // 20% of $119.00
  assert.equal(bill.totalCents, 15292);

  const { totals, allocatedTotalCents } = calculatePersonTotals(
    people,
    items,
    8.5,
    20,
  );

  // Alex: $16 burger + half the $12 fries + a quarter of the $18 nachos.
  assert.equal(totals[0].foodCents, 2650);
  assert.equal(totals[2].foodCents, 4200); // Jordan ordered the steak

  // The whole point: the individual totals add up to the bill exactly.
  const sum = totals.reduce((total, person) => total + person.totalCents, 0);
  assert.equal(sum, allocatedTotalCents);
  assert.equal(sum, bill.totalCents);

  // Jordan ordered the most food, so Jordan carries the most tax and tip.
  assert.ok(totals[2].taxCents > totals[3].taxCents);
});

test("awkward numbers still add up to the total", () => {
  const three = [
    { id: "p1", name: "A" },
    { id: "p2", name: "B" },
    { id: "p3", name: "C" },
  ];
  const oddItems = [
    { id: "i1", name: "Pizza", priceCents: 2333, assignedTo: ["p1", "p2", "p3"] },
    { id: "i2", name: "Soda", priceCents: 499, assignedTo: ["p2"] },
  ];

  const { totals, allocatedTotalCents } = calculatePersonTotals(
    three,
    oddItems,
    8.875,
    18,
  );
  const sum = totals.reduce((total, person) => total + person.totalCents, 0);

  assert.equal(sum, allocatedTotalCents);
  assert.equal(allocatedTotalCents, calculateBill(oddItems, 8.875, 18).totalCents);
});

test("unassigned items are reported, not charged to the group", () => {
  const withOrphan = [
    { id: "i1", name: "Burger", priceCents: 1600, assignedTo: ["p1"] },
    { id: "i2", name: "Onion rings", priceCents: 800, assignedTo: [] },
  ];
  const result = calculatePersonTotals(people, withOrphan, 10, 0);

  assert.equal(result.unassignedCents, 800);
  assert.equal(result.unassignedItems.length, 1);
  assert.equal(result.assignedSubtotalCents, 1600);
  assert.equal(result.totals[0].totalCents, 1760); // $16 + 10% tax
  assert.equal(result.totals[1].totalCents, 0);
});

test("removing a person drops their share instead of stranding it", () => {
  const remaining = [{ id: "p1", name: "Alex" }];
  const shared = [
    { id: "i1", name: "Pizza", priceCents: 2400, assignedTo: ["p1", "gone"] },
  ];
  const result = calculatePersonTotals(remaining, shared, 0, 0);

  assert.equal(result.totals[0].totalCents, 2400);
  assert.equal(result.allocatedTotalCents, 2400);
});

test("an empty check produces zeros, not errors", () => {
  const result = calculatePersonTotals([], [], 8.5, 20);
  assert.equal(result.allocatedTotalCents, 0);
  assert.deepEqual(result.totals, []);
  assert.equal(calculateSubtotal([]), 0);
});
