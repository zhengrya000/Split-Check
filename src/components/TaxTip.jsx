import { formatCents } from "../utils/calculations.js";

const TIP_PRESETS = [15, 18, 20, 25];

/**
 * Tax and tip, both entered as percentages. The inputs are controlled: their
 * value comes from App's state and every keystroke goes back up through
 * `onTaxChange` / `onTipChange`, so there is only ever one copy of the truth.
 */
function TaxTip({
  taxInput,
  onTaxChange,
  tipInput,
  onTipChange,
  taxCents,
  tipCents,
}) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>Tax &amp; tip</h2>
      </div>

      <div className="rate-row">
        <label htmlFor="tax-rate">Tax</label>
        <div className="rate-input">
          <input
            id="tax-rate"
            type="text"
            inputMode="decimal"
            value={taxInput}
            placeholder="0"
            onChange={(event) => onTaxChange(event.target.value)}
          />
          <span className="percent">%</span>
        </div>
        <span className="rate-amount">{formatCents(taxCents)}</span>
      </div>

      <div className="rate-row">
        <label htmlFor="tip-rate">Tip</label>
        <div className="rate-input">
          <input
            id="tip-rate"
            type="text"
            inputMode="decimal"
            value={tipInput}
            placeholder="0"
            onChange={(event) => onTipChange(event.target.value)}
          />
          <span className="percent">%</span>
        </div>
        <span className="rate-amount">{formatCents(tipCents)}</span>
      </div>

      <div className="presets">
        {TIP_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className={
              tipInput === String(preset) ? "toggle on" : "toggle"
            }
            aria-pressed={tipInput === String(preset)}
            onClick={() => onTipChange(String(preset))}
          >
            {preset}%
          </button>
        ))}
      </div>

      <p className="note">
        Both are worked out from the food subtotal and shared in proportion to
        what each person ordered — order 40% of the food, cover about 40% of
        the tax and tip.
      </p>
    </section>
  );
}

export default TaxTip;
