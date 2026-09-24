import { formatCents } from "../utils/calculations.js";

/**
 * The whole check, assigned or not. Every number here is passed in as a prop —
 * App calculates them from its state, this component only displays them.
 */
function BillSummary({ subtotalCents, taxCents, tipCents, totalCents, taxRate, tipRate }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>Bill summary</h2>
      </div>

      <dl className="summary">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatCents(subtotalCents)}</dd>
        </div>
        <div>
          <dt>Tax {taxRate > 0 && <span className="rate-tag">{taxRate}%</span>}</dt>
          <dd>{formatCents(taxCents)}</dd>
        </div>
        <div>
          <dt>Tip {tipRate > 0 && <span className="rate-tag">{tipRate}%</span>}</dt>
          <dd>{formatCents(tipCents)}</dd>
        </div>
        <div className="summary-total">
          <dt>Total</dt>
          <dd>{formatCents(totalCents)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default BillSummary;
