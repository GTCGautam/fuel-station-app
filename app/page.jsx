"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ============ Database Connection ============
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehayerqftgwwtazlqvjk.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_veDZ5P9omnjPQO5vGLwIIA_cwqQwCZu";
const supabase = createClient(supabaseUrl, supabaseKey);

// ============ Constants ============
const FUEL_KEYS = ["petrol", "diesel", "cng"];
const FUEL_LABEL = { petrol: "Petrol", diesel: "Diesel", cng: "CNG" };
const FUEL_UNIT = { petrol: "L", diesel: "L", cng: "Kg" };
const FUEL_ACCENT = { petrol: "bg-emerald-600", diesel: "bg-amber-600", cng: "bg-sky-600" };
const STOCK_FUELS = ["petrol", "diesel"];
const DEFAULT_RATES = { petrol: 115.62, diesel: 100.66, cng: 101 };
const DEFAULT_EXPENSE_CATEGORIES = ["Diary / staff advance", "Tea & snacks", "Vehicle entry", "Electricity", "Salary", "Misc"];
const DEFAULT_CREDIT_SOURCES = ["Cash", "SBI", "BPCL", "Phonepe SBTF", "Phonepe Siddharth", "Card"];
const ADMIN_PASSCODE = "1234";

const TABS = [
  { key: "sales", label: "Sales" },
  { key: "credit", label: "Credit" },
  { key: "stock", label: "Stock" },
  { key: "ledger", label: "Ledger" },
  { key: "report", label: "Report" },
  { key: "analytics", label: "Stats" },
  { key: "admin", label: "Admin" },
];

const CREDITORS_INITIAL = [
  { "account_number": "21192539001", "name": "100 DIAL", "id": "21192539001", "opening_balance": 765 },
  { "account_number": "21192539002", "name": "MS Latent Landinfra", "id": "21192539002", "opening_balance": 47 },
  { "account_number": "21192539003", "name": "BOI LDM 1463", "id": "21192539003", "opening_balance": 77735 },
  { "account_number": "21192539004", "name": "CEO SUSNER", "id": "21192539004", "opening_balance": 63411 }
  // Note: Keep your real 150+ customer list here in production!
];

const inr = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const todayStr = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().slice(0, 10);
};

const emptyDay = (rates) => ({
  fuel: { petrol: { volume: 0, rate: rates?.petrol || 115.62 }, diesel: { volume: 0, rate: rates?.diesel || 100.66 }, cng: { volume: 0, rate: rates?.cng || 101 } },
  collections: { cashMorning: 0, cashEvening: 0, phonepe: 0, creditCard: 0, otherOnline: 0 },
  expenses: [],
  diary: [], 
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

// ============ Shared UI Components ============
function NumberField({ label, value, onChange, prefix, suffix, disabled }) {
  return (
    <label className="block w-full">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
      <div className={`flex items-center rounded-lg border border-slate-300 focus-within:border-slate-900 focus-within:ring-1 ${disabled ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
        {prefix && <span className="pl-2 text-slate-500 text-sm select-none">{prefix}</span>}
        <input type="number" inputMode="decimal" disabled={disabled} value={value === 0 ? "" : value} placeholder="0" onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className="w-full bg-transparent py-2 px-2 text-right text-base font-bold tabular-nums text-slate-900 outline-none disabled:cursor-not-allowed" />
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

function CustomerPicker({ value, onChange, creditors, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    if (!query) return creditors.slice(0, 30);
    const q = query.toLowerCase();
    return creditors.filter((c) => c.name.toLowerCase().includes(q) || c.account_number.includes(q)).slice(0, 30);
  }, [query, creditors]);

  return (
    <div className="relative">
      <input type="text" disabled={disabled} value={value ? `${value.name} · ${value.account_number}` : query} onChange={(e) => { setQuery(e.target.value); onChange(null); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={`Search ${creditors.length} customers...`} className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-900 ${disabled ? 'bg-slate-100 opacity-70 cursor-not-allowed' : 'bg-white'}`} />
      {open && !value && !disabled && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => { onChange(c); setQuery(""); setOpen(false); }} className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0">
              <span className="font-bold text-sm text-slate-900">{c.name}</span><span className="text-xs text-slate-500">{c.account_number}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Sales Tab ============
function SalesTab({ day, update, currentRates, setRate, creditGivenToday, paymentsReceivedToday, onGoToCredit, isReadOnly }) {
  const totalRevenue = useMemo(() => FUEL_KEYS.reduce((sum, k) => sum + day.fuel[k].volume * day.fuel[k].rate, 0), [day.fuel]);
  const totalCollected = day.collections.cashMorning + day.collections.cashEvening + day.collections.phonepe + day.collections.creditCard + day.collections.otherOnline;
  
  const pureExpenses = (day.expenses || []).filter(e => !e.category.toLowerCase().includes('diary'));
  const legacyDiary = (day.expenses || []).filter(e => e.category.toLowerCase().includes('diary'));
  
  const totalActualExpenses = pureExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalDiary = (day.diary || []).reduce((s, d) => s + (Number(d.amount) || 0), 0) + legacyDiary.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  
  const accountedFor = totalCollected + creditGivenToday + totalActualExpenses + totalDiary;
  const diff = Math.round((totalRevenue - accountedFor) * 100) / 100;
  const balanced = Math.abs(diff) < 1;

  return (
    <div className="space-y-4">
      <Card title="Fuel sales">
        <div className="space-y-3">
          {FUEL_KEYS.map((k) => (
            <div key={k} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div className="mb-1.5 flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${FUEL_ACCENT[k]}`} /><span className="text-sm font-bold text-slate-900">{FUEL_LABEL[k]}</span></div>
              <div className="flex gap-2">
                <div className="flex-1"><NumberField disabled={isReadOnly} label={`Vol (${FUEL_UNIT[k]})`} value={day.fuel[k].volume} onChange={(v) => update({ fuel: { ...day.fuel, [k]: { ...day.fuel[k], volume: v } } })} /></div>
                <div className="flex-1"><NumberField disabled={isReadOnly} label="Rate" prefix="₹" value={day.fuel[k].rate} onChange={(v) => { update({ fuel: { ...day.fuel, [k]: { ...day.fuel[k], rate: v } } }); setRate(k, v); }} /></div>
              </div>
              <p className="mt-1 text-right text-xs font-semibold text-slate-500">Amt: <span className="text-slate-900">{inr(day.fuel[k].volume * day.fuel[k].rate)}</span></p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Collections">
        <div className="flex gap-2">
          <div className="flex-1"><NumberField disabled={isReadOnly} label="Morning Cash" prefix="₹" value={day.collections.cashMorning} onChange={(v) => update({ collections: { ...day.collections, cashMorning: v } })} /></div>
          <div className="flex-1"><NumberField disabled={isReadOnly} label="Evening Cash" prefix="₹" value={day.collections.cashEvening} onChange={(v) => update({ collections: { ...day.collections, cashEvening: v } })} /></div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1"><NumberField disabled={isReadOnly} label="PhonePe" prefix="₹" value={day.collections.phonepe} onChange={(v) => update({ collections: { ...day.collections, phonepe: v } })} /></div>
          <div className="flex-1"><NumberField disabled={isReadOnly} label="Card" prefix="₹" value={day.collections.creditCard} onChange={(v) => update({ collections: { ...day.collections, creditCard: v } })} /></div>
        </div>
        <div className="mt-3"><NumberField disabled={isReadOnly} label="Other online" prefix="₹" value={day.collections.otherOnline} onChange={(v) => update({ collections: { ...day.collections, otherOnline: v } })} /></div>
      </Card>

      <Card title="Credit & Payments (Quick View)" right={<button onClick={onGoToCredit} className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-md">View details</button>}>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-slate-50 p-2 text-center border border-slate-100"><p className="text-[10px] uppercase font-bold text-slate-500">Given</p><p className="font-bold text-slate-900">{inr(creditGivenToday)}</p></div>
          <div className="flex-1 rounded-lg bg-emerald-50 p-2 text-center border border-emerald-100"><p className="text-[10px] uppercase font-bold text-emerald-700">Received</p><p className="font-bold text-emerald-900">{inr(paymentsReceivedToday)}</p></div>
        </div>
      </Card>

      <Card title="Diary (Bulk Cash Deposits)">
        <p className="text-[10px] text-slate-500 mb-2">Use this to log bulk cash transfers or deposits, separate from regular expenses.</p>
        <div className="space-y-2">
          {legacyDiary.map((e) => (
             <div key={e.id} className="rounded-lg border border-slate-200 bg-blue-50 p-2">
                <p className="text-[10px] font-bold text-blue-700 mb-1">Legacy {e.category}</p>
                <div className="flex gap-2">
                  <div className="w-1/3"><NumberField disabled={isReadOnly} label="Amt" value={e.amount} onChange={(v) => update({ expenses: day.expenses.map((x) => (x.id === e.id ? { ...x, amount: v } : x)) })} /></div>
                  <div className="w-2/3">
                    <span className="mb-1 block text-xs font-semibold text-slate-500">Remarks</span>
                    <input type="text" disabled={isReadOnly} value={e.remarks} onChange={(ev) => update({ expenses: day.expenses.map((x) => (x.id === e.id ? { ...x, remarks: ev.target.value } : x)) })} className="w-full rounded-lg border border-slate-300 py-2 px-2 text-sm font-semibold outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:opacity-70" />
                  </div>
                </div>
             </div>
          ))}
          {(day.diary || []).map((d) => (
            <div key={d.id} className="flex gap-2 items-center rounded-lg border border-slate-200 bg-blue-50 p-2">
              <div className="w-1/3"><NumberField disabled={isReadOnly} label="Amount" value={d.amount} onChange={(v) => update({ diary: (day.diary || []).map((x) => (x.id === d.id ? { ...x, amount: v } : x)) })} /></div>
              <div className="w-2/3">
                <span className="mb-1 block text-xs font-semibold text-slate-500">Remarks / Person</span>
                <input type="text" disabled={isReadOnly} value={d.remarks} onChange={(ev) => update({ diary: (day.diary || []).map((x) => (x.id === d.id ? { ...x, remarks: ev.target.value } : x)) })} className="w-full rounded-lg border border-slate-300 py-2 px-2 text-sm font-semibold outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:opacity-70" />
              </div>
              {!isReadOnly && <button onClick={() => update({ diary: (day.diary || []).filter((x) => x.id !== d.id) })} className="text-xs text-red-500 font-bold px-2">✕</button>}
            </div>
          ))}
        </div>
        {!isReadOnly && <button onClick={() => update({ diary: [...(day.diary || []), { id: Date.now(), amount: 0, remarks: "" }] })} className="mt-2 w-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">+ Add Diary Deposit</button>}
      </Card>

      <Card title="Regular Expenses">
        <div className="space-y-2">
          {pureExpenses.map((e) => (
            <div key={e.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="flex items-center gap-2 mb-2">
                <select disabled={isReadOnly} value={e.category} onChange={(ev) => update({ expenses: day.expenses.map((x) => (x.id === e.id ? { ...x, category: ev.target.value } : x)) })} className="flex-1 rounded border border-slate-300 px-1 py-1 text-xs font-bold text-slate-900 disabled:opacity-70">
                  {(typeof window !== "undefined" && window.__expenseCategories ? window.__expenseCategories : DEFAULT_EXPENSE_CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {!isReadOnly && <button onClick={() => update({ expenses: day.expenses.filter((x) => x.id !== e.id) })} className="text-xs text-red-500 font-bold px-2">✕</button>}
              </div>
              <div className="flex gap-2">
                <div className="w-1/3"><NumberField disabled={isReadOnly} label="Amt" value={e.amount} onChange={(v) => update({ expenses: day.expenses.map((x) => (x.id === e.id ? { ...x, amount: v } : x)) })} /></div>
                <div className="w-2/3">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">Remarks</span>
                  <input type="text" disabled={isReadOnly} value={e.remarks} onChange={(ev) => update({ expenses: day.expenses.map((x) => (x.id === e.id ? { ...x, remarks: ev.target.value } : x)) })} className="w-full rounded-lg border border-slate-300 py-2 px-2 text-sm font-semibold outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:opacity-70" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!isReadOnly && <button onClick={() => update({ expenses: [...day.expenses, { id: Date.now(), category: (typeof window !== "undefined" && window.__expenseCategories) ? window.__expenseCategories[0] : "Misc", amount: 0, remarks: "" }] })} className="mt-2 w-full rounded-lg border-2 border-dashed border-slate-300 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">+ Add Expense</button>}
      </Card>
      
      <section className={`rounded-xl border p-3 shadow-sm ${Math.abs(diff) < 1 ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
        <div className="flex justify-between text-xs font-bold text-slate-600"><span>Colls + Credit + Exp + Diary</span><span>{inr(accountedFor)}</span></div>
        <div className="mt-1 flex justify-between text-xs font-bold text-slate-600"><span>Total Revenue</span><span>{inr(totalRevenue)}</span></div>
        <div className="mt-2 border-t border-black/10 pt-2 text-sm font-black">{Math.abs(diff) < 1 ? <span className="text-emerald-700">Balanced ✓</span> : diff > 0 ? <span className="text-amber-700">{inr(diff)} short</span> : <span className="text-amber-700">{inr(Math.abs(diff))} extra</span>}</div>
      </section>
    </div>
  );
}

// ============ Credit Tab ============
function CreditTab({ day, update, currentRates, balances, creditors, isReadOnly }) {
  const [mode, setMode] = useState("give");
  const [customer, setCustomer] = useState(null);
  const [fuelType, setFuelType] = useState("diesel");
  const [isManualRate, setIsManualRate] = useState(false);
  const [manualRate, setManualRate] = useState(0);
  const rate = isManualRate ? manualRate : currentRates[fuelType];
  const [quantity, setQuantity] = useState(0);
  const [remarks, setRemarks] = useState("");
  
  const [payCustomer, setPayCustomer] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [paySource, setPaySource] = useState(typeof window !== "undefined" && window.__creditSources ? window.__creditSources[0] : "Cash");
  const [payRemarks, setPayRemarks] = useState("");

  const addCreditEntry = () => { update({ creditEntries: [{ id: Date.now(), customerName: customer.name, accountNumber: customer.account_number, fuelType, quantity, rate, amount: quantity * rate, remarks }, ...day.creditEntries] }); setCustomer(null); setQuantity(0); setRemarks(""); setIsManualRate(false); };
  const addPayment = () => { update({ paymentEntries: [{ id: Date.now(), customerName: payCustomer.name, accountNumber: payCustomer.account_number, amount: payAmount, source: paySource, remarks: payRemarks }, ...day.paymentEntries] }); setPayCustomer(null); setPayAmount(0); setPayRemarks(""); };

  return (
    <div className="space-y-4">
      <div className="flex p-1 bg-slate-200 rounded-lg">
        <button onClick={() => setMode("give")} className={`flex-1 rounded-md py-2 text-xs font-bold ${mode === "give" ? "bg-white shadow" : "text-slate-600"}`}>Give Credit</button>
        <button onClick={() => setMode("receive")} className={`flex-1 rounded-md py-2 text-xs font-bold ${mode === "receive" ? "bg-white shadow" : "text-slate-600"}`}>Receive Payment</button>
      </div>

      {mode === "give" ? (
        <Card title="Log New Credit">
          <CustomerPicker disabled={isReadOnly} value={customer} onChange={setCustomer} creditors={creditors} />
          {customer && <p className="mt-1 text-xs font-bold text-sky-700">Balance: {inr(balances[customer.account_number] ?? 0)}</p>}
          <div className="mt-3 flex gap-2">
             {FUEL_KEYS.map(k => <button key={k} disabled={isReadOnly} onClick={() => { setFuelType(k); setIsManualRate(false); }} className={`flex-1 py-1.5 text-xs font-bold rounded border disabled:opacity-50 ${fuelType === k ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600'}`}>{FUEL_LABEL[k]}</button>)}
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1"><NumberField disabled={isReadOnly} label="Qty" value={quantity} onChange={setQuantity} /></div>
            <div className="flex-1"><NumberField disabled={isReadOnly} label="Rate" value={rate} onChange={(v) => { setManualRate(v); setIsManualRate(true); }} /></div>
          </div>
          <input disabled={isReadOnly} type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Remarks" className="mt-3 w-full border rounded p-2 text-sm font-semibold outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:opacity-70" />
          {!isReadOnly && <button onClick={addCreditEntry} disabled={!customer || quantity <= 0} className="mt-3 w-full bg-slate-900 text-white font-bold py-3 rounded-lg disabled:opacity-50">Save Entry: {inr(quantity * rate)}</button>}
        </Card>
      ) : (
        <Card title="Log Payment Received">
          <CustomerPicker disabled={isReadOnly} value={payCustomer} onChange={setPayCustomer} creditors={creditors} />
          {payCustomer && <p className="mt-1 text-xs font-bold text-sky-700">Balance: {inr(balances[payCustomer.account_number] ?? 0)}</p>}
          <div className="mt-3 flex gap-2">
            <div className="flex-1"><NumberField disabled={isReadOnly} label="Amount" value={payAmount} onChange={setPayAmount} /></div>
            <div className="flex-1">
               <span className="block text-xs font-semibold text-slate-500 mb-1">Source</span>
               <select disabled={isReadOnly} value={paySource} onChange={e => setPaySource(e.target.value)} className="w-full border rounded-lg p-2 text-sm font-bold bg-white outline-none disabled:bg-slate-100 disabled:opacity-70">
                 {(typeof window !== "undefined" && window.__creditSources ? window.__creditSources : DEFAULT_CREDIT_SOURCES).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>
          </div>
          <input disabled={isReadOnly} type="text" value={payRemarks} onChange={e => setPayRemarks(e.target.value)} placeholder="Remarks" className="mt-3 w-full border rounded p-2 text-sm font-semibold outline-none focus:border-slate-900 disabled:bg-slate-100 disabled:opacity-70" />
          {!isReadOnly && <button onClick={addPayment} disabled={!payCustomer || payAmount <= 0} className="mt-3 w-full bg-emerald-600 text-white font-bold py-3 rounded-lg disabled:opacity-50">Save Payment</button>}
        </Card>
      )}
      
      <Card title={mode === "give" ? "Today's Credit Given" : "Today's Payments"}>
         <ul className="divide-y text-sm">
           {(mode === "give" ? day.creditEntries : day.paymentEntries).map(e => (
             <li key={e.id} className="py-2 flex justify-between items-center">
                <div>
                   <p className="font-bold text-slate-900">{e.customerName}</p>
                   <p className="text-xs text-slate-500">{mode === 'give' ? `${e.quantity}L @ ₹${e.rate}` : e.source}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <span className={`font-black ${mode === 'give' ? 'text-slate-900' : 'text-emerald-700'}`}>{inr(e.amount)}</span>
                  {!isReadOnly && <button onClick={() => mode === 'give' ? update({ creditEntries: day.creditEntries.filter(x => x.id !== e.id)}) : update({ paymentEntries: day.paymentEntries.filter(x => x.id !== e.id)})} className="text-red-500 font-bold">✕</button>}
                </div>
             </li>
           ))}
         </ul>
      </Card>
    </div>
  );
}

// ============ Stock Tab ============
function StockTab({ day, update, ledgerRow, hasPreviousDay, isReadOnly }) {
  const [fuel, setFuel] = useState("diesel");
  const [quantity, setQuantity] = useState(0);
  return (
    <div className="space-y-4">
      <Card title="Stock Status (Edit Opening to Override)">
         <div className="flex gap-2">
            {STOCK_FUELS.map(k => (
              <div key={k} className="flex-1 border rounded-lg p-2 bg-slate-50">
                 <p className="font-bold text-slate-800 flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${FUEL_ACCENT[k]}`}></span>{FUEL_LABEL[k]}</p>
                 <div className="mt-2 text-xs font-semibold text-slate-500 space-y-2">
                   <div className="flex justify-between items-center">
                      <span>Open:</span>
                      <input type="number" disabled={isReadOnly} value={day.stock?.openingOverride?.[k] !== null && day.stock?.openingOverride?.[k] !== undefined ? day.stock.openingOverride[k] : ""} placeholder={ledgerRow[k].opening.toFixed(2)}
                        onChange={(e) => { const val = e.target.value; update({ stock: { ...day.stock, openingOverride: { ...day.stock?.openingOverride, [k]: val === "" ? null : Number(val) } } }); }}
                        className="w-16 border border-slate-300 rounded px-1 py-0.5 text-right font-bold text-slate-900 bg-white outline-none focus:border-slate-900 disabled:opacity-50 disabled:bg-slate-100"
                      />
                   </div>
                   <div className="flex justify-between"><span>Recv:</span><span className="text-slate-900">{ledgerRow[k].received.toFixed(2)}</span></div>
                   <div className="flex justify-between"><span>Sold:</span><span className="text-slate-900">{ledgerRow[k].sold.toFixed(2)}</span></div>
                 </div>
                 <div className="mt-2 bg-slate-900 text-white rounded p-1 text-center"><p className="text-[10px]">Closing</p><p className="font-black">{ledgerRow[k].closing.toFixed(2)}</p></div>
              </div>
            ))}
         </div>
      </Card>
      <Card title="Log Fuel Received">
        <div className="flex gap-2 mb-3">{STOCK_FUELS.map(k => <button key={k} disabled={isReadOnly} onClick={() => setFuel(k)} className={`flex-1 py-1.5 text-xs font-bold rounded border disabled:opacity-50 ${fuel === k ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{FUEL_LABEL[k]}</button>)}</div>
        <NumberField disabled={isReadOnly} label="Volume Received (L)" value={quantity} onChange={setQuantity} />
        {!isReadOnly && <button onClick={() => { update({ stock: { ...day.stock, receiving: [{ id: Date.now(), fuel, quantity }, ...(day.stock?.receiving || [])] }}); setQuantity(0); }} disabled={quantity <= 0} className="mt-3 w-full bg-slate-900 text-white font-bold py-3 rounded-lg disabled:opacity-50">Add to Stock</button>}
      </Card>
    </div>
  );
}

// ============ Ledger Tab ============
function LedgerTab({ days, creditors, balances }) {
  const [customer, setCustomer] = useState(null);
  const [filter, setFilter] = useState("30");
  const [showDetails, setShowDetails] = useState(false);

  // Global Ledger Export PDF function
  const printAllDebtors = () => {
     const nonZero = creditors.map(c => ({...c, balance: balances[c.account_number] || 0}))
                              .filter(c => c.balance !== 0)
                              .sort((a,b) => b.balance - a.balance);
     const total = nonZero.reduce((s, c) => s + c.balance, 0);
     const html = `
       <html><head><title>Credit as on ${todayStr()}</title>
       <style>
         body { font-family: sans-serif; padding: 20px; font-size: 12px;}
         table { width: 100%; border-collapse: collapse; margin-top: 10px; }
         th, td { border: 1px solid #000; padding: 6px; text-align: left; }
         th { background-color: #e2e8f0; }
         .right { text-align: right; }
         .title { text-align: center; margin-bottom: 20px; }
       </style>
       </head><body>
       <div class="title">
         <h2>Shree Balaji Tirupati Fuels</h2>
         <h3>Credit Balance Ledger</h3>
         <p><strong>As on:</strong> ${todayStr()}</p>
       </div>
       <table>
         <tr><th>S.No</th><th>Customer Name</th><th>Account Number</th><th class="right">Net Due (₹)</th></tr>
         ${nonZero.map((c, i) => `<tr><td>${i+1}</td><td>${c.name}</td><td>${c.account_number}</td><td class="right">${c.balance.toLocaleString('en-IN', {maximumFractionDigits:0})}</td></tr>`).join('')}
         <tr><th colspan="3" class="right">Total Outstanding Debt</th><th class="right">${total.toLocaleString('en-IN', {maximumFractionDigits:0})}</th></tr>
       </table>
       <script>window.onload = () => window.print();</script>
       </body></html>
     `;
     const win = window.open('', '_blank');
     win.document.write(html);
     win.document.close();
  };

  const allDates = Object.keys(days).sort();
  const cutoffDate = useMemo(() => {
    if (filter === "all") return "2000-01-01";
    const d = new Date(); d.setDate(d.getDate() - parseInt(filter));
    return d.toISOString().slice(0, 10);
  }, [filter]);

  const transactions = useMemo(() => {
    if (!customer) return [];
    const txs = [];
    allDates.forEach(date => {
      const d = days[date];
      (d.creditEntries || []).forEach(e => { if (e.accountNumber === customer.account_number) txs.push({ date, type: 'credit', ...e }); });
      (d.paymentEntries || []).forEach(e => { if (e.accountNumber === customer.account_number) txs.push({ date, type: 'payment', ...e }); });
    });
    return txs; 
  }, [customer, days, allDates]);

  const summary = useMemo(() => {
    if (!customer) return null;
    let openingBal = customer.opening_balance || 0;
    let creditGiven = 0, paymentsRecv = 0;
    transactions.forEach(tx => {
      if (tx.date < cutoffDate) { if (tx.type === 'credit') openingBal += tx.amount; if (tx.type === 'payment') openingBal -= tx.amount; } 
      else { if (tx.type === 'credit') creditGiven += tx.amount; if (tx.type === 'payment') paymentsRecv += tx.amount; }
    });
    return { openingBal, creditGiven, paymentsRecv, closingBal: openingBal + creditGiven - paymentsRecv };
  }, [customer, transactions, cutoffDate]);

  const visibleTxs = useMemo(() => transactions.filter(tx => tx.date >= cutoffDate).reverse(), [transactions, cutoffDate]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden mb-2">
         <button onClick={printAllDebtors} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-sm shadow">🖨️ Download All-Customer Credit PDF</button>
      </div>

      <Card title="Customer Account Search"><CustomerPicker value={customer} onChange={(c) => { setCustomer(c); setShowDetails(false); }} creditors={creditors} /></Card>
      
      {customer && (
        <>
          <div className="flex p-1 bg-slate-200 rounded-lg">
            <button onClick={() => setFilter("7")} className={`flex-1 rounded-md py-2 text-xs font-bold ${filter === "7" ? "bg-white shadow" : "text-slate-600"}`}>Last 7 Days</button>
            <button onClick={() => setFilter("30")} className={`flex-1 rounded-md py-2 text-xs font-bold ${filter === "30" ? "bg-white shadow" : "text-slate-600"}`}>Last 30 Days</button>
            <button onClick={() => setFilter("all")} className={`flex-1 rounded-md py-2 text-xs font-bold ${filter === "all" ? "bg-white shadow" : "text-slate-600"}`}>All Time</button>
          </div>
          <Card title="Period Summary">
             <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-2 rounded border border-slate-100"><p className="text-[10px] uppercase font-bold text-slate-500">Opening Bal</p><p className="font-bold text-slate-900">{inr(summary.openingBal)}</p></div>
                <div className="bg-red-50 p-2 rounded border border-red-100"><p className="text-[10px] uppercase font-bold text-red-700">Credit Given</p><p className="font-bold text-slate-900">{inr(summary.creditGiven)}</p></div>
                <div className="bg-emerald-50 p-2 rounded border border-emerald-100"><p className="text-[10px] uppercase font-bold text-emerald-700">Payment Recv.</p><p className="font-bold text-slate-900">{inr(summary.paymentsRecv)}</p></div>
                <div className="bg-slate-900 p-2 rounded"><p className="text-[10px] uppercase font-bold text-slate-300">Net Due (Closing)</p><p className="font-bold text-white">{inr(summary.closingBal)}</p></div>
             </div>
             <button onClick={() => setShowDetails(!showDetails)} className="w-full mt-3 border border-slate-300 text-slate-700 font-bold py-2 rounded text-xs">{showDetails ? "Hide Details" : "View Day-Wise Details"}</button>
          </Card>
          {showDetails && (
             <Card title="Transaction History">
                {visibleTxs.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No transactions found.</p> : (
                  <ul className="divide-y text-xs">
                    {visibleTxs.map((tx, idx) => (
                      <li key={idx} className="py-2 flex justify-between items-center">
                         <div><p className="font-bold text-slate-900">{tx.date}</p><p className="text-[10px] text-slate-500 mt-0.5">{tx.type === 'credit' ? `${FUEL_LABEL[tx.fuelType] || 'Fuel'} (${tx.quantity}L @ ₹${tx.rate})` : `Payment via ${tx.source || 'Cash'}`}</p></div>
                         <span className={`font-black ${tx.type === 'credit' ? 'text-red-600' : 'text-emerald-600'}`}>{tx.type === 'credit' ? '+' : '-'}{inr(tx.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
             </Card>
          )}
        </>
      )}
    </div>
  );
}

// ============ NEW COMPACT, RESPONSIVE REPORT TAB ============
function ReportTab({ currentDate, day, ledgerRow }) {
  const totalRevenue = FUEL_KEYS.reduce((s, k) => s + day.fuel[k].volume * day.fuel[k].rate, 0);
  const totalCollected = day.collections.cashMorning + day.collections.cashEvening + day.collections.phonepe + day.collections.creditCard + day.collections.otherOnline;
  
  const pureExpenses = (day.expenses || []).filter(e => !e.category.toLowerCase().includes('diary'));
  const legacyDiary = (day.expenses || []).filter(e => e.category.toLowerCase().includes('diary'));
  
  const totalActualExpenses = pureExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalDiary = (day.diary || []).reduce((s, d) => s + (Number(d.amount) || 0), 0) + legacyDiary.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  
  const creditGivenToday = day.creditEntries.reduce((s, e) => s + e.amount, 0);
  const paymentsReceivedToday = day.paymentEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden"><button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-bold text-sm">🖨️ Print / Save PDF</button></div>
      
      <div id="report-content" className="bg-white p-3 rounded-xl border print:border-none print:p-0 print:m-0 w-full text-[10px] print:text-xs">
        
        <div className="text-center mb-3">
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide">Shree Balaji Tirupati Fuels</h1>
          <p className="font-bold text-slate-600">Daily Operations Report: {currentDate}</p>
        </div>
        
        {/* CSS FIX: 2x2 grid on mobile screens, 1x4 horizontal row on printed PDF */}
        <div className="grid grid-cols-2 print:grid-cols-4 gap-2 mb-3 print:gap-4">
          <div className="bg-sky-50 border border-sky-200 p-1.5 rounded text-center flex flex-col justify-center"><p className="text-[8px] print:text-[10px] font-bold text-sky-700 uppercase">Revenue</p><p className="font-black text-sky-900 text-sm print:text-lg">{inr(totalRevenue)}</p></div>
          <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded text-center flex flex-col justify-center"><p className="text-[8px] print:text-[10px] font-bold text-emerald-700 uppercase">Collected</p><p className="font-black text-emerald-900 text-sm print:text-lg">{inr(totalCollected)}</p></div>
          <div className="bg-rose-50 border border-rose-200 p-1.5 rounded text-center flex flex-col justify-center"><p className="text-[8px] print:text-[10px] font-bold text-rose-700 uppercase">Expenses</p><p className="font-black text-rose-900 text-sm print:text-lg">{inr(totalActualExpenses)}</p></div>
          <div className="bg-indigo-50 border border-indigo-200 p-1.5 rounded text-center flex flex-col justify-center"><p className="text-[8px] print:text-[10px] font-bold text-indigo-700 uppercase">Diary Dep.</p><p className="font-black text-indigo-900 text-sm print:text-lg">{inr(totalDiary)}</p></div>
        </div>

        {/* CSS FIX: Stacked as a single vertical column on mobile, Split side-by-side on printed PDF */}
        <div className="flex flex-col print:flex-row print:justify-between gap-y-4 print:gap-x-8 items-start w-full">
           
           {/* === LEFT COLUMN === */}
           <div className="w-full print:w-[48%] space-y-3">
              <div>
                <h2 className="font-black text-[11px] print:text-xs mb-1 text-sky-900 uppercase border-b-2 border-sky-200 inline-block">Fuel Sales</h2>
                <table className="w-full text-left mt-1 border border-slate-200">
                  <thead><tr className="bg-sky-100 text-sky-900 text-[9px] print:text-[10px] uppercase"><th className="p-1 border-r border-white">Fuel</th><th className="p-1 border-r border-white">Vol</th><th className="p-1 border-r border-white">Rate</th><th className="p-1 text-right">Amount</th></tr></thead>
                  <tbody>
                    {FUEL_KEYS.map(k => <tr key={k} className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">{FUEL_LABEL[k]}</td><td className="p-1 font-black text-slate-900">{day.fuel[k].volume}</td><td className="p-1 font-bold text-slate-700">{day.fuel[k].rate}</td><td className="p-1 text-right font-black text-slate-900">{inr(day.fuel[k].volume * day.fuel[k].rate)}</td></tr>)}
                  </tbody>
                </table>
              </div>

              <div>
                <h2 className="font-black text-[11px] print:text-xs mb-1 text-emerald-900 uppercase border-b-2 border-emerald-200 inline-block">Collections</h2>
                {/* CSS FIX: grid-cols-1 on phone prevents overlapping text, grid-cols-2 on print saves space */}
                <div className="grid grid-cols-1 print:grid-cols-2 gap-x-2 gap-y-1 mt-1 font-semibold text-slate-700 border border-slate-200 p-1.5 rounded bg-emerald-50/30">
                  <div className="flex justify-between"><span>Morn. Cash:</span><span className="font-black text-slate-900">{inr(day.collections.cashMorning)}</span></div>
                  <div className="flex justify-between"><span>Even. Cash:</span><span className="font-black text-slate-900">{inr(day.collections.cashEvening)}</span></div>
                  <div className="flex justify-between"><span>PhonePe:</span><span className="font-black text-slate-900">{inr(day.collections.phonepe)}</span></div>
                  <div className="flex justify-between"><span>Card:</span><span className="font-black text-slate-900">{inr(day.collections.creditCard)}</span></div>
                  <div className="flex justify-between"><span>Other:</span><span className="font-black text-slate-900">{inr(day.collections.otherOnline)}</span></div>
                  <div className="flex justify-between bg-emerald-200 px-1 rounded text-emerald-900"><span>Total:</span><span className="font-black">{inr(totalCollected)}</span></div>
                </div>
              </div>

              {pureExpenses.length > 0 && (
                <div>
                  <h2 className="font-black text-[11px] print:text-xs mb-1 text-rose-900 uppercase border-b-2 border-rose-200 inline-block">Expenses</h2>
                  <table className="w-full text-left mt-1 border border-slate-200">
                    <thead><tr className="bg-rose-100 text-rose-900 text-[9px] print:text-[10px] uppercase"><th className="p-1 border-r border-white">Category</th><th className="p-1 border-r border-white">Remarks</th><th className="p-1 text-right">Amount</th></tr></thead>
                    <tbody>
                      {pureExpenses.map(e => <tr key={e.id} className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">{e.category}</td><td className="p-1 text-slate-600 truncate max-w-[80px]">{e.remarks}</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              )}
           </div>

           {/* === RIGHT COLUMN === */}
           <div className="w-full print:w-[48%] space-y-3">
              <div>
                <h2 className="font-black text-[11px] print:text-xs mb-1 text-amber-900 uppercase border-b-2 border-amber-200 inline-block">Stock Updates</h2>
                <table className="w-full text-left mt-1 border border-slate-200">
                  <thead><tr className="bg-amber-100 text-amber-900 text-[8px] print:text-[10px] uppercase"><th className="p-1 border-r border-white">Fuel</th><th className="p-1 border-r border-white">Open</th><th className="p-1 border-r border-white">Recv</th><th className="p-1 border-r border-white">Sold</th><th className="p-1 font-black">Close</th></tr></thead>
                  <tbody>
                    {STOCK_FUELS.map(k => <tr key={k} className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800">{FUEL_LABEL[k]}</td><td className="p-1 font-bold text-slate-700">{ledgerRow[k].opening.toFixed(2)}</td><td className="p-1 font-bold text-slate-700">{ledgerRow[k].received.toFixed(2)}</td><td className="p-1 font-bold text-slate-700">{ledgerRow[k].sold.toFixed(2)}</td><td className="p-1 font-black text-amber-700">{ledgerRow[k].closing.toFixed(2)}</td></tr>)}
                  </tbody>
                </table>
              </div>

              {(day.diary?.length > 0 || legacyDiary.length > 0) && (
                <div>
                  <h2 className="font-black text-[11px] print:text-xs mb-1 text-indigo-900 uppercase border-b-2 border-indigo-200 inline-block">Diary (Bulk Cash Deposits)</h2>
                  <table className="w-full text-left mt-1 border border-slate-200">
                     <thead><tr className="bg-indigo-100 text-indigo-900 text-[9px] print:text-[10px] uppercase"><th className="p-1 border-r border-white">Entry</th><th className="p-1 text-right">Amount</th></tr></thead>
                     <tbody>
                       {legacyDiary.map(e => <tr key={e.id} className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800 truncate max-w-[100px] print:max-w-[200px]">Legacy: {e.category} {e.remarks && `(${e.remarks})`}</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
                       {(day.diary || []).map(d => <tr key={d.id} className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800 truncate max-w-[100px] print:max-w-[200px]">{d.remarks || 'Cash Transfer'}</td><td className="p-1 text-right font-black text-slate-900">{inr(d.amount)}</td></tr>)}
                     </tbody>
                  </table>
                </div>
              )}

              {(day.creditEntries.length > 0 || day.paymentEntries.length > 0) && (
                <div>
                  <h2 className="font-black text-[11px] print:text-xs mb-1 text-violet-900 uppercase border-b-2 border-violet-200 inline-block">Credit & Payments Log</h2>
                  <table className="w-full text-left mt-1 border border-slate-200">
                     <thead><tr className="bg-violet-100 text-violet-900 text-[9px] print:text-[10px] uppercase"><th className="p-1 border-r border-white">Customer</th><th className="p-1 border-r border-white">Type</th><th className="p-1 text-right">Amount</th></tr></thead>
                     <tbody>
                       {day.creditEntries.map(e => <tr key={e.id} className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800 truncate max-w-[120px] print:max-w-[150px]">{e.customerName}</td><td className="p-1 text-[9px] print:text-[10px] text-rose-700 font-bold bg-rose-50">Given</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
                       {day.paymentEntries.map(e => <tr key={e.id} className="border-b border-slate-100"><td className="p-1 font-bold text-slate-800 truncate max-w-[120px] print:max-w-[150px]">{e.customerName}</td><td className="p-1 text-[9px] print:text-[10px] text-emerald-700 font-bold bg-emerald-50">Recv ({e.source || 'Cash'})</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
                     </tbody>
                  </table>
                  <div className="mt-1.5 flex justify-between font-black text-[9px] print:text-[11px] text-slate-900">
                    <span className="bg-rose-100 border border-rose-200 px-1 py-0.5 rounded text-rose-900">Cr Given: {inr(creditGivenToday)}</span>
                    <span className="bg-emerald-100 border border-emerald-200 px-1 py-0.5 rounded text-emerald-900">Recv: {inr(paymentsReceivedToday)}</span>
                    <span className="bg-violet-100 border border-violet-200 px-1 py-0.5 rounded text-violet-900">Net: {inr(creditGivenToday - paymentsReceivedToday)}</span>
                  </div>
                </div>
              )}
           </div>
        </div>
        
        <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[8px] text-slate-400 print:mt-8">
           Generated on {new Date().toLocaleString('en-IN')}
        </div>

      </div>
    </div>
  );
}

// ============ Analytics Tab ============
function AnalyticsTab({ days, creditors, balances }) {
  const [filter, setFilter] = useState("30");
  const [customStart, setCustomStart] = useState(todayStr());
  const [customEnd, setCustomEnd] = useState(todayStr());
  
  const filteredDates = useMemo(() => {
     const sorted = Object.keys(days).sort();
     if (filter === "all") return sorted;
     if (filter === "custom") return sorted.filter(d => d >= customStart && d <= customEnd);
     return sorted.slice(-Number(filter));
  }, [days, filter, customStart, customEnd]);

  const chartData = useMemo(() => {
     let maxRev = 0;
     const data = filteredDates.map(date => {
        const d = days[date];
        const rev = FUEL_KEYS.reduce((sum, k) => sum + d.fuel[k].volume * d.fuel[k].rate, 0);
        if (rev > maxRev) maxRev = rev;
        return { date: date.slice(5), rev };
     });
     return data.map(d => ({ ...d, height: maxRev > 0 ? (d.rev / maxRev) * 100 : 0 }));
  }, [days, filteredDates]);

  const periodTotals = useMemo(() => {
     let rev = 0, exp = 0;
     filteredDates.forEach(date => {
        const d = days[date];
        rev += FUEL_KEYS.reduce((sum, k) => sum + d.fuel[k].volume * d.fuel[k].rate, 0);
        exp += (d.expenses || []).filter(e => !e.category.toLowerCase().includes('diary')).reduce((s, e) => s + (Number(e.amount) || 0), 0);
     });
     return { rev, exp };
  }, [days, filteredDates]);

  const periodDiary = useMemo(() => {
     let total = 0;
     const entries = [];
     filteredDates.forEach(date => {
        const d = days[date];
        const dailyDiary = d.diary || [];
        const legacyD = (d.expenses || []).filter(e => e.category.toLowerCase().includes('diary'));
        
        [...dailyDiary, ...legacyD].forEach(entry => {
           if (entry.amount > 0) {
               total += Number(entry.amount);
               entries.push({ date: date.slice(5), amount: Number(entry.amount), remarks: entry.remarks || entry.category || 'Bulk Deposit' });
           }
        });
     });
     return { total, entries };
  }, [days, filteredDates]);

  const topByBalance = useMemo(() => creditors.map(c => ({ ...c, balance: balances[c.account_number] ?? 0 })).sort((a, b) => b.balance - a.balance).slice(0, 10), [creditors, balances]);

  const customerCreditTrend = useMemo(() => {
     const map = {};
     filteredDates.forEach(date => {
        (days[date].creditEntries || []).forEach(e => {
           map[e.customerName] = (map[e.customerName] || 0) + e.amount;
        });
     });
     return Object.entries(map).map(([name, amount]) => ({name, amount})).sort((a,b) => b.amount - a.amount).slice(0, 10);
  }, [days, filteredDates]);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-wrap p-1 bg-slate-200 rounded-lg gap-1">
        <button onClick={() => setFilter("7")} className={`flex-1 rounded-md py-2 text-[11px] font-bold ${filter === "7" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}>7 Days</button>
        <button onClick={() => setFilter("30")} className={`flex-1 rounded-md py-2 text-[11px] font-bold ${filter === "30" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}>30 Days</button>
        <button onClick={() => setFilter("all")} className={`flex-1 rounded-md py-2 text-[11px] font-bold ${filter === "all" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}>All Time</button>
        <button onClick={() => setFilter("custom")} className={`flex-1 rounded-md py-2 text-[11px] font-bold ${filter === "custom" ? "bg-white shadow text-slate-900" : "text-slate-600"}`}>Custom</button>
      </div>

      {filter === "custom" && (
         <div className="flex gap-2">
           <label className="flex-1"><span className="text-[10px] font-bold text-slate-500">START DATE</span><input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="w-full rounded p-2 text-xs border outline-none font-bold" /></label>
           <label className="flex-1"><span className="text-[10px] font-bold text-slate-500">END DATE</span><input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="w-full rounded p-2 text-xs border outline-none font-bold" /></label>
         </div>
      )}

      <Card title="Revenue Trend (Selected Period)">
         <div className="flex justify-between mb-2 text-sm font-black text-slate-900"><span>Rev: {inr(periodTotals.rev)}</span><span>Exp: {inr(periodTotals.exp)}</span></div>
         <div className="flex h-32 items-end gap-1 mt-4 border-b border-slate-200 pb-1">
            {chartData.map((d, i) => (
               <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div style={{height: `${Math.max(d.height, 2)}%`}} className="w-full bg-slate-900 rounded-t hover:bg-emerald-600 transition-colors"></div>
                  <span className="text-[8px] text-slate-500 font-bold mt-1">{d.date}</span>
                  <div className="absolute -top-6 bg-black text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">{inr(d.rev)}</div>
               </div>
            ))}
         </div>
         {chartData.length === 0 && <p className="text-center text-xs text-slate-400 mt-4">No data in this period.</p>}
      </Card>

      <Card title="Diary Deposits (Selected Period)">
         <div className="flex justify-between mb-2 text-sm font-black text-slate-900">
            <span>Total Diary:</span><span className="text-blue-700">{inr(periodDiary.total)}</span>
         </div>
         {periodDiary.entries.length > 0 ? (
             <ul className="divide-y text-xs mt-2 border-t border-slate-100">
                {periodDiary.entries.map((e, i) => (
                    <li key={i} className="py-2 flex justify-between">
                       <span><span className="font-bold">{e.date}</span> <span className="text-slate-500 ml-1">{e.remarks}</span></span>
                       <span className="font-bold text-slate-900">{inr(e.amount)}</span>
                    </li>
                ))}
             </ul>
         ) : <p className="text-xs text-slate-500 mt-2">No diary entries found.</p>}
      </Card>

      <Card title="Top Credit Taken (Selected Period)">
        {customerCreditTrend.length === 0 ? <p className="text-xs text-slate-500">No credit given in this date range.</p> : (
            <ul className="divide-y text-sm">
              {customerCreditTrend.map(c => <li key={c.name} className="py-2 flex justify-between"><span className="font-bold text-slate-800">{c.name}</span><span className="font-black text-slate-900">{inr(c.amount)}</span></li>)}
            </ul>
        )}
      </Card>

      <Card title="Overall Outstanding Debtors (Top 10)">
        <ul className="divide-y text-sm">
          {topByBalance.map(c => <li key={c.account_number} className="py-2 flex justify-between"><span className="font-bold text-slate-800">{c.name}</span><span className="font-black text-red-600">{inr(c.balance)}</span></li>)}
        </ul>
      </Card>
    </div>
  );
}

// ============ Admin Tab ============
function AdminTab({ days, setDays, updateDB, currentRates, setRate, creditors, setCreditors, expenseCategories, setExpenseCategories, creditSources, setCreditSources }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  
  const [newCategory, setNewCategory] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newCreditorName, setNewCreditorName] = useState("");
  const [newCreditorBalance, setNewCreditorBalance] = useState("");
  const [bulkImportText, setBulkImportText] = useState("");
  const [importMode, setImportMode] = useState("add");
  const [importType, setImportType] = useState("sales");

  if (!unlocked) {
    return (
      <Card title="Admin Settings Lock">
        <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Enter Passcode" className="w-full border rounded-lg p-3 outline-none text-center font-bold tracking-widest" />
        <button onClick={() => passcode === ADMIN_PASSCODE && setUnlocked(true)} className="mt-3 w-full bg-slate-900 text-white font-bold py-3 rounded-lg">Unlock Settings</button>
      </Card>
    );
  }

  const exportData = () => {
    let csv = "Date,Revenue,MorningCash,EveningCash,PhonePe,Card,TotalCollected,CreditGiven,PaymentsReceived,TotalExpenses,TotalDiaryDeposits\n";
    Object.keys(days).sort().forEach(date => {
       const d = days[date];
       const rev = FUEL_KEYS.reduce((s, k) => s + d.fuel[k].volume * d.fuel[k].rate, 0);
       const coll = d.collections.cashMorning + d.collections.cashEvening + d.collections.phonepe + d.collections.creditCard + d.collections.otherOnline;
       const cg = d.creditEntries.reduce((s, e) => s + e.amount, 0);
       const pr = d.paymentEntries.reduce((s, e) => s + e.amount, 0);
       const exp = (d.expenses || []).filter(e => !e.category.toLowerCase().includes('diary')).reduce((s, e) => s + Number(e.amount), 0);
       const diaryAmt = (d.diary || []).reduce((s, x) => s + Number(x.amount), 0) + (d.expenses || []).filter(e => e.category.toLowerCase().includes('diary')).reduce((s, e) => s + Number(e.amount), 0);
       csv += `${date},${rev},${d.collections.cashMorning},${d.collections.cashEvening},${d.collections.phonepe},${d.collections.creditCard},${coll},${cg},${pr},${exp},${diaryAmt}\n`;
    });
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = `SBTF_Data_Dump_${todayStr()}.csv`;
    link.click();
  };

  const exportExpenses = () => {
    let csv = "Date,Category,Amount,Remarks\n";
    Object.keys(days).sort().forEach(date => {
       const d = days[date];
       (d.expenses || []).filter(e => !e.category.toLowerCase().includes('diary')).forEach(e => {
          if (e.amount > 0) csv += `${date},"${e.category}",${e.amount},"${(e.remarks || '').replace(/"/g, '""')}"\n`;
       });
    });
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = `SBTF_Detailed_Expenses_${todayStr()}.csv`;
    link.click();
  };

  const addCreditor = () => {
    if (!newCreditorName.trim()) return;
    const newAcc = String(Math.max(...creditors.map((c) => parseInt(c.account_number)), 21192539999) + 1);
    setCreditors([...creditors, { id: newAcc, account_number: newAcc, name: newCreditorName, opening_balance: Number(newCreditorBalance) || 0 }]);
    setNewCreditorName(""); setNewCreditorBalance("");
  };

  const bulkImport = () => {
    if (!bulkImportText.trim()) return;
    const imported = bulkImportText.trim().split("\n").map(line => {
        const [acc, name, bal] = line.split(",").map(s => s.trim());
        return (acc && name) ? { id: acc, account_number: acc, name: name, opening_balance: Number(bal)||0 } : null;
    }).filter(Boolean);
    if (importMode === "replace") setCreditors(imported);
    else {
        const existing = creditors.map(c => c.account_number);
        setCreditors([...creditors, ...imported.filter(i => !existing.includes(i.account_number))]);
    }
    setBulkImportText("");
  };

  const handleDailyCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const newDays = { ...days };
      const newCreditors = [...creditors];
      let importCount = 0;

      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"\vert{}"$)/g, '').trim());
        if (cols.length < 4) return;

        const dateCol = cols[1];
        const accCol = cols[2];
        const nameCol = cols[3];
        
        let amtCol = parseFloat(cols[7]); 
        if (isNaN(amtCol)) amtCol = parseFloat(cols[4]);
        if (isNaN(amtCol) && cols.length > 3) amtCol = parseFloat(cols[cols.length - 1]);

        if (!dateCol || !accCol || isNaN(amtCol)) return;

        const months = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
        const dParts = dateCol.split('-');
        if (dParts.length !== 3) return;
        const dayStr = dParts[0].padStart(2, '0');
        const monthStr = months[dParts[1].toLowerCase()];
        const yearStr = "20" + dParts[2].replace('20','');
        if (!monthStr) return;
        const isoDate = `${yearStr}-${monthStr}-${dayStr}`;

        let existingCreditor = newCreditors.find(c => c.account_number === accCol);
        if (!existingCreditor) {
            existingCreditor = { id: accCol, account_number: accCol, name: nameCol, opening_balance: 0 };
            newCreditors.push(existingCreditor);
        }

        if (isoDate <= "2025-12-31") {
            if (importType === "sales") existingCreditor.opening_balance += amtCol;
            else existingCreditor.opening_balance -= amtCol;
            importCount++; return;
        }

        if (!newDays[isoDate]) newDays[isoDate] = emptyDay(currentRates);

        if (importType === "sales") {
            let fuelType = 'diesel';
            const fuelCol = cols[4]?.toUpperCase() || '';
            if (fuelCol === 'MS') fuelType = 'petrol';
            if (fuelCol === 'CNG') fuelType = 'cng';

            let qtyCol = parseFloat(cols[5]);
            let rateCol = parseFloat(cols[6]);

            newDays[isoDate].creditEntries.push({ id: Date.now() + Math.random(), customerName: nameCol, accountNumber: accCol, fuelType, quantity: isNaN(qtyCol) ? 0 : qtyCol, rate: isNaN(rateCol) ? 0 : rateCol, amount: amtCol, remarks: "Daily CSV Import" });
        } else {
            newDays[isoDate].paymentEntries.push({ id: Date.now() + Math.random(), customerName: nameCol, accountNumber: accCol, amount: amtCol, source: "CSV Import", remarks: "Daily CSV Import" });
        }
        importCount++;
      });

      setCreditors(newCreditors); updateDB('creditors', newCreditors);
      setDays(newDays); updateDB('days', newDays);
      alert(`Success! Imported ${importCount} ${importType} records.`);
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    if (window.confirm("WARNING: This will permanently DELETE ALL historical sales and payments from the cloud, and strictly reset every customer's balance to exactly what it was on Sept 15, 2026. Are you 100% sure?")) {
      const resetPass = window.prompt("Type RESET to confirm:");
      if (resetPass === "RESET") {
         setDays({}); updateDB('days', {});
         setCreditors(CREDITORS_INITIAL); updateDB('creditors', CREDITORS_INITIAL);
         alert("Database has been successfully wiped and reset to Sept 15th balances.");
      } else { alert("Reset cancelled."); }
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <Card title="Global Fuel Rates">
         <div className="flex gap-2">
            <div className="flex-1"><NumberField label="Petrol" value={currentRates.petrol} onChange={v => setRate('petrol', v)} /></div>
            <div className="flex-1"><NumberField label="Diesel" value={currentRates.diesel} onChange={v => setRate('diesel', v)} /></div>
            <div className="flex-1"><NumberField label="CNG" value={currentRates.cng} onChange={v => setRate('cng', v)} /></div>
         </div>
      </Card>
      
      <Card title="Data Export">
         <button onClick={exportData} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-sm">📥 Download Daily Summary CSV</button>
         <button onClick={exportExpenses} className="w-full mt-2 bg-rose-600 text-white font-bold py-3 rounded-lg shadow-sm">📥 Download Detailed Expenses CSV</button>
      </Card>

      <Card title={`Customer Management (${creditors.length})`}>
        <div className="flex gap-2 mb-3">
          <input type="text" value={newCreditorName} onChange={e => setNewCreditorName(e.target.value)} placeholder="Customer Name" className="flex-1 border rounded p-2 text-sm" />
          <input type="number" value={newCreditorBalance} onChange={e => setNewCreditorBalance(e.target.value)} placeholder="Balance" className="w-20 border rounded p-2 text-sm" />
          <button onClick={addCreditor} className="bg-slate-900 text-white px-3 rounded font-bold">Add</button>
        </div>
        <p className="text-[10px] font-bold text-slate-500 mb-1">BULK IMPORT CSV (Format: acc_num,name,bal)</p>
        <div className="flex gap-2 mb-1">
            <button onClick={() => setImportMode("add")} className={`text-xs px-2 py-1 rounded ${importMode === "add" ? 'bg-slate-900 text-white' : 'border text-slate-500'}`}>Add to existing</button>
            <button onClick={() => setImportMode("replace")} className={`text-xs px-2 py-1 rounded ${importMode === "replace" ? 'bg-slate-900 text-white' : 'border text-slate-500'}`}>Replace all</button>
        </div>
        <textarea value={bulkImportText} onChange={e => setBulkImportText(e.target.value)} placeholder="21192539001,Customer Name,1500" rows={2} className="w-full border rounded p-2 text-xs font-mono mb-2" />
        <button onClick={bulkImport} className="w-full border border-slate-900 text-slate-900 py-2 text-xs font-bold rounded">Import Batch</button>
      </Card>

      <Card title="Bulk Import Daily Data (CSV)">
        <p className="text-xs text-slate-500 mb-2">Upload your daily Sales or Payments CSV file directly here.</p>
        <div className="flex gap-2 mb-3 bg-slate-100 p-1 rounded">
           <button onClick={() => setImportType("sales")} className={`flex-1 py-2 text-xs font-bold rounded ${importType === "sales" ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>Import Sales</button>
           <button onClick={() => setImportType("payments")} className={`flex-1 py-2 text-xs font-bold rounded ${importType === "payments" ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>Import Payments</button>
        </div>
        <input type="file" accept=".csv" onChange={(e) => {
            if(window.confirm(`Are you sure you want to import this file as ${importType.toUpperCase()}?`)) handleDailyCSVUpload(e);
            else e.target.value = null;
        }} className="w-full border rounded p-2 text-xs mb-2 bg-slate-50" />
      </Card>

      <Card title="Expense Categories">
        <ul className="text-sm divide-y mb-2 font-bold text-slate-700">{expenseCategories.map(c => <li key={c} className="flex justify-between py-1"><span>{c}</span><button onClick={() => setExpenseCategories(expenseCategories.filter(x => x !== c))} className="text-red-500 font-bold text-xs">✕</button></li>)}</ul>
        <div className="flex gap-2"><input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name" className="flex-1 border rounded p-1 text-sm font-semibold" /><button onClick={() => { if(newCategory) { setExpenseCategories([...expenseCategories, newCategory]); setNewCategory(""); } }} className="bg-slate-900 text-white px-3 rounded font-bold text-sm">Add</button></div>
      </Card>

      <Card title="Payment Sources">
        <ul className="text-sm divide-y mb-2 font-bold text-slate-700">{creditSources.map(s => <li key={s} className="flex justify-between py-1"><span>{s}</span><button onClick={() => setCreditSources(creditSources.filter(x => x !== s))} className="text-red-500 font-bold text-xs">✕</button></li>)}</ul>
        <div className="flex gap-2"><input type="text" value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="New payment source" className="flex-1 border rounded p-1 text-sm font-semibold" /><button onClick={() => { if(newSource) { setCreditSources([...creditSources, newSource]); setNewSource(""); } }} className="bg-slate-900 text-white px-3 rounded font-bold text-sm">Add</button></div>
      </Card>

      <Card title="DANGER ZONE">
         <p className="text-xs text-slate-500 mb-2 font-bold">Use this to clear out old historical data errors and start completely fresh from September 15th, 2026.</p>
         <button onClick={handleFactoryReset} className="w-full bg-red-600 text-white font-black tracking-widest py-3 rounded-lg shadow">FACTORY RESET DATABASE</button>
      </Card>
    </div>
  );
}

// ============ Core Application Setup ============
export default function App() {
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(todayStr());
  const [currentRates, setCurrentRates] = useState(DEFAULT_RATES);
  const [days, setDays] = useState({});
  const [tab, setTab] = useState("sales");
  const [creditors, setCreditors] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [creditSources, setCreditSources] = useState([]);
  
  const [pastDateUnlocked, setPastDateUnlocked] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const updateDB = async (column, value) => await supabase.from('station_data').update({ [column]: value }).eq('id', 1);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('station_data').select('*').eq('id', 1).single();
      if (data) {
        if (data.days) setDays(data.days);
        if (data.current_rates) setCurrentRates(data.current_rates);
        if (data.expense_categories) setExpenseCategories(data.expense_categories);
        else setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
        if (data.credit_sources) setCreditSources(data.credit_sources);
        else setCreditSources(DEFAULT_CREDIT_SOURCES);
        if (data.creditors && data.creditors.length > 0) setCreditors(data.creditors);
        else { updateDB('creditors', CREDITORS_INITIAL); setCreditors(CREDITORS_INITIAL); }
      }
      setIsDbLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__expenseCategories = expenseCategories.length > 0 ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES;
      window.__creditSources = creditSources.length > 0 ? creditSources : DEFAULT_CREDIT_SOURCES;
    }
  }, [expenseCategories, creditSources]);

  useEffect(() => {
    if (!isDbLoading) {
      setDays((prev) => {
        if (prev[currentDate]) return prev;
        const newDays = { ...prev, [currentDate]: emptyDay(currentRates) };
        updateDB('days', newDays); return newDays;
      });
      if (currentDate !== todayStr()) setPastDateUnlocked(false);
    }
  }, [currentDate, currentRates, isDbLoading]);

  const update = (patch) => { setDays(prev => { const next = { ...prev, [currentDate]: { ...(prev[currentDate] || emptyDay(currentRates)), ...patch } }; updateDB('days', next); return next; }); };
  const handleSetRate = (fuelKey, val) => { setCurrentRates(prev => { const next = { ...prev, [fuelKey]: val }; updateDB('current_rates', next); return next; }); };

  const onTouchStartEvent = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMoveEvent = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 60) {
      const idx = TABS.findIndex(t => t.key === tab);
      if (idx < TABS.length - 1) setTab(TABS[idx + 1].key);
    }
    if (distance < -60) {
      const idx = TABS.findIndex(t => t.key === tab);
      if (idx > 0) setTab(TABS[idx - 1].key);
    }
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

  if (isDbLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><p className="text-slate-500 font-bold animate-pulse">Syncing with Cloud...</p></div>;

  const isPastDate = currentDate !== todayStr();
  const isReadOnly = isPastDate && !pastDateUnlocked;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3 shadow-sm print:hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase text-slate-900">SBTF Operations</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Cloud Synced</div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-900">{TABS.find((t) => t.key === tab)?.label}</h1>
          <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className={`rounded-md border p-1 text-sm font-bold shadow-sm outline-none ${isPastDate ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-300 bg-white'}`} />
        </div>
      </header>

      {/* CSS FIX: print:max-w-none print:w-full allows report to stretch fully only when printing */}
      <main onTouchStart={onTouchStartEvent} onTouchMove={onTouchMoveEvent} onTouchEnd={onTouchEndEvent} className="mx-auto max-w-md print:max-w-none print:w-full p-3 print:p-0 min-h-[70vh]">
        
        {isPastDate && ["sales", "credit", "stock"].includes(tab) && (
           <div className="bg-amber-100 text-amber-900 p-2 rounded-lg text-[10px] font-bold flex justify-between items-center mb-3 shadow-sm print:hidden">
              <span>VIEWING PAST DATE (READ-ONLY)</span>
              {!pastDateUnlocked ? (
                 <button onClick={() => { if (window.prompt("Enter Admin Passcode to edit past records:") === ADMIN_PASSCODE) setPastDateUnlocked(true); else alert("Incorrect passcode."); }} className="bg-amber-600 text-white px-3 py-1 rounded text-xs font-black">Edit</button>
              ) : (
                 <span className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded border border-emerald-200">Unlocked</span>
              )}
           </div>
        )}

        {tab === "sales" && <SalesTab day={day} update={update} currentRates={currentRates} setRate={handleSetRate} creditGivenToday={day.creditEntries.reduce((s,e)=>s+e.amount,0)} paymentsReceivedToday={day.paymentEntries.reduce((s,e)=>s+e.amount,0)} onGoToCredit={() => setTab("credit")} isReadOnly={isReadOnly} />}
        {tab === "credit" && <CreditTab day={day} update={update} currentRates={currentRates} balances={balances} creditors={creditors} isReadOnly={isReadOnly} />}
        {tab === "stock" && <StockTab day={day} update={update} ledgerRow={ledgerRow} hasPreviousDay={hasPreviousDay} isReadOnly={isReadOnly} />}
        {tab === "ledger" && <LedgerTab days={days} creditors={creditors} balances={balances} />}
        {tab === "report" && <ReportTab currentDate={currentDate} day={day} ledgerRow={ledgerRow} />}
        {tab === "analytics" && <AnalyticsTab days={days} creditors={creditors} balances={balances} />}
        {tab === "admin" && <AdminTab days={days} setDays={setDays} updateDB={updateDB} currentRates={currentRates} setRate={handleSetRate} creditors={creditors} setCreditors={c => { setCreditors(c); updateDB('creditors', c); }} expenseCategories={expenseCategories} setExpenseCategories={c => { setExpenseCategories(c); updateDB('expense_categories', c); }} creditSources={creditSources} setCreditSources={c => { setCreditSources(c); updateDB('credit_sources', c); }} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white shadow-[0_-10px_10px_-5px_rgba(0,0,0,0.05)] print:hidden">
        <div className="mx-auto grid max-w-md grid-cols-7 text-[9px]">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`py-4 text-center font-bold transition-colors ${tab === t.key ? "text-slate-900 border-t-2 border-slate-900 bg-slate-50" : "text-slate-400 hover:text-slate-600"}`}>{t.label}</button>
          ))}
        </div>
      </nav>
    </div>
  );
}