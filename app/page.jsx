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

// EXACT BALANCES AS OF SEPT 15 EXTRACTED FROM EXCEL
const CREDITORS_INITIAL = [
  { "account_number": "21192539001", "name": "100 DIAL", "id": "21192539001", "opening_balance": 765 },
  { "account_number": "21192539002", "name": "MS Latent Landinfra", "id": "21192539002", "opening_balance": 47 },
  { "account_number": "21192539003", "name": "BOI LDM 1463", "id": "21192539003", "opening_balance": 77735 },
  { "account_number": "21192539004", "name": "CEO SUSNER", "id": "21192539004", "opening_balance": 63411 },
  { "account_number": "21192539005", "name": "JILA UDYOG AGAR", "id": "21192539005", "opening_balance": 1638 },
  { "account_number": "21192539006", "name": "OM JI GOYAL", "id": "21192539006", "opening_balance": 55484 },
  { "account_number": "21192539007", "name": "PHE AGAR", "id": "21192539007", "opening_balance": 256681 },
  { "account_number": "21192539008", "name": "PIU PWD AGAR", "id": "21192539008", "opening_balance": 113584 },
  { "account_number": "21192539009", "name": "PRAVIN YADAV JCB", "id": "21192539009", "opening_balance": 29717 },
  { "account_number": "21192539010", "name": "PRINCE HYUNDAI AGAR", "id": "21192539010", "opening_balance": 8503 },
  { "account_number": "21192539011", "name": "ABHAI JI JOSHI", "id": "21192539011", "opening_balance": 438 },
  { "account_number": "21192539012", "name": "SDO WRD AGAR", "id": "21192539012", "opening_balance": 6706 },
  { "account_number": "21192539013", "name": "AWADA SUNSHINE PVT", "id": "21192539013", "opening_balance": 97479 },
  { "account_number": "21192539014", "name": "SHIV YADAV JCB", "id": "21192539014", "opening_balance": 68852 },
  { "account_number": "21192539015", "name": "SHREE MAYA AGRO AGAR", "id": "21192539015", "opening_balance": 13296 },
  { "account_number": "21192539016", "name": "BEJNATH BUS", "id": "21192539016", "opening_balance": 228621 },
  { "account_number": "21192539017", "name": "ZSK", "id": "21192539017", "opening_balance": 19216 },
  { "account_number": "21192539018", "name": "ABHAY JI", "id": "21192539018", "opening_balance": 472441 },
  { "account_number": "21192539019", "name": "CM & HO AGAR", "id": "21192539019", "opening_balance": 81513 },
  { "account_number": "21192539020", "name": "HIRALAL JI YADAV", "id": "21192539020", "opening_balance": 20248 },
  { "account_number": "21192539021", "name": "GOVARDHAN GURJAR", "id": "21192539021", "opening_balance": 18015 },
  { "account_number": "21192539022", "name": "MAHENDRA SINGH JI AWAR", "id": "21192539022", "opening_balance": 0 },
  { "account_number": "21192539023", "name": "SBTF MP09H0127", "id": "21192539023", "opening_balance": 8594 },
  { "account_number": "21192539024", "name": "BPCL", "id": "21192539024", "opening_balance": 4676 },
  { "account_number": "21192539025", "name": "CHAND JI PATIDAR", "id": "21192539025", "opening_balance": 499258 },
  { "account_number": "21192539026", "name": "AADINATH TRANSPORT", "id": "21192539026", "opening_balance": 0 },
  { "account_number": "21192539027", "name": "JEEWAN SINGH GURJAR", "id": "21192539027", "opening_balance": 4 },
  { "account_number": "21192539028", "name": "SBTF DG", "id": "21192539028", "opening_balance": 49734 },
  { "account_number": "21192539029", "name": "MANISH JI SHARMA KANAD", "id": "21192539029", "opening_balance": 5640 },
  { "account_number": "21192539030", "name": "ANKUR BHAIYA", "id": "21192539030", "opening_balance": 22671 },
  { "account_number": "21192539031", "name": "SDM COLLECTOR OFFICE", "id": "21192539031", "opening_balance": 2372 },
  { "account_number": "21192539032", "name": "JEEVAN SINGH BINAYAGA", "id": "21192539032", "opening_balance": 3922 },
  { "account_number": "21192539033", "name": "KAMAL DEVELOPERS", "id": "21192539033", "opening_balance": 5992 },
  { "account_number": "21192539034", "name": "KARAN MALVIYA", "id": "21192539034", "opening_balance": 600 },
  { "account_number": "21192539035", "name": "SUNIL JI JINDAL", "id": "21192539035", "opening_balance": 89789 },
  { "account_number": "21192539036", "name": "FULL SINGH JI GURJAR", "id": "21192539036", "opening_balance": 17000 },
  { "account_number": "21192539037", "name": "SHIV AKYA", "id": "21192539037", "opening_balance": 0 },
  { "account_number": "21192539038", "name": "NAGAR PALIKA AGAR", "id": "21192539038", "opening_balance": 2740070 },
  { "account_number": "21192539039", "name": "VISHNU DAL MILL", "id": "21192539039", "opening_balance": 0 },
  { "account_number": "21192539040", "name": "DEVKARAN BHAIYA", "id": "21192539040", "opening_balance": 1768447 },
  { "account_number": "21192539041", "name": "BAUJI LADON", "id": "21192539041", "opening_balance": 943596 },
  { "account_number": "21192539042", "name": "AWANTIKA(VINOD BAIRAGI)", "id": "21192539042", "opening_balance": 9349 },
  { "account_number": "21192539043", "name": "KOMAL CONSTRUCTION", "id": "21192539043", "opening_balance": 100001 },
  { "account_number": "21192539044", "name": "MOONBRIGHT INFRA", "id": "21192539044", "opening_balance": 0 },
  { "account_number": "21192539045", "name": "PANKAJ JI KOTHARI", "id": "21192539045", "opening_balance": 8485 },
  { "account_number": "21192539046", "name": "MADAN SINGH JI NIPANIYA", "id": "21192539046", "opening_balance": 20 },
  { "account_number": "21192539047", "name": "NARAYAN SINGH DUDH WAHAN", "id": "21192539047", "opening_balance": 0 },
  { "account_number": "21192539048", "name": "PARAS GAWALI", "id": "21192539048", "opening_balance": 14790 },
  { "account_number": "21192539049", "name": "FULL SINGH JI PACHETI", "id": "21192539049", "opening_balance": 28121 },
  { "account_number": "21192539050", "name": "PINTU SHARMA MP SHASHAN", "id": "21192539050", "opening_balance": 0 },
  { "account_number": "21192539051", "name": "KAVYA & TIWARI ASSOCIATES", "id": "21192539051", "opening_balance": 3622 },
  { "account_number": "21192539052", "name": "JAGDISH JI MANTRI JI", "id": "21192539052", "opening_balance": 113231 },
  { "account_number": "21192539053", "name": "PHONEPE", "id": "21192539053", "opening_balance": 38876 },
  { "account_number": "21192539054", "name": "NIRVACHAN AAYOG", "id": "21192539054", "opening_balance": 86457 },
  { "account_number": "21192539055", "name": "NARAYAN SINGH SOLAR", "id": "21192539055", "opening_balance": 35809 },
  { "account_number": "21192539056", "name": "AJJU BHAIYA MANDI", "id": "21192539056", "opening_balance": 0 },
  { "account_number": "21192539057", "name": "PSH TECHNO ENGG", "id": "21192539057", "opening_balance": -698 },
  { "account_number": "21192539058", "name": "SHREYAS CIVIL", "id": "21192539058", "opening_balance": 0 },
  { "account_number": "21192539059", "name": "MAA CHAMUNDA", "id": "21192539059", "opening_balance": 0 },
  { "account_number": "21192539060", "name": "DURGESH KATARIA", "id": "21192539060", "opening_balance": 2013 },
  { "account_number": "21192539061", "name": "SATYALAKSHMI INFRACOM", "id": "21192539061", "opening_balance": 18231 },
  { "account_number": "21192539062", "name": "AJAY GURJAR", "id": "21192539062", "opening_balance": -58 },
  { "account_number": "21192539063", "name": "Dev Kali Infra", "id": "21192539063", "opening_balance": -16 },
  { "account_number": "21192539064", "name": "SUZLON COMPANY", "id": "21192539064", "opening_balance": 20185 },
  { "account_number": "21192539065", "name": "ANAND BHAIYA", "id": "21192539065", "opening_balance": 0 },
  { "account_number": "21192539066", "name": "DARBAR NARAYAN SINGH", "id": "21192539066", "opening_balance": 27100 },
  { "account_number": "21192539067", "name": "SYSTEM RENWABLE", "id": "21192539067", "opening_balance": 11308 },
  { "account_number": "21192539068", "name": "YASH TILE", "id": "21192539068", "opening_balance": 0 },
  { "account_number": "21192539069", "name": "RAJESH JI DUDH DAIRY", "id": "21192539069", "opening_balance": 32942 },
  { "account_number": "21192539070", "name": "PRAKASH BHAIYA boi", "id": "21192539070", "opening_balance": 14964 },
  { "account_number": "21192539071", "name": "AWADA SOLAR", "id": "21192539071", "opening_balance": 3813 },
  { "account_number": "21192539072", "name": "BADRI DA LADON", "id": "21192539072", "opening_balance": 5300 },
  { "account_number": "21192539073", "name": "BALRAM GURJAR", "id": "21192539073", "opening_balance": 76261 },
  { "account_number": "21192539074", "name": "JEPEE CONSTRUCTION", "id": "21192539074", "opening_balance": 1498 },
  { "account_number": "21192539075", "name": "APM PROJECTS", "id": "21192539075", "opening_balance": -5000 },
  { "account_number": "21192539076", "name": "MALWA INFRACON", "id": "21192539076", "opening_balance": 0 },
  { "account_number": "21192539077", "name": "PATIDAR CONSTRUCTION", "id": "21192539077", "opening_balance": 0 },
  { "account_number": "21192539078", "name": "SIDDHARTH BHAIYA(HARRIER)", "id": "21192539078", "opening_balance": 95075 },
  { "account_number": "21192539079", "name": "SODAN SINGH KHEDA", "id": "21192539079", "opening_balance": 45264 },
  { "account_number": "21192539080", "name": "STC MPBB", "id": "21192539080", "opening_balance": 156016 },
  { "account_number": "21192539081", "name": "SITARAM JI GURJAR", "id": "21192539081", "opening_balance": 59133 },
  { "account_number": "21192539082", "name": "SIMRAN SOLAR ENERGY", "id": "21192539082", "opening_balance": 0 },
  { "account_number": "21192539083", "name": "NILESH JI JAIN", "id": "21192539083", "opening_balance": 0 },
  { "account_number": "21192539084", "name": "SUSNER GADI", "id": "21192539084", "opening_balance": 0 },
  { "account_number": "21192539085", "name": "GANGARAM JI SULTANPUR", "id": "21192539085", "opening_balance": 0 },
  { "account_number": "21192539086", "name": "ALRAZA CONSTRUCTION", "id": "21192539086", "opening_balance": 0 },
  { "account_number": "21192539087", "name": "BHUMIKA ENTERPRISES", "id": "21192539087", "opening_balance": 0 },
  { "account_number": "21192539088", "name": "NAPTOL MADAM", "id": "21192539088", "opening_balance": 4791 },
  { "account_number": "21192539089", "name": "MOHANLAL JI YADAV BAPCHA", "id": "21192539089", "opening_balance": 176331 },
  { "account_number": "21192539090", "name": "ARIF BHAI MALWA", "id": "21192539090", "opening_balance": 0 },
  { "account_number": "21192539091", "name": "KAMAL SINGH AWAR", "id": "21192539091", "opening_balance": 47972 },
  { "account_number": "21192539092", "name": "TUSHAR JI JOSHI", "id": "21192539092", "opening_balance": 0 },
  { "account_number": "21192539093", "name": "JITENDRA BAIRAGI", "id": "21192539093", "opening_balance": 0 },
  { "account_number": "21192539094", "name": "LUV KUSH", "id": "21192539094", "opening_balance": 0 },
  { "account_number": "21192539095", "name": "BEJNATH MAHADEV SHAHI MANDAL", "id": "21192539095", "opening_balance": 23954 },
  { "account_number": "21192539096", "name": "TONY NAWAL", "id": "21192539096", "opening_balance": 0 },
  { "account_number": "21192539097", "name": "DEEPAK GURJAR", "id": "21192539097", "opening_balance": 883 },
  { "account_number": "21192539098", "name": "SIS COMPANY", "id": "21192539098", "opening_balance": 3000 },
  { "account_number": "21192539099", "name": "ARJUN GURJAR SOLAR", "id": "21192539099", "opening_balance": 0 },
  { "account_number": "21192539100", "name": "NATRAJ CONSTRUCTION", "id": "21192539100", "opening_balance": 0 },
  { "account_number": "21192539101", "name": "Virendar shing sisodiya ", "id": "21192539101", "opening_balance": 0 },
  { "account_number": "21192539102", "name": "HEMANT SIR AWADA", "id": "21192539102", "opening_balance": 2347 },
  { "account_number": "21192539103", "name": "BAJAJ PUMP", "id": "21192539103", "opening_balance": 0 },
  { "account_number": "21192539104", "name": "JAYANT CONSTRUCTION", "id": "21192539104", "opening_balance": 0 },
  { "account_number": "21192539105", "name": "SUDIP KOTHARI", "id": "21192539105", "opening_balance": 0 },
  { "account_number": "21192539106", "name": "SK INFRA", "id": "21192539106", "opening_balance": 0 },
  { "account_number": "21192539107", "name": "Sanwaliya Wintech Pvt Ltd", "id": "21192539107", "opening_balance": 0 },
  { "account_number": "21192539108", "name": "Kedar Ji Ajmera", "id": "21192539108", "opening_balance": 3000 },
  { "account_number": "21192539109", "name": "Hardik Jain", "id": "21192539109", "opening_balance": 9920 },
  { "account_number": "21192539110", "name": "GR INFRA SURESH JI", "id": "21192539110", "opening_balance": 0 },
  { "account_number": "21192539111", "name": "UFILL", "id": "21192539111", "opening_balance": 708 },
  { "account_number": "21192539112", "name": "Richi Crane Service", "id": "21192539112", "opening_balance": 65902 },
  { "account_number": "21192539113", "name": "Mahakal Darshan", "id": "21192539113", "opening_balance": -8372 },
  { "account_number": "21192539114", "name": "Sanghvi Removeable", "id": "21192539114", "opening_balance": 10041 },
  { "account_number": "21192539115", "name": "INDOLIA COMPANY ", "id": "21192539115", "opening_balance": 1 },
  { "account_number": "21192539116", "name": "Sudeep Jain", "id": "21192539116", "opening_balance": 0 },
  { "account_number": "21192539117", "name": "Sethiy Company", "id": "21192539117", "opening_balance": 12722 },
  { "account_number": "21192539118", "name": "BHARAT PRAJAPATI", "id": "21192539118", "opening_balance": 0 },
  { "account_number": "21192539119", "name": "KESHAV TRANSPORT NARWAL", "id": "21192539119", "opening_balance": 46020 },
  { "account_number": "21192539120", "name": "Ankit Patil", "id": "21192539120", "opening_balance": 0 },
  { "account_number": "21192539121", "name": "Bablu chachar Elc", "id": "21192539121", "opening_balance": 42496 },
  { "account_number": "21192539122", "name": "Balaji Transport", "id": "21192539122", "opening_balance": 33127 },
  { "account_number": "21192539123", "name": "Mitansh Enterprises", "id": "21192539123", "opening_balance": 78688 },
  { "account_number": "21192539124", "name": "Oyester Green Hybrid", "id": "21192539124", "opening_balance": 98575 },
  { "account_number": "21192539125", "name": "MEGA GAS", "id": "21192539125", "opening_balance": 536 },
  { "account_number": "21192539126", "name": "SDO AGAR SATYALAKSHAMI", "id": "21192539126", "opening_balance": 64937 },
  { "account_number": "21192539127", "name": "S.K.JAIN ", "id": "21192539127", "opening_balance": 0 },
  { "account_number": "21192539128", "name": "jila sah samanvayak agar", "id": "21192539128", "opening_balance": 0 },
  { "account_number": "21192539129", "name": "akshay", "id": "21192539129", "opening_balance": 1050 },
  { "account_number": "21192539130", "name": "Raish Bhai", "id": "21192539130", "opening_balance": 0 },
  { "account_number": "21192539131", "name": "Vaishnav tour", "id": "21192539131", "opening_balance": 8 },
  { "account_number": "21192539132", "name": "Ankit paliwal", "id": "21192539132", "opening_balance": 29356 },
  { "account_number": "21192539133", "name": "ramesh sultanpura", "id": "21192539133", "opening_balance": 1 },
  { "account_number": "21192539134", "name": "MANISH SONI", "id": "21192539134", "opening_balance": 18428 },
  { "account_number": "21192539135", "name": "Virendra shing Sisodiya 2", "id": "21192539135", "opening_balance": 3580 },
  { "account_number": "21192539136", "name": "Assisetant Agriculture Agar Malwa", "id": "21192539136", "opening_balance": 5033 },
  { "account_number": "21192539137", "name": "Kshema Power India PVT LTD ", "id": "21192539137", "opening_balance": 20622 },
  { "account_number": "21192539138", "name": "Gokul singh ", "id": "21192539138", "opening_balance": 16000 },
  { "account_number": "21192539139", "name": "Arjun yadav ", "id": "21192539139", "opening_balance": 50210 },
  { "account_number": "21192539140", "name": "Ashwin upadhyay", "id": "21192539140", "opening_balance": 14114 },
  { "account_number": "21192539141", "name": "Sundar ji yadav ", "id": "21192539141", "opening_balance": 16289 },
  { "account_number": "21192539142", "name": "Nilesh jain ", "id": "21192539142", "opening_balance": 82510 },
  { "account_number": "21192539143", "name": "Samir bhai elc", "id": "21192539143", "opening_balance": 6322 },
  { "account_number": "21192539144", "name": "Kalash Yatra ", "id": "21192539144", "opening_balance": 2 },
  { "account_number": "21192539145", "name": "ADARSH SHARMA ", "id": "21192539145", "opening_balance": 28521 },
  { "account_number": "21192539146", "name": "JILA shiksha adikari", "id": "21192539146", "opening_balance": 2013 },
  { "account_number": "21192539147", "name": "MPB RUPESH PATIDAR ", "id": "21192539147", "opening_balance": 5001 },
  { "account_number": "21192539148", "name": "N", "id": "21192539148", "opening_balance": 0 },
  { "account_number": "21192539149", "name": "O", "id": "21192539149", "opening_balance": 0 },
  { "account_number": "21192539150", "name": "P", "id": "21192539150", "opening_balance": 0 }
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
  const totalExpenses = day.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const accountedFor = totalCollected + creditGivenToday + totalExpenses;
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

      <Card title="Expenses">
        <div className="space-y-2">
          {day.expenses.map((e) => (
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
        <div className="flex justify-between text-xs font-bold text-slate-600"><span>Colls + Credit + Exp</span><span>{inr(accountedFor)}</span></div>
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
                <div><p className="font-bold text-slate-900">{e.customerName}</p><p className="text-xs text-slate-500">{mode === 'give' ? `${e.quantity}L @ ₹${e.rate}` : e.source}</p></div>
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

/// ============ Stock Tab ============
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
                   
                   {/* Editable Opening Stock Field */}
                   <div className="flex justify-between items-center">
                      <span>Open:</span>
                      <input 
                        type="number" 
                        disabled={isReadOnly}
                        value={day.stock?.openingOverride?.[k] !== null && day.stock?.openingOverride?.[k] !== undefined ? day.stock.openingOverride[k] : ""}
                        placeholder={ledgerRow[k].opening.toFixed(2)}
                        onChange={(e) => {
                           const val = e.target.value;
                           update({ stock: { ...day.stock, openingOverride: { ...day.stock?.openingOverride, [k]: val === "" ? null : Number(val) } } });
                        }}
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
function LedgerTab({ days, creditors }) {
  const [customer, setCustomer] = useState(null);
  const [filter, setFilter] = useState("30");
  const [showDetails, setShowDetails] = useState(false);

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

// ============ Report Tab ============
function ReportTab({ currentDate, day, ledgerRow }) {
  const totalRevenue = FUEL_KEYS.reduce((s, k) => s + day.fuel[k].volume * day.fuel[k].rate, 0);
  const totalCollected = day.collections.cashMorning + day.collections.cashEvening + day.collections.phonepe + day.collections.creditCard + day.collections.otherOnline;
  const totalExpenses = day.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const creditGivenToday = day.creditEntries.reduce((s, e) => s + e.amount, 0);
  const paymentsReceivedToday = day.paymentEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden"><button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-bold text-sm">🖨️ Print / Save PDF</button></div>
      <div id="report-content" className="bg-white p-4 rounded-xl border print:border-none print:p-0 print:text-[11px] print:m-0 w-full">
        <div className="text-center mb-4"><h1 className="text-xl font-black text-slate-900 uppercase">Shree Balaji Tirupati Fuels</h1><p className="font-bold text-slate-600">Daily Operations Report: {currentDate}</p></div>
        
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-slate-100 p-2 rounded text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Revenue</p><p className="font-black text-slate-900 text-base">{inr(totalRevenue)}</p></div>
          <div className="flex-1 bg-slate-100 p-2 rounded text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Collected</p><p className="font-black text-slate-900 text-base">{inr(totalCollected)}</p></div>
          <div className="flex-1 bg-slate-100 p-2 rounded text-center"><p className="text-[10px] font-bold text-slate-500 uppercase">Expenses</p><p className="font-black text-slate-900 text-base">{inr(totalExpenses)}</p></div>
        </div>

        <div className="mb-4 print:break-inside-avoid"><h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Fuel Sales</h2>
          <table className="w-full text-left mt-2"><thead><tr className="bg-slate-200 text-slate-900 text-xs"><th className="p-1">Fuel</th><th className="p-1">Vol</th><th className="p-1">Rate</th><th className="p-1 text-right">Amount</th></tr></thead><tbody className="text-sm">
            {FUEL_KEYS.map(k => <tr key={k} className="border-b"><td className="p-1 font-bold">{FUEL_LABEL[k]}</td><td className="p-1 font-black text-slate-900">{day.fuel[k].volume}</td><td className="p-1 font-bold text-slate-900">{day.fuel[k].rate}</td><td className="p-1 text-right font-black text-slate-900">{inr(day.fuel[k].volume * day.fuel[k].rate)}</td></tr>)}
          </tbody></table>
        </div>

        <div className="mb-4 print:break-inside-avoid"><h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Collections</h2>
           <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs font-bold text-slate-800">
             <div className="flex justify-between"><span>Morning Cash:</span><span className="font-black text-slate-900">{inr(day.collections.cashMorning)}</span></div><div className="flex justify-between"><span>Evening Cash:</span><span className="font-black text-slate-900">{inr(day.collections.cashEvening)}</span></div>
             <div className="flex justify-between"><span>PhonePe:</span><span className="font-black text-slate-900">{inr(day.collections.phonepe)}</span></div><div className="flex justify-between"><span>Card:</span><span className="font-black text-slate-900">{inr(day.collections.creditCard)}</span></div>
             <div className="flex justify-between"><span>Other:</span><span className="font-black text-slate-900">{inr(day.collections.otherOnline)}</span></div><div className="flex justify-between bg-slate-200 px-1 rounded"><span>Total:</span><span className="font-black text-slate-900">{inr(totalCollected)}</span></div>
           </div>
        </div>

        <div className="mb-4 print:break-inside-avoid"><h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Stock Updates</h2>
          <table className="w-full text-left mt-2"><thead><tr className="bg-slate-200 text-slate-900 text-[10px] uppercase"><th className="p-1">Fuel</th><th className="p-1">Open</th><th className="p-1">Recv</th><th className="p-1">Sold</th><th className="p-1 font-black">Close</th></tr></thead><tbody className="text-xs">
            {STOCK_FUELS.map(k => <tr key={k} className="border-b"><td className="p-1 font-bold">{FUEL_LABEL[k]}</td><td className="p-1 font-bold text-slate-900">{ledgerRow[k].opening.toFixed(2)}</td><td className="p-1 font-bold text-slate-900">{ledgerRow[k].received.toFixed(2)}</td><td className="p-1 font-bold text-slate-900">{ledgerRow[k].sold.toFixed(2)}</td><td className="p-1 font-black text-slate-900">{ledgerRow[k].closing.toFixed(2)}</td></tr>)}
          </tbody></table>
        </div>

        {(day.creditEntries.length > 0 || day.paymentEntries.length > 0) && (
          <div className="mb-4 print:break-inside-avoid">
             <h2 className="font-black text-sm mb-1 text-slate-900 border-b-2 border-slate-900 inline-block">Credit & Payments Log</h2>
             <table className="w-full text-left mt-2 text-xs"><thead><tr className="bg-slate-200 text-slate-900"><th className="p-1">Customer</th><th className="p-1">Type</th><th className="p-1 text-right">Amount</th></tr></thead><tbody>
                 {day.creditEntries.map(e => <tr key={e.id} className="border-b"><td className="p-1 font-bold text-slate-900">{e.customerName}</td><td className="p-1 text-red-700 font-bold">Given</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
                 {day.paymentEntries.map(e => <tr key={e.id} className="border-b"><td className="p-1 font-bold text-slate-900">{e.customerName}</td><td className="p-1 text-emerald-700 font-bold">Received</td><td className="p-1 text-right font-black text-slate-900">{inr(e.amount)}</td></tr>)}
             </tbody></table>
             <div className="mt-3 flex justify-between font-black text-xs">
               <span className="bg-slate-100 px-2 py-1 rounded">Total Credit Given: {inr(creditGivenToday)}</span>
               <span className="bg-slate-100 px-2 py-1 rounded">Total Received: {inr(paymentsReceivedToday)}</span>
               <span className="bg-slate-100 px-2 py-1 rounded">Net: {inr(creditGivenToday - paymentsReceivedToday)}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Analytics Tab ============
function AnalyticsTab({ days, creditors, balances }) {
  const [filter, setFilter] = useState("7");
  
  const filteredDates = useMemo(() => {
     const sorted = Object.keys(days).sort();
     if (filter === "all") return sorted;
     return sorted.slice(-Number(filter));
  }, [days, filter]);

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
        exp += d.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
     });
     return { rev, exp };
  }, [days, filteredDates]);

  const topByBalance = useMemo(() => creditors.map(c => ({ ...c, balance: balances[c.account_number] ?? 0 })).sort((a, b) => b.balance - a.balance).slice(0, 10), [creditors, balances]);

  return (
    <div className="space-y-4">
      <div className="flex p-1 bg-slate-200 rounded-lg">
        <button onClick={() => setFilter("7")} className={`flex-1 rounded-md py-2 text-xs font-bold ${filter === "7" ? "bg-white shadow" : "text-slate-600"}`}>Last 7 Days</button>
        <button onClick={() => setFilter("30")} className={`flex-1 rounded-md py-2 text-xs font-bold ${filter === "30" ? "bg-white shadow" : "text-slate-600"}`}>Last 30 Days</button>
        <button onClick={() => setFilter("all")} className={`flex-1 rounded-md py-2 text-xs font-bold ${filter === "all" ? "bg-white shadow" : "text-slate-600"}`}>All Time</button>
      </div>

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

      <Card title="Outstanding Debtors (Top 10)">
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

  // --- CSV DATA EXPORT ---
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
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(s => s.replace(/(^"|"$)/g, '').trim());
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

        if (!newDays[isoDate]) newDays[isoDate] = emptyDay(currentRates);

        if (importType === "sales") {
            let fuelType = 'diesel';
            const fuelCol = cols[4]?.toUpperCase() || '';
            if (fuelCol === 'MS') fuelType = 'petrol';
            if (fuelCol === 'CNG') fuelType = 'cng';

            let qtyCol = parseFloat(cols[5]);
            let rateCol = parseFloat(cols[6]);

            newDays[isoDate].creditEntries.push({
              id: Date.now() + Math.random(),
              customerName: nameCol,
              accountNumber: accCol,
              fuelType,
              quantity: isNaN(qtyCol) ? 0 : qtyCol,
              rate: isNaN(rateCol) ? 0 : rateCol,
              amount: amtCol,
              remarks: "Daily CSV Import"
            });
        } else {
            newDays[isoDate].paymentEntries.push({
              id: Date.now() + Math.random(),
              customerName: nameCol,
              accountNumber: accCol,
              amount: amtCol,
              source: "CSV Import",
              remarks: "Daily CSV Import"
            });
        }
        importCount++;
      });

      setCreditors(newCreditors);
      updateDB('creditors', newCreditors);
      setDays(newDays);
      updateDB('days', newDays);
      alert(`Success! Imported ${importCount} ${importType} records.`);
    };
    reader.readAsText(file);
  };

  // --- FACTORY RESET MECHANISM ---
  const handleFactoryReset = async () => {
    if (window.confirm("WARNING: This will permanently DELETE ALL historical sales and payments from the cloud, and strictly reset every customer's balance to exactly what it was on Sept 15, 2026. Are you 100% sure?")) {
      const resetPass = window.prompt("Type RESET to confirm:");
      if (resetPass === "RESET") {
         setDays({});
         updateDB('days', {});
         setCreditors(CREDITORS_INITIAL);
         updateDB('creditors', CREDITORS_INITIAL);
         alert("Database has been successfully wiped and reset to Sept 15th balances.");
      } else {
         alert("Reset cancelled.");
      }
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
         <button onClick={exportData} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg">📥 Download Historical CSV Dump</button>
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

      <main onTouchStart={onTouchStartEvent} onTouchMove={onTouchMoveEvent} onTouchEnd={onTouchEndEvent} className="mx-auto max-w-md p-3 min-h-[70vh]">
        
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
        {tab === "ledger" && <LedgerTab days={days} creditors={creditors} />}
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