# Split — Split-the-Bill Calculator

**Split the check, not the friendship.**

## Overview

Split is a single-page React application for dividing a restaurant bill fairly.
You add the people at your table, add what was ordered, tap who shared each
item, and enter the tax and tip percentages. Split works out what every person
owes — including their proportional share of tax and tip — and updates the
moment anything changes.

The interesting part is not the arithmetic but the bookkeeping: shared items
have to divide without losing a penny, tax and tip have to follow whoever
actually ordered the expensive things, and items nobody has claimed must never
be quietly charged to the group.

## Features

- **Add and remove people**, shown as chips with their initials. Blank and
  duplicate names are rejected with an inline message.
- **Add and delete items** with a name and price. Invalid or negative prices
  are caught before the item is added.
- **Assign any item to one person, several people, or everyone.** Assignments
  are editable after the fact — tap a name on an existing item and every total
  on the page updates immediately.
- **Tax and tip as percentages**, with 15/18/20/25% presets and a custom field.
  Both are charged on the food subtotal and shared out in proportion to what
  each person ordered.
- **Per-person cards** showing the amount owed, split into food, tax and tip,
  and expandable into a full receipt (`Fries (½) $6.00`).
- **Unassigned-item warning.** Money on an unclaimed item is reported — "⚠ $9.00
  of the bill still needs to be assigned" — instead of being folded into
  somebody's total.
- **Copy summary**, which puts a plain-text breakdown on the clipboard for a
  group chat, with "Copied!" confirmation.
- **Load example** to fill in a sample check, and **Start over**, which asks for
  confirmation before clearing anything.
- Responsive from roughly 375px to desktop.

## How to Run

Requires [Node.js](https://nodejs.org) 20.19+ or 22.12+ (what Vite 8 needs).

```bash
git clone <repository-url>
cd <project-folder>
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other commands:

```bash
npm run build    # production build into dist/
npm run preview  # serve that production build locally
npm run check    # run the calculation tests (Node's built-in test runner)
npm run lint     # oxlint
```

## How It Works

```
src/
  App.jsx                    holds the bill state and the functions that change it
  main.jsx                   mounts the app
  styles.css                 all of the styling
  components/
    Header.jsx               title, steps, Load example / Start over
    PeopleSection.jsx        the add-a-person form and the list of chips
    PersonChip.jsx           one person
    ItemsSection.jsx         the add-an-item form and the list of items
    BillItem.jsx             one item on the check
    PersonSelector.jsx       the row of name buttons ("who had this?")
    TaxTip.jsx               tax and tip percentages
    BillSummary.jsx          subtotal / tax / tip / total for the whole check
    PersonTotals.jsx         "Everyone owes" — the payoff section
    PersonTotalCard.jsx      one person's total, expandable into a receipt
  utils/
    calculations.js          all of the money math, with no React in it
    calculations.test.js     tests for that math
```

**`App.jsx` owns the bill.** Four pieces of state live there — `people`,
`items`, the tax rate and the tip rate — and nothing else stores a copy of
them.

**Data goes down through props.** `BillItem` receives the item it should draw
and the list of people who could be assigned to it. `PersonTotals` receives the
people, items and rates it needs to do its sums.

**Changes come back up through callback props.** A child component never edits
the bill directly; it calls a function its parent passed down, like
`onToggleAssignment(item.id, person.id)`. Those functions live in `App.jsx` and
call `setItems` / `setPeople` with a *new* array rather than modifying the old
one, because React re-renders based on whether a value has actually changed.

**Totals are derived, never stored.** There is no `personTotals` state. Every
render calls `calculatePersonTotals(people, items, taxRate, tipRate)` and draws
the result, so a total can't drift out of step with the items it came from.
That is why tapping a name on an item instantly changes four cards at the
bottom of the page: the state changed, React re-rendered, and the numbers were
recalculated from scratch.

**Components own only their own UI state.** The text currently typed into the
"add an item" form belongs to `ItemsSection`; whether a person's receipt is
expanded belongs to that `PersonTotalCard`. Neither is anybody else's business.

**Money is stored in whole cents.** `0.1 + 0.2` is `0.30000000000000004` in
JavaScript, and that kind of error surfaces as a total like `$19.999999`.
Prices are parsed into integer cents on the way in and formatted back into
dollars on the way out, so the rounding is controlled in exactly one place.

## My Contribution

I designed and built this application: the product idea, the interface, the
component structure, and the rules it follows — how shared items divide, how
tax and tip are distributed, and what happens to an item nobody has claimed.

I used an AI coding assistant during development to help with implementation
and debugging. I reviewed, tested and modified the generated code, and I made
the product and design decisions for the application. I can explain how any
part of it works.

## What I Learned

The hardest thing to get right was keeping item assignments and totals in step.
My first instinct was to store each person's total in state and update it
whenever something changed — but that meant every action (adding an item,
removing a person, nudging the tip) had to remember to touch the totals too,
and any path I forgot would leave the screen showing a stale number.

What worked was keeping people, items, tax and tip as the single source of
truth and calculating the totals from them on every render. The totals became
something the app *computes* rather than something it has to *maintain*, which
removed a whole category of bug.

The other thing I hadn't expected was rounding. Splitting $10.00 three ways
gives $3.333…, and three rounded shares come to $9.99 — a penny short of the
bill. I ended up doing all the arithmetic in whole cents and handing out the
leftover pennies deliberately: an even split gives them to the first people in
the list, and tax and tip go to whoever was rounded down hardest. The test in
`src/utils/calculations.test.js` checks the thing that actually matters — that
the individual totals always add back up to the bill total.

## References

- [React documentation](https://react.dev) — especially the guides on state,
  passing props to components, and updating arrays in state
- [Vite documentation](https://vite.dev) — project setup and scripts
- The project was started from Vite's `react` template (`npm create vite@latest`)
- [Node.js test runner](https://nodejs.org/api/test.html) for the calculation
  tests
- An AI coding assistant, used as described in **My Contribution**

No UI or state-management libraries are used — the dependencies are React,
React DOM, Vite and oxlint.
