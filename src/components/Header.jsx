import { useState } from "react";

const STEPS = ["Add people", "Add items", "Tax & tip", "See who owes what"];

/**
 * Title, the four-step explanation of the app, and the two global actions.
 * "Start over" asks for confirmation first, but only when there is something
 * to lose — `hasData` comes down from App.
 */
function Header({ hasData, onLoadExample, onStartOver }) {
  const [confirming, setConfirming] = useState(false);

  function handleStartOver() {
    if (hasData && !confirming) {
      setConfirming(true);
      return;
    }
    onStartOver();
    setConfirming(false);
  }

  return (
    <header className="header">
      <div className="header-top">
        <div>
          <h1>Split</h1>
          <p className="tagline">Split the check, not the friendship.</p>
        </div>

        <div className="header-actions">
          <button type="button" className="ghost" onClick={onLoadExample}>
            Load example
          </button>
          <button type="button" className="ghost" onClick={handleStartOver}>
            Start over
          </button>
        </div>
      </div>

      {confirming && (
        <div className="confirm" role="alert">
          <span>Clear everyone, every item, and the tax and tip?</span>
          <button type="button" className="danger" onClick={handleStartOver}>
            Yes, clear it
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      )}

      <ol className="steps">
        {STEPS.map((step, index) => (
          <li key={step}>
            <span className="step-number">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </header>
  );
}

export default Header;
