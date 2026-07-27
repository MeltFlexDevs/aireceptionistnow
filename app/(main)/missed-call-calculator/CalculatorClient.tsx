"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useAuthDialog } from "@/app/components/AuthDialog";
import {
  MISSED_CALL_DEFAULTS,
  calculateMissedCallLoss,
  type MissedCallInputs,
} from "@/lib/marketing/missed-call";

// All formatting pins "en-US" explicitly. This component server-renders before
// hydrating, and a locale-dependent toLocaleString would format differently on
// the two passes and blow up as a hydration mismatch.
const eur = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mcc-control">
      <div className="mcc-control-top">
        <label htmlFor={`mcc-${label}`}>{label}</label>
        <span className="mcc-control-val">
          {num.format(value)}
          {suffix}
        </span>
      </div>
      <input
        id={`mcc-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function CalculatorClient() {
  const [input, setInput] = useState<MissedCallInputs>(MISSED_CALL_DEFAULTS);
  const { open } = useAuthDialog();

  const set = <K extends keyof MissedCallInputs>(key: K) => (value: number) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const r = useMemo(() => calculateMissedCallLoss(input), [input]);

  const paysForItself = r.netMonthlyGain > 0;

  return (
    <div className="mcc">
      <div className="mcc-grid">
        <div className="mcc-inputs">
          <div className="mcc-panel-label">Your numbers</div>

          <Slider
            label="Calls per month"
            value={input.callsPerMonth}
            min={20}
            max={2000}
            step={10}
            suffix=""
            onChange={set("callsPerMonth")}
          />
          <Slider
            label="Share you miss"
            value={input.missedPct}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={set("missedPct")}
          />
          <Slider
            label="Calls that are new customers"
            value={input.newCustomerPct}
            min={0}
            max={100}
            step={5}
            suffix="%"
            onChange={set("newCustomerPct")}
          />
          <Slider
            label="Of those, how many book"
            value={input.bookingRate}
            min={0}
            max={100}
            step={5}
            suffix="%"
            onChange={set("bookingRate")}
          />

          <div className="mcc-control">
            <div className="mcc-control-top">
              <label htmlFor="mcc-value">What one new customer is worth</label>
            </div>
            <div className="mcc-money-input">
              <span aria-hidden="true">&euro;</span>
              <input
                id="mcc-value"
                type="number"
                min={0}
                step={25}
                value={input.avgCustomerValue}
                onChange={(e) => set("avgCustomerValue")(Number(e.target.value))}
              />
            </div>
            <p className="mcc-hint">
              Use lifetime value if customers come back, not just the first sale.
            </p>
          </div>

          <details className="mcc-assumptions">
            <summary>Assumptions</summary>
            <Slider
              label="Missed callers who never ring back"
              value={input.noCallbackPct}
              min={0}
              max={100}
              step={5}
              suffix="%"
              onChange={set("noCallbackPct")}
            />
            <Slider
              label="Missed calls an AI would actually convert"
              value={input.recoveryRate}
              min={0}
              max={100}
              step={5}
              suffix="%"
              onChange={set("recoveryRate")}
            />
            <p className="mcc-hint">
              Both default deliberately low. An AI answers every call, but it
              will not close every one a good human would have. Plan sizing
              assumes a 4-minute average call.
            </p>
          </details>
        </div>

        <div className="mcc-results">
          <div className="mcc-headline">
            <div className="mcc-headline-label">Revenue you lose a year</div>
            <div className="mcc-headline-value">{eur.format(r.annualLoss)}</div>
            <div className="mcc-headline-sub">
              {eur.format(r.monthlyLoss)} a month &middot;{" "}
              {num1.format(r.lostCustomers)} customers
            </div>
          </div>

          <div className="mcc-chain">
            <div className="mcc-chain-label">How that number is built</div>
            <ol>
              <li>
                <span>{num.format(input.callsPerMonth)}</span> calls a month
              </li>
              <li>
                <span>{num.format(r.missedCalls)}</span> go unanswered
              </li>
              <li>
                <span>{num.format(r.missedNewCustomerCalls)}</span> of those were
                new customers
              </li>
              <li>
                <span>{num1.format(r.lostForever)}</span> never ring back
              </li>
              <li>
                <span>{num1.format(r.lostCustomers)}</span> would have bought, at{" "}
                {eur.format(input.avgCustomerValue)} each
              </li>
            </ol>
          </div>

          <div className="mcc-payback">
            <div className="mcc-chain-label">What it costs to stop</div>
            <div className="mcc-payback-row">
              <span>{r.planName} plan</span>
              <strong>{eur.format(r.planMonthlyCost)}/mo</strong>
            </div>
            <div className="mcc-payback-row">
              <span>Recovered at {input.recoveryRate}%</span>
              <strong>{eur.format(r.recoveredRevenue)}/mo</strong>
            </div>
            <div
              className={`mcc-payback-row mcc-payback-net${
                paysForItself ? " mcc-payback-net--good" : ""
              }`}
            >
              <span>Net a month</span>
              <strong>
                {r.netMonthlyGain >= 0 ? "+" : "-"}
                {eur.format(Math.abs(r.netMonthlyGain))}
              </strong>
            </div>

            {r.breakEvenCustomers > 0 && (
              <p className="mcc-breakeven">
                It pays for itself at{" "}
                <strong>
                  {r.breakEvenCustomers} recovered customer
                  {r.breakEvenCustomers === 1 ? "" : "s"} a month
                </strong>
                . That figure ignores every assumption above - it is only the
                plan price divided by what a customer is worth to you.
              </p>
            )}
          </div>

          <div className="mcc-cta">
            <button type="button" onClick={() => open("signup")} className="mcc-btn">
              Answer these calls &rarr;
            </button>
            <Link href="/pricing" className="mcc-btn mcc-btn--outline">
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
