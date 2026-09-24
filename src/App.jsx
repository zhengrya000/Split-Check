import { useState } from "react";

import BillSummary from "./components/BillSummary.jsx";
import Header from "./components/Header.jsx";
import ItemsSection from "./components/ItemsSection.jsx";
import PeopleSection from "./components/PeopleSection.jsx";
import PersonTotals from "./components/PersonTotals.jsx";
import TaxTip from "./components/TaxTip.jsx";
import { calculateBill, parseRate } from "./utils/calculations.js";

// Every person and item needs a stable id: React uses it as the list `key`,
// and items remember who they belong to by id rather than by name.
let nextId = 1;
function createId() {
  nextId += 1;
  return `id-${nextId}`;
}

/** The sample check from the README, behind the "Load example" button. */
function buildExample() {
  const alex = { id: createId(), name: "Alex" };
  const sam = { id: createId(), name: "Sam" };
  const jordan = { id: createId(), name: "Jordan" };
  const taylor = { id: createId(), name: "Taylor" };

  return {
    people: [alex, sam, jordan, taylor],
    items: [
      { id: createId(), name: "Burger", priceCents: 1600, assignedTo: [alex.id] },
      { id: createId(), name: "Burger", priceCents: 1600, assignedTo: [sam.id] },
      { id: createId(), name: "Steak", priceCents: 3200, assignedTo: [jordan.id] },
      { id: createId(), name: "Salad", priceCents: 1400, assignedTo: [taylor.id] },
      {
        id: createId(),
        name: "Fries",
        priceCents: 1200,
        assignedTo: [alex.id, sam.id],
      },
      {
        id: createId(),
        name: "Nachos",
        priceCents: 1800,
        assignedTo: [alex.id, sam.id, jordan.id, taylor.id],
      },
      {
        id: createId(),
        name: "Dessert",
        priceCents: 1100,
        assignedTo: [jordan.id, taylor.id],
      },
    ],
    taxInput: "8.5",
    tipInput: "20",
  };
}

function App() {
  // The whole bill lives here, in one place. Child components receive the
  // parts they need as props and send changes back through the callbacks
  // below — that way there is never a second copy of the truth to keep in sync.
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [taxInput, setTaxInput] = useState("8.5");
  const [tipInput, setTipInput] = useState("20");

  // Derived values: calculated on every render instead of being stored in
  // state, so the totals can never fall out of step with the items.
  const taxRate = parseRate(taxInput);
  const tipRate = parseRate(tipInput);
  const bill = calculateBill(items, taxRate, tipRate);
  const hasData = people.length > 0 || items.length > 0;

  function addPerson(name) {
    setPeople([...people, { id: createId(), name }]);
  }

  function removePerson(personId) {
    setPeople(people.filter((person) => person.id !== personId));

    // Take them off every item too, so no share is left pointing at somebody
    // who isn't at the table any more.
    setItems(
      items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((id) => id !== personId),
      })),
    );
  }

  function addItem(name, priceCents, assignedTo) {
    setItems([...items, { id: createId(), name, priceCents, assignedTo }]);
  }

  function deleteItem(itemId) {
    setItems(items.filter((item) => item.id !== itemId));
  }

  function togglePersonForItem(itemId, personId) {
    // Arrays and objects are replaced rather than edited in place. React only
    // re-renders when it sees a new value, so mutating `item.assignedTo`
    // directly would change the data without updating the screen.
    setItems(
      items.map((item) => {
        if (item.id !== itemId) return item;

        const isAssigned = item.assignedTo.includes(personId);
        return {
          ...item,
          assignedTo: isAssigned
            ? item.assignedTo.filter((id) => id !== personId)
            : [...item.assignedTo, personId],
        };
      }),
    );
  }

  function assignEveryone(itemId) {
    setItems(
      items.map((item) => {
        if (item.id !== itemId) return item;

        // Already on everyone? Then this click means "nobody".
        const everyone = people.map((person) => person.id);
        const hasEveryone = item.assignedTo.length === people.length;
        return { ...item, assignedTo: hasEveryone ? [] : everyone };
      }),
    );
  }

  function loadExample() {
    const example = buildExample();
    setPeople(example.people);
    setItems(example.items);
    setTaxInput(example.taxInput);
    setTipInput(example.tipInput);
  }

  function startOver() {
    setPeople([]);
    setItems([]);
    setTaxInput("");
    setTipInput("");
  }

  return (
    <div className="page">
      <Header
        hasData={hasData}
        onLoadExample={loadExample}
        onStartOver={startOver}
      />

      <PeopleSection
        people={people}
        onAddPerson={addPerson}
        onRemovePerson={removePerson}
      />

      <div className="columns">
        <ItemsSection
          items={items}
          people={people}
          onAddItem={addItem}
          onToggleAssignment={togglePersonForItem}
          onSelectEveryone={assignEveryone}
          onDeleteItem={deleteItem}
        />

        <div className="side-column">
          <BillSummary
            subtotalCents={bill.subtotalCents}
            taxCents={bill.taxCents}
            tipCents={bill.tipCents}
            totalCents={bill.totalCents}
            taxRate={taxRate}
            tipRate={tipRate}
          />
          <TaxTip
            taxInput={taxInput}
            onTaxChange={setTaxInput}
            tipInput={tipInput}
            onTipChange={setTipInput}
            taxCents={bill.taxCents}
            tipCents={bill.tipCents}
          />
        </div>
      </div>

      <PersonTotals
        people={people}
        items={items}
        taxRate={taxRate}
        tipRate={tipRate}
      />

      <footer className="footer">
        Built with React and Vite. Every amount is tracked in whole cents, so
        the individual totals always add back up to the bill.
      </footer>
    </div>
  );
}

export default App;
