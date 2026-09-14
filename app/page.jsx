"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ============ Database Connection ============
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehayerqftgwwtazlqvjk.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_veDZ5P9omnjPQO5vGLwIIA_cwqQwCZu";
const supabase = createClient(supabaseUrl, supabaseKey);

// ============ constants ============
const FUEL_KEYS = ["petrol", "diesel", "cng"];
const FUEL_LABEL = { petrol: "Petrol", diesel: "Diesel", cng: "CNG" };
const FUEL_UNIT = { petrol: "L", diesel: "L", cng: "Kg" };
const FUEL_ACCENT = { petrol: "bg-emerald-600", diesel: "bg-amber-600", cng: "bg-sky-600" };
const STOCK_FUELS = ["petrol", "diesel"];
const DEFAULT_RATES = { petrol: 115.62, diesel: 100.66, cng: 101 };
const DEFAULT_EXPENSE_CATEGORIES = ["Diary / staff advance", "Tea & snacks", "Vehicle entry", "Electricity", "Salary", "Misc"];
const DEFAULT_CREDIT_SOURCES = ["Cash", "SBI", "BPCL", "Phonepe SBTF", "Phonepe Siddharth", "Card"];
const ADMIN_PASSCODE = "1234";

const CREDITORS_INITIAL = [
  { "account_number": "21192539001", "name": "100 DIAL", "id": "21192539001", "opening_balance": 764.75 },
  { "account_number": "21192539026", "name": "AADINATH TRANSPORT", "id": "21192539026", "opening_balance": 0 },
  { "account_number": "21192539011", "name": "ABHAI JI JOSHI", "id": "21192539011", "opening_balance": 438 },
  { "account_number": "21192539018", "name": "ABHAY JI", "id": "21192539018", "opening_balance": 453202.22 }
  // Note: Add back the remaining 146 creditors here from your master list
];

const inr = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const todayStr = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
};

const emptyDay = (rates) => ({
  fuel: { petrol: { volume: 0, rate: rates?.petrol || 115.62 }, diesel: { volume: 0, rate: rates?.diesel || 100.66 }, cng: { volume: 0, rate: rates?.cng || 101 } },
  collections: { cashMorning: 0, cashEvening: 0, phonepe: 0, creditCard: 0, otherOnline: 0 },
  expenses: [],
  creditEntries: [],
  paymentEntries: [],
  stock: { openingOverride: { petrol: null, diesel: null }, receiving: [] },
});

function computeStockLedger(days) {
  const dates = Object.keys(days).sort();
  const ledger = {};
  let prevClosing = { petrol: 0, diesel: 0 };
  for (const d of dates) {
    const day = days[d];
    const row = {};
    for (const fuel of STOCK_FUELS) {
      const override = day.stock?.openingOverride?.[fuel];
      const opening = override !== null && override !== undefined ? override : prevClosing[fuel];
      const received = (day.stock?.receiving || []).filter((r) => r.fuel === fuel).reduce((s, r) => s + (Number(r.quantity) || 0), 0);
      const sold = day.fuel?.[fuel]?.volume || 0;
      const closing = opening + received - sold;
      row[fuel] = { opening, received, sold, closing };
    }
    ledger[d] = row;
    prevClosing = { petrol: row.petrol.closing, diesel: row.diesel.closing };
  }
  return ledger;
}

// ============ shared UI ============
// UPDATED: More compact layout for mobile views
function NumberField({ label, value, onChange, prefix, suffix }) {
  return (
    <label className="block w-full">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-slate-900 focus-within:ring-1">
        {prefix && <span className="pl-2 text-slate-500 text-sm select-none">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full bg-transparent py-2 px-2 text-right text-base font-bold tabular-nums text-slate-900 outline-none"
        />
        {suffix && <span className="pr-2 text-slate-500 text-sm select-none">{suffix}</span>}
      </div>
    </label>
  );
}

function Card({ title, right, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 print:border-none print:p-0">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

function CustomerPicker({ value, onChange, creditors }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    if (!query) return creditors.slice(0, 30);
    const q = query.toLowerCase();
    return creditors.filter((c) => c.name.toLowerCase().includes(q) || c.account_number.includes(q)).slice(0, 30);
  }, [query, creditors]);

  return (
    <div className="relative">
      <input type="text" value={value ? `${value.name} · ${value.account_number}` : query} onChange={(e) => { setQuery(e.target.value); onChange(null); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={`Search ${creditors.length} customers...`} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900" />
      {open && !value && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => { onChange(c); setQuery(""); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0">
              <span className="font-bold text-sm text-slate-900">{c.name}</span>
              <span className="text-xs text-slate-500">{c.account_number}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Sales tab ============
function SalesTab({ day, update, currentRates, setRate, creditGivenToday, paymentsReceivedToday, onGoToCredit }) {
  const totalRevenue = useMemo(() => FUEL_KEYS.reduce((sum, k) => sum + day.fuel[k].volume * day.fuel[k].rate, 0), [day.fuel]);
  const cashTotal = day.collections.cashMorning + day.collections.cashEvening;
  const totalCollected = cashTotal + day.collections.phonepe + day.collections.creditCard + day.collections.otherOnline;
  const totalExpenses = day.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const accountedFor = totalCollected + creditGivenToday + totalExpenses;
  const diff = Math.round((totalRevenue - accountedFor) * 100) / 100;
  const balanced = Math.abs(diff) < 1;

  const updateVolume = (key, val) => update({ fuel: { ...day.fuel, [key]: { ...day.fuel[key], volume: val } } });
  const updateRate = (key, val) => { update({ fuel: { ...day.fuel, [key]: { ...day.fuel[key], rate: val } } }); setRate(key, val); };
  const updateCollection = (key, val) => update({ collections: { ...day.collections, [key]: val } });
  const addExpense = () => update({ expenses: [...day.expenses, { id: Date.now(), category: (typeof window !== "undefined" && window.__expenseCategories) ? window.__expenseCategories[0] : "Misc", amount: 0, remarks: "" }] });
  const updateExpense = (id, field, val) => update({ expenses: day.expenses.map((e) => (e.id === id ? { ...e, [field]: val } : e)) });
  const removeExpense = (id) => update({ expenses: day.expenses.filter((e) => e.id !== id) });

  return (
    <div className="space-y-4">
      <Card title="Fuel sales">
        <div className="space-y-3">
          {FUEL_KEYS.map((k) => (
            <div key={k} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${FUEL_ACCENT[k]}`} />
                <span className="text-sm font-bold text-slate-900">{FUEL_LABEL[k]}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><NumberField label={`Vol (${FUEL_UNIT[k]})`} value={day.fuel[k].volume} onChange={(v) => updateVolume(k, v)} /></div>
                <div className="flex-1"><NumberField label="Rate" prefix="₹" value={day.fuel[k].rate} onChange={(v) => updateRate(k, v)} /></div>
              </div>
              <p className="mt-1 text-right text-xs font-semibold text-slate-500">Amt: <span className="text-slate-900">{inr(day.fuel[k].volume * day.fuel[k].rate)}</span></p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Collections">
        <div className="flex gap-2">
          <div className="flex-1"><NumberField label="Morning Cash" prefix="₹" value={day.collections.cashMorning} onChange={(v) => updateCollection("cashMorning", v)} /></div>
          <div className="flex-1"><NumberField label="Evening Cash" prefix="₹" value={day.collections.cashEvening} onChange={(v) => updateCollection("cashEvening", v)} /></div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1"><NumberField label="PhonePe" prefix="₹" value={day.collections.phonepe} onChange={(v) => updateCollection("phonepe", v)} /></div>
          <div className="flex-1"><NumberField label="Card" prefix="₹" value={day.collections.creditCard} onChange={(v) => updateCollection("creditCard", v)} /></div>
        </div>
        <div className="mt-3">
          <NumberField label="Other online (BPCL / UFILL etc.)" prefix="₹" value={day.collections.otherOnline} onChange={(v) => updateCollection("otherOnline", v)} />
        </div>
      </Card>

      <Card title="Credit & Payments (Quick View)" right={<button onClick={onGoToCredit} className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-md">Log New</button>}>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-slate-50 p-2 text-center border border-slate-100"><p className="text-[10px] uppercase font-bold text-slate-500">Given</p><p className="font-bold text-slate-900">{inr(creditGivenToday)}</p></div>
          <div className="flex-1 rounded-lg bg-emerald-50 p-2 text-center border border-emerald-100"><p className="text-[10px] uppercase font-bold text-emerald-700">Received</p><p className="font-bold text-emerald-900">{inr(paymentsReceivedToday)}</p></div>
        </div>
      </Card>

      <Card title="Expenses">
        <div className="space-y-2">
          {day.expenses.map((e) => (
            <div key={e.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="flex items-center gap-2 mb-2">
                <select value={e.category} onChange={(ev) => updateExpense(e.id, "category", ev.target.value)} className="flex-1 rounded border border-slate-300 px-1 py-1 text-xs font-bold text-slate-900">
                  {(typeof window !== "undefined" && window.__expenseCategories ? window.__expenseCategories : DEFAULT_EXPENSE_CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => removeExpense(e.id)} className="text-xs text-red-500 font-bold px-2">✕</button>
              </div>
              <div className="flex gap-2">
                <div className="w-1/3"><NumberField label="Amt" value={e.amount} onChange={(v) => updateExpense(e.id, "amount", v)} /></div>
                <div className="w-2/3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">Remarks</span>
                  <input type="text" value={e.remarks} onChange={(ev) => updateExpense(e.id, "remarks", ev.target.value)} className="w-full rounded-lg border border-slate-300 py-2 px-2 text-sm font-semibold outline-none focus:border-slate-900" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addExpense} className="mt-2 w-full rounded-lg border-2 border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">+ Add Expense</button>
      </Card>

      <section className={`rounded-xl border p-3 shadow-sm ${balanced ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
        <div className="flex justify-between text-xs font-bold text-slate-600"><span>Collections + Credit + Exp</span><span>{inr(accountedFor)}</span></div>
        <div className="mt-1 flex justify-between text-xs font-bold text-slate-600"><span>Total Revenue</span><span>{inr(totalRevenue)}</span></div>
        <div className="mt-2 border-t border-black/10 pt-2 text-sm font-black">
          {balanced ? <span className="text-emerald-700">Balanced ✓</span> : diff > 0 ? <span className="text-amber-700">{inr(diff)} short</span> : <span className="text-amber-700">{inr(Math.abs(diff))} extra</span>}
        </div>
      </section>
    </div>
  );
}

// ============ Credit tab ============
function CreditTab({ day, update, currentRates, balances, creditors }) {
  const [mode, setMode] = useState("give");
  const [customer, setCustomer] = useState(null);
  const [fuelType, setFuelType] = useState("diesel");
  const [quantity, setQuantity] = useState(0);
  const [rate, setRate] = useState(currentRates.diesel);
  const [remarks, setRemarks] = useState("");
  
  const [payCustomer, setPayCustomer] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [paySource, setPaySource] = useState(typeof window !== "undefined" && window.__creditSources ? window.__creditSources[0] : "Cash");
  const [payRemarks, setPayRemarks] = useState("");

  const addCreditEntry = () => {
    update({ creditEntries: [{ id: Date.now(), customerName: customer.name, accountNumber: customer.account_number, fuelType, quantity, rate, amount: quantity * rate, remarks }, ...day.creditEntries] });
    setCustomer(null); setQuantity(0); setRemarks("");
  };

  const addPayment = () => {
    update({ paymentEntries: [{ id: Date.now(), customerName: payCustomer.name, accountNumber: payCustomer.account_number, amount: payAmount, source: paySource, remarks: payRemarks }, ...day.paymentEntries] });
    setPayCustomer(null); setPayAmount(0); setPayRemarks("");
  };

  return (
    <div className="space-y-4">
      <div className="flex p-1 bg-slate-200 rounded-lg">
        <button onClick={() => setMode("give")} className={`flex-1 rounded-md py-2 text-xs font-bold ${mode === "give" ? "bg-white shadow" : "text-slate-600"}`}>Give Credit</button>
        <button onClick={() => setMode("receive")} className={`flex-1 rounded-md py-2 text-xs font-bold ${mode === "receive" ? "bg-white shadow" : "text-slate-600"}`}>Receive Payment</button>
      </div>

      {mode === "give" ? (
        <Card title="Log New Credit">
          <CustomerPicker value={customer} onChange={setCustomer} creditors={creditors} />
          {customer && <p className="mt-1 text-xs font-bold text-sky-700">Balance: {inr(balances[customer.account_number] ?? 0)}</p>}
          
          <div className="mt-3 flex gap-2">
             {FUEL_KEYS.map(k => <button key={k} onClick={() => { setFuelType(k); setRate(currentRates[k]); }} className={`flex-1 py-1.5 text-xs font-bold rounded border ${fuelType === k ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600'}`}>{FUEL_LABEL[k]}</button>)}
          </div>
          <div className="mt-3 flex gap-2">
            <NumberField label="Qty" value={quantity} onChange={setQuantity} />
            <NumberField label="Rate" value={rate} onChange={setRate} />
          </div>
          <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Remarks" className="mt-3 w-full border rounded p-2 text-sm font-semibold outline-none focus:border-slate-900" />
          <button onClick={addCreditEntry} disabled={!customer || quantity <= 0} className="mt-3 w-full bg-slate-900 text-white font-bold py-3 rounded-lg disabled:opacity-50">Save Entry: {inr(quantity * rate)}</button>
        </Card>
      ) : (
        <Card title="Log Payment Received">
          <CustomerPicker value={payCustomer} onChange={setPayCustomer} creditors={creditors} />
          {payCustomer && <p className="mt-1 text-xs font-bold text-sky-700">Balance: {inr(balances[payCustomer.account_number] ?? 0)}</p>}
          
          <div className="mt-3 flex gap-2">
            <div className="flex-1"><NumberField label="Amount" value={payAmount} onChange={setPayAmount} /></div>
            <div className="flex-1">
               <span className="block text-xs font-semibold text-slate-500 mb-1">Source</span>
               <select value={paySource} onChange={e => setPaySource(e.target.value)} className="w-full border rounded-lg p-2 text-sm font-bold bg-white outline-none">
                 {(typeof window !== "undefined" && window.__creditSources ? window.__creditSources : DEFAULT_CREDIT_SOURCES).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
          </div>
          <input type="text" value={payRemarks} onChange={e => setPayRemarks(e.target.value)} placeholder="Remarks" className="mt-3 w-full border rounded p-2 text-sm font-semibold outline-none focus:border-slate-900" />
          <button onClick={addPayment} disabled={!payCustomer || payAmount <= 0} className="mt-3 w-full bg-emerald-600 text-white font-bold py-3 rounded-lg disabled:opacity-50">Save Payment</button>
        </Card>
      )}
      
      <Card title={mode === "give" ? "Today's Credit Given" : "Today's Payments"}>
         <ul className="divide-y text-sm">
           {(mode === "give" ? day.creditEntries : day.paymentEntries).map(e => (
             <li key={e.id} className="py-2 flex justify-between items-center">
                <div><p className="font-bold text-slate-900">{e.customerName}</p><p className="text-xs text-slate-500">{mode === 'give' ? `${e.quantity}L @ ₹${e.rate}` : e.source}</p></div>
                <div className="flex gap-3 items-center">
                  <span className={`font-black ${mode === 'give' ? 'text-slate-900' : 'text-emerald-700'}`}>{inr(e.amount)}</span>
                  <button onClick={() => mode === 'give' ? update({ creditEntries: day.creditEntries.filter(x => x.id !== e.id)}) : update({ paymentEntries: day.paymentEntries.filter(x => x.id !== e.id)})} className="text-red-500 font-bold">✕</button>
                </div>
             </li>
           ))}
         </ul>
      </Card>
    </div>
  );
}

// ============ Stock tab ============
function StockTab({ day, update, ledgerRow, hasPreviousDay }) {
  const [fuel, setFuel] = useState("diesel");
  const [quantity, setQuantity] = useState(0);

  return (
    <div className="space-y-4">
      <Card title="Stock Status">
         <div className="flex gap-2">
            {STOCK_FUELS.map(k => (
              <div key={k} className="flex-1 border rounded-lg p-2 bg-slate-50">
                 <p className="font-bold text-slate-800 flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${FUEL_ACCENT[k]}`}></span>{FUEL_LABEL[k]}</p>
                 <div className="mt-2 text-xs font-semibold text-slate-500 space-y-1">
                   <div className="flex justify-between"><span>Open:</span><span className="text-slate-900">{ledgerRow[k].opening.toFixed(2)}</span></div>
                   <div className="flex justify-between"><span>Recv:</span><span className="text-slate-900">{ledgerRow[k].received.toFixed(2)}</span></div>
                   <div className="flex justify-between"><span>Sold:</span><span className="text-slate-900">{ledgerRow[k].sold.toFixed(2)}</span></div>
                 </div>
                 <div className="mt-2 bg-slate-900 text-white rounded p-1 text-center">
                   <p className="text-[10px]">Closing</p><p className="font-black">{ledgerRow[k].closing.toFixed(2)}</p>
                 </div>
              </div>
            ))}
         </div>
      </Card>

      <Card title="Log Fuel Received">
        <div className="flex gap-2 mb-3">
          {STOCK_FUELS.map(k => <button key={k} onClick={() => setFuel(k)} className={`flex-1 py-1.5 text-xs font-bold rounded border ${fuel === k ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{FUEL_LABEL[k]}</button>)}
        </div>
        <NumberField label="Volume Received (L)" value={quantity} onChange={setQuantity} />
        <button onClick={() => { update({ stock: { ...day.stock, receiving: [{ id: Date.now(), fuel, quantity }, ...day.stock.receiving] }}); setQuantity(0); }} disabled={quantity <= 0} className="mt-3 w-full bg-slate-900 text-white font-bold py-3 rounded-lg disabled:opacity-50">Add to Stock</button>
      </Card>
    </div>
  );
}

// ============ Report tab ============
// UPDATED: High contrast fonts & strict print CSS for single page
function ReportTab({ currentDate, day, ledgerRow, balances, creditors }) {
  const totalRevenue = FUEL_KEYS.reduce((s, k) => s + day.fuel[k].volume * day.fuel[k].rate, 0);
  const totalCollected = day.collections.cashMorning + day.collections.cashEvening + day.collections.phonepe + day.collections.creditCard + day.collections.otherOnline;
  const totalExpenses = day.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const creditGivenToday = day.creditEntries.reduce((s, e) => s + e.amount, 0);
  const paymentsReceivedToday = day.paymentEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden">
        <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-bold text-sm">🖨️ Print / Save PDF</button>
      </div>

      {/* Strict print styling added here */}
      <div id="report-content" className="bg-white p-4 rounded-xl border print:border-none print:p-0 print:text-[11px] print:m-0 w-full">
        <div className="text-center mb-4">
          <h1 className="text-xl font-black text-slate-900 uppercase">Shree Balaji Tirupati Fuels</h1>
          <p className="font-bold text-slate-600">Daily Operations Report: {currentDate}</p>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-slate-100 p-2 rounded text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Revenue</p><p className="font-black text-slate-900 text-base">{inr(totalRevenue)}</p></div>
          <div className="flex-1 bg-slate-100 p-2 rounded text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Collected</p><p className="font-black text-slate-900 text-base">{inr(totalCollected)}</p></div>
          <div className="flex-1 bg-slate-100 p-2 rounded text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Expenses</p><p className="font-black text-slate-900 text-base">{inr(totalExpenses)}</p></div>
        </div>

        <div className="mb-4 print:break-inside-avoid">
          <h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Fuel Sales</h2>
          <table className="w-full text-left mt-2">
            <thead><tr className="bg-slate-200 text-slate-900 text-xs"><th className="p-1">Fuel</th><th className="p-1">Vol</th><th className="p-1">Rate</th><th className="p-1 text-right">Amount</th></tr></thead>
            <tbody className="text-sm">
              {FUEL_KEYS.map(k => (
                <tr key={k} className="border-b"><td className="p-1 font-bold">{FUEL_LABEL[k]}</td><td className="p-1 font-black text-slate-900">{day.fuel[k].volume}</td><td className="p-1 font-bold text-slate-900">{day.fuel[k].rate}</td><td className="p-1 text-right font-black text-slate-900">{inr(day.fuel[k].volume * day.fuel[k].rate)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-4 print:break-inside-avoid">
           <h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Collections</h2>
           <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs font-bold text-slate-800">
             <div className="flex justify-between"><span>Morning Cash:</span><span className="font-black text-slate-900">{inr(day.collections.cashMorning)}</span></div>
             <div className="flex justify-between"><span>Evening Cash:</span><span className="font-black text-slate-900">{inr(day.collections.cashEvening)}</span></div>
             <div className="flex justify-between"><span>PhonePe:</span><span className="font-black text-slate-900">{inr(day.collections.phonepe)}</span></div>
             <div className="flex justify-between"><span>Card:</span><span className="font-black text-slate-900">{inr(day.collections.creditCard)}</span></div>
             <div className="flex justify-between"><span>Other:</span><span className="font-black text-slate-900">{inr(day.collections.otherOnline)}</span></div>
             <div className="flex justify-between bg-slate-200 px-1 rounded"><span>Total:</span><span className="font-black text-slate-900">{inr(totalCollected)}</span></div>
           </div>
        </div>

        <div className="mb-4 print:break-inside-avoid">
          <h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Stock Updates</h2>
          <table className="w-full text-left mt-2">
            <thead><tr className="bg-slate-200 text-slate-900 text-[10px] uppercase"><th className="p-1">Fuel</th><th className="p-1">Open</th><th className="p-1">Recv</th><th className="p-1">Sold</th><th className="p-1 font-black">Close</th></tr></thead>
            <tbody className="text-xs">
              {STOCK_FUELS.map(k => (
                <tr key={k} className="border-b"><td className="p-1 font-bold">{FUEL_LABEL[k]}</td><td className="p-1 font-bold text-slate-900">{ledgerRow[k].opening.toFixed(2)}</td><td className="p-1 font-bold text-slate-900">{ledgerRow[k].received.toFixed(2)}</td><td className="p-1 font-bold text-slate-900">{ledgerRow[k].sold.toFixed(2)}</td><td className="p-1 font-black text-slate-900">{ledgerRow[k].closing.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {(day.creditEntries.length > 0 || day.paymentEntries.length > 0) && (
          <div className="mb-4 print:break-inside-avoid">
             <h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Credit & Payments Log</h2>
             <table className="w-full text-left mt-2 text-xs">
               <thead><tr className="bg-slate-200 text-slate-900"><th className="p-1">Customer</th><th className="p-1">Type</th><th className="p-1 text-right">Amount</th></tr></thead>
               <tbody>
                 {day.creditEntries.map(e => <tr key={e.id} className="border-b"><td className="p-1 font-bold text-slate-900">{e.customerName}</td><td className="p-1 text-red-700 font-bold">Given</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
                 {day.paymentEntries.map(e => <tr key={e.id} className="border-b"><td className="p-1 font-bold text-slate-900">{e.customerName}</td><td className="p-1 text-emerald-700 font-bold">Received</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
               </tbody>
             </table>
          </div>
        )}

      </div>
    </div>
  );
}

// ============ Analytics tab ============
function AnalyticsTab({ days, creditors, balances }) {
  const topByBalance = useMemo(() => creditors.map(c => ({ ...c, balance: balances[c.account_number] ?? 0 })).sort((a, b) => b.balance - a.balance).slice(0, 10), [creditors, balances]);

  return (
    <div className="space-y-4">
      <Card title="Outstanding Credit Top 10">
        <ul className="divide-y text-sm">
          {topByBalance.map(c => (
            <li key={c.account_number} className="py-2 flex justify-between">
               <span className="font-bold text-slate-800">{c.name}</span>
               <span className="font-black text-red-600">{inr(c.balance)}</span>
            </li>
          ))}
        </ul>
      </Card>
      {/* Note: Further filtering features can be built here in subsequent iterations */}
    </div>
  );
}

// ============ Admin tab ============
function AdminTab({ days, currentRates, setRate }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");

  if (!unlocked) {
    return (
      <Card title="Admin Lock">
        <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Passcode" className="w-full border rounded-lg p-3 outline-none" />
        <button onClick={() => passcode === ADMIN_PASSCODE && setUnlocked(true)} className="mt-3 w-full bg-slate-900 text-white font-bold py-3 rounded-lg">Unlock</button>
      </Card>
    );
  }

  // UPDATED: Export logic to grab raw JSON and turn it into a CSV dump
  const exportData = () => {
    let csv = "Date,Revenue,MorningCash,EveningCash,PhonePe,Card,TotalCollected,CreditGiven,PaymentsReceived,TotalExpenses\n";
    Object.keys(days).sort().forEach(date => {
       const d = days[date];
       const rev = FUEL_KEYS.reduce((s, k) => s + d.fuel[k].volume * d.fuel[k].rate, 0);
       const coll = d.collections.cashMorning + d.collections.cashEvening + d.collections.phonepe + d.collections.creditCard + d.collections.otherOnline;
       const cg = d.creditEntries.reduce((s, e) => s + e.amount, 0);
       const pr = d.paymentEntries.reduce((s, e) => s + e.amount, 0);
       const exp = d.expenses.reduce((s, e) => s + Number(e.amount), 0);
       csv += `${date},${rev},${d.collections.cashMorning},${d.collections.cashEvening},${d.collections.phonepe},${d.collections.creditCard},${coll},${cg},${pr},${exp}\n`;
    });
    
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = `SBTF_Data_Dump_${todayStr()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <Card title="Fuel Rates">
         <div className="flex gap-2">
            <div className="flex-1"><NumberField label="Petrol" value={currentRates.petrol} onChange={v => setRate('petrol', v)} /></div>
            <div className="flex-1"><NumberField label="Diesel" value={currentRates.diesel} onChange={v => setRate('diesel', v)} /></div>
            <div className="flex-1"><NumberField label="CNG" value={currentRates.cng} onChange={v => setRate('cng', v)} /></div>
         </div>
      </Card>
      <Card title="Data Management">
         <button onClick={exportData} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg">📥 Download CSV Summary</button>
      </Card>
    </div>
  );
}

// ============ App Core ============
export default function App() {
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(todayStr());
  const [currentRates, setCurrentRates] = useState(DEFAULT_RATES);
  const [days, setDays] = useState({});
  const [tab, setTab] = useState("sales");
  const [creditors, setCreditors] = useState([]);
  
  // UPDATED: Security state for editing past records
  const [pastDateUnlocked, setPastDateUnlocked] = useState(false);
  const [pastPasscode, setPastPasscode] = useState("");

  const updateDB = async (column, value) => await supabase.from('station_data').update({ [column]: value }).eq('id', 1);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('station_data').select('*').eq('id', 1).single();
      if (data) {
        if (data.days) setDays(data.days);
        if (data.current_rates) setCurrentRates(data.current_rates);
        if (data.creditors && data.creditors.length > 0) setCreditors(data.creditors);
        else { updateDB('creditors', CREDITORS_INITIAL); setCreditors(CREDITORS_INITIAL); }
      }
      setIsDbLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!isDbLoading) {
      setDays((prev) => {
        if (prev[currentDate]) return prev;
        const newDays = { ...prev, [currentDate]: emptyDay(currentRates) };
        updateDB('days', newDays);
        return newDays;
      });
      // Lock screen logic when date changes
      if (currentDate !== todayStr()) setPastDateUnlocked(false);
    }
  }, [currentDate, currentRates, isDbLoading]);

  const update = (patch) => {
    setDays((prev) => {
      const newDays = { ...prev, [currentDate]: { ...(prev[currentDate] || emptyDay(currentRates)), ...patch } };
      updateDB('days', newDays);
      return newDays;
    });
  };

  const handleSetRate = (fuelKey, val) => {
    setCurrentRates((prev) => {
      const next = { ...prev, [fuelKey]: val };
      updateDB('current_rates', next);
      return next;
    });
  };

  const day = days[currentDate] || emptyDay(currentRates);
  const ledger = useMemo(() => computeStockLedger(days), [days]);
  const ledgerRow = ledger[currentDate] || { petrol: { opening: 0, received: 0, sold: 0, closing: 0 }, diesel: { opening: 0, received: 0, sold: 0, closing: 0 } };
  const hasPreviousDay = Object.keys(days).sort().indexOf(currentDate) > 0;
  
  const balances = useMemo(() => {
    const map = {};
    creditors.forEach((c) => (map[c.account_number] = c.opening_balance));
    Object.values(days).forEach((d) => {
      (d.creditEntries || []).forEach(e => map[e.accountNumber] = (map[e.accountNumber] ?? 0) + e.amount);
      (d.paymentEntries || []).forEach(e => map[e.accountNumber] = (map[e.accountNumber] ?? 0) - e.amount);
    });
    return map;
  }, [days, creditors]);

  if (isDbLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-slate-500 font-bold animate-pulse">Syncing with Cloud...</p></div>;
  }

  // UPDATED: Admin lock check for past dates
  const isPastDate = currentDate !== todayStr();
  const requiresUnlock = isPastDate && !pastDateUnlocked && ["sales", "credit", "stock"].includes(tab);

  const TABS = [
    { key: "sales", label: "Sales" },
    { key: "credit", label: "Credit" },
    { key: "stock", label: "Stock" },
    { key: "report", label: "Report" },
    { key: "analytics", label: "Analytics" },
    { key: "admin", label: "Admin" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm print:hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase text-slate-900">SBTF Operations</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Cloud Synced
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-900">{TABS.find((t) => t.key === tab)?.label}</h1>
          <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className={`rounded-md border p-1 text-sm font-bold shadow-sm outline-none ${isPastDate ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 bg-white'}`} />
        </div>
      </header>

      <main className="mx-auto max-w-md p-3">
        {requiresUnlock ? (
            <Card title="Past Date Editing Locked">
               <p className="text-xs text-slate-500 mb-3 font-semibold">Editing historical data ({currentDate}) requires administrative authentication to prevent accidental changes.</p>
               <input type="password" placeholder="Passcode" value={pastPasscode} onChange={e => setPastPasscode(e.target.value)} className="w-full border rounded-lg p-3 outline-none mb-3 font-bold text-center" />
               <button onClick={() => { if (pastPasscode === ADMIN_PASSCODE) { setPastDateUnlocked(true); setPastPasscode(''); } }} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg">Authenticate to Edit</button>
            </Card>
        ) : (
          <>
            {tab === "sales" && <SalesTab day={day} update={update} currentRates={currentRates} setRate={handleSetRate} creditGivenToday={day.creditEntries.reduce((s,e)=>s+e.amount,0)} paymentsReceivedToday={day.paymentEntries.reduce((s,e)=>s+e.amount,0)} onGoToCredit={() => setTab("credit")} />}
            {tab === "credit" && <CreditTab day={day} update={update} currentRates={currentRates} balances={balances} creditors={creditors} />}
            {tab === "stock" && <StockTab day={day} update={update} ledgerRow={ledgerRow} hasPreviousDay={hasPreviousDay} />}
            {tab === "report" && <ReportTab currentDate={currentDate} day={day} ledgerRow={ledgerRow} balances={balances} creditors={creditors} />}
            {tab === "analytics" && <AnalyticsTab days={days} creditors={creditors} balances={balances} />}
            {tab === "admin" && <AdminTab days={days} currentRates={currentRates} setRate={handleSetRate} />}
          </>
        )}
      </main>

      {/* UPDATED: Larger bottom navigation for better mobile tapping */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white shadow-[0_-10px_10px_-5px_rgba(0,0,0,0.05)] print:hidden">
        <div className="mx-auto grid max-w-md grid-cols-6 text-xs">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`py-4 text-center font-bold transition-colors ${tab === t.key ? "text-slate-900 border-t-2 border-slate-900 bg-slate-50" : "text-slate-400 hover:text-slate-600"}`}>{t.label}</button>
          ))}
        </div>
      </nav>
    </div>
  );
}