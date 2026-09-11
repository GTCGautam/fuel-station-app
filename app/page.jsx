"use client";

import { useEffect, useMemo, useState } from "react";

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

// Import 150 creditors from your Accounts Master sheet (embedded at build time)
const CREDITORS_INITIAL = [
  {
    "account_number": "21192539001",
    "name": "100 DIAL",
    "id": "21192539001",
    "opening_balance": 764.75
  },
  {
    "account_number": "21192539026",
    "name": "AADINATH TRANSPORT",
    "id": "21192539026",
    "opening_balance": 0
  },
  {
    "account_number": "21192539011",
    "name": "ABHAI JI JOSHI",
    "id": "21192539011",
    "opening_balance": 438
  },
  {
    "account_number": "21192539018",
    "name": "ABHAY JI",
    "id": "21192539018",
    "opening_balance": 453202.22
  },
  {
    "account_number": "21192539062",
    "name": "AJAY GURJAR",
    "id": "21192539062",
    "opening_balance": -58
  },
  {
    "account_number": "21192539056",
    "name": "AJJU BHAIYA MANDI",
    "id": "21192539056",
    "opening_balance": 0
  },
  {
    "account_number": "21192539129",
    "name": "akshay",
    "id": "21192539129",
    "opening_balance": 1050
  },
  {
    "account_number": "21192539086",
    "name": "ALRAZA CONSTRUCTION",
    "id": "21192539086",
    "opening_balance": 0
  },
  {
    "account_number": "21192539065",
    "name": "ANAND BHAIYA",
    "id": "21192539065",
    "opening_balance": 0
  },
  {
    "account_number": "21192539132",
    "name": "Ankit paliwal",
    "id": "21192539132",
    "opening_balance": 29355.55
  },
  {
    "account_number": "21192539120",
    "name": "Ankit Patil",
    "id": "21192539120",
    "opening_balance": 0
  },
  {
    "account_number": "21192539030",
    "name": "ANKUR BHAIYA",
    "id": "21192539030",
    "opening_balance": 11440.02
  },
  {
    "account_number": "21192539075",
    "name": "APM PROJECTS",
    "id": "21192539075",
    "opening_balance": -5000
  },
  {
    "account_number": "21192539090",
    "name": "ARIF BHAI MALWA",
    "id": "21192539090",
    "opening_balance": 0
  },
  {
    "account_number": "21192539099",
    "name": "ARJUN GURJAR SOLAR",
    "id": "21192539099",
    "opening_balance": 0
  },
  {
    "account_number": "21192539139",
    "name": "Arjun yadav",
    "id": "21192539139",
    "opening_balance": 50209.5
  },
  {
    "account_number": "21192539140",
    "name": "Ashwin upadhyay",
    "id": "21192539140",
    "opening_balance": 6727.32
  },
  {
    "account_number": "21192539136",
    "name": "Assisetant Agriculture Agar Malwa",
    "id": "21192539136",
    "opening_balance": 5033
  },
  {
    "account_number": "21192539071",
    "name": "AWADA SOLAR",
    "id": "21192539071",
    "opening_balance": 3813
  },
  {
    "account_number": "21192539013",
    "name": "AWADA SUNSHINE PVT",
    "id": "21192539013",
    "opening_balance": 69730
  },
  {
    "account_number": "21192539042",
    "name": "AWANTIKA(VINOD BAIRAGI)",
    "id": "21192539042",
    "opening_balance": 9349
  },
  {
    "account_number": "21192539121",
    "name": "Bablu chachar Elc",
    "id": "21192539121",
    "opening_balance": 42496.28
  },
  {
    "account_number": "21192539072",
    "name": "BADRI DA LADON",
    "id": "21192539072",
    "opening_balance": 5300
  },
  {
    "account_number": "21192539103",
    "name": "BAJAJ PUMP",
    "id": "21192539103",
    "opening_balance": 0
  },
  {
    "account_number": "21192539122",
    "name": "Balaji Transport",
    "id": "21192539122",
    "opening_balance": 33126.71
  },
  {
    "account_number": "21192539073",
    "name": "BALRAM GURJAR",
    "id": "21192539073",
    "opening_balance": 76261
  },
  {
    "account_number": "21192539041",
    "name": "BAUJI LADON",
    "id": "21192539041",
    "opening_balance": 923822.92
  },
  {
    "account_number": "21192539016",
    "name": "BEJNATH BUS",
    "id": "21192539016",
    "opening_balance": 196950.4
  },
  {
    "account_number": "21192539095",
    "name": "BEJNATH MAHADEV SHAHI MANDAL",
    "id": "21192539095",
    "opening_balance": 23953.8
  },
  {
    "account_number": "21192539118",
    "name": "BHARAT PRAJAPATI",
    "id": "21192539118",
    "opening_balance": 0
  },
  {
    "account_number": "21192539087",
    "name": "BHUMIKA ENTERPRISES",
    "id": "21192539087",
    "opening_balance": 0
  },
  {
    "account_number": "21192539003",
    "name": "BOI LDM 1463",
    "id": "21192539003",
    "opening_balance": 69681.8
  },
  {
    "account_number": "21192539024",
    "name": "BPCL",
    "id": "21192539024",
    "opening_balance": 4705.91
  },
  {
    "account_number": "21192539004",
    "name": "CEO SUSNER",
    "id": "21192539004",
    "opening_balance": 63411
  },
  {
    "account_number": "21192539025",
    "name": "CHAND JI PATIDAR",
    "id": "21192539025",
    "opening_balance": 485257.35
  },
  {
    "account_number": "21192539019",
    "name": "CM & HO AGAR",
    "id": "21192539019",
    "opening_balance": 77990.1
  },
  {
    "account_number": "21192539066",
    "name": "DARBAR NARAYAN SINGH",
    "id": "21192539066",
    "opening_balance": 27100
  },
  {
    "account_number": "21192539097",
    "name": "DEEPAK GURJAR",
    "id": "21192539097",
    "opening_balance": 21883.06
  },
  {
    "account_number": "21192539063",
    "name": "Dev Kali Infra",
    "id": "21192539063",
    "opening_balance": -16
  },
  {
    "account_number": "21192539040",
    "name": "DEVKARAN BHAIYA",
    "id": "21192539040",
    "opening_balance": 1751698.16
  },
  {
    "account_number": "21192539060",
    "name": "DURGESH KATARIA",
    "id": "21192539060",
    "opening_balance": 2013.2
  },
  {
    "account_number": "21192539036",
    "name": "FULL SINGH JI GURJAR",
    "id": "21192539036",
    "opening_balance": 17000
  },
  {
    "account_number": "21192539049",
    "name": "FULL SINGH JI PACHETI",
    "id": "21192539049",
    "opening_balance": 28121
  },
  {
    "account_number": "21192539085",
    "name": "GANGARAM JI SULTANPUR",
    "id": "21192539085",
    "opening_balance": 0
  },
  {
    "account_number": "21192539138",
    "name": "Gokul singh",
    "id": "21192539138",
    "opening_balance": 15999.91
  },
  {
    "account_number": "21192539021",
    "name": "GOVARDHAN GURJAR",
    "id": "21192539021",
    "opening_balance": 18015
  },
  {
    "account_number": "21192539110",
    "name": "GR INFRA SURESH JI",
    "id": "21192539110",
    "opening_balance": 0
  },
  {
    "account_number": "21192539109",
    "name": "Hardik Jain",
    "id": "21192539109",
    "opening_balance": 9920.5
  },
  {
    "account_number": "21192539102",
    "name": "HEMANT SIR AWADA",
    "id": "21192539102",
    "opening_balance": 2347
  },
  {
    "account_number": "21192539020",
    "name": "HIRALAL JI YADAV",
    "id": "21192539020",
    "opening_balance": 20248
  },
  {
    "account_number": "21192539115",
    "name": "INDOLIA COMPANY",
    "id": "21192539115",
    "opening_balance": 1.03
  },
  {
    "account_number": "21192539052",
    "name": "JAGDISH JI MANTRI JI",
    "id": "21192539052",
    "opening_balance": 113231
  },
  {
    "account_number": "21192539104",
    "name": "JAYANT CONSTRUCTION",
    "id": "21192539104",
    "opening_balance": 0
  },
  {
    "account_number": "21192539032",
    "name": "JEEVAN SINGH BINAYAGA",
    "id": "21192539032",
    "opening_balance": 3922
  },
  {
    "account_number": "21192539027",
    "name": "JEEWAN SINGH GURJAR",
    "id": "21192539027",
    "opening_balance": 3.65
  },
  {
    "account_number": "21192539074",
    "name": "JEPEE CONSTRUCTION",
    "id": "21192539074",
    "opening_balance": 1498
  },
  {
    "account_number": "21192539128",
    "name": "jila sah samanvayak agar",
    "id": "21192539128",
    "opening_balance": 0
  },
  {
    "account_number": "21192539005",
    "name": "JILA UDYOG AGAR",
    "id": "21192539005",
    "opening_balance": 1638
  },
  {
    "account_number": "21192539093",
    "name": "JITENDRA BAIRAGI",
    "id": "21192539093",
    "opening_balance": 0
  },
  {
    "account_number": "21192539145",
    "name": "K",
    "id": "21192539145",
    "opening_balance": 0
  },
  {
    "account_number": "21192539144",
    "name": "Kalash Yatra",
    "id": "21192539144",
    "opening_balance": 223022.3
  },
  {
    "account_number": "21192539033",
    "name": "KAMAL DEVELOPERS",
    "id": "21192539033",
    "opening_balance": 5992
  },
  {
    "account_number": "21192539091",
    "name": "KAMAL SINGH AWAR",
    "id": "21192539091",
    "opening_balance": 47972
  },
  {
    "account_number": "21192539034",
    "name": "KARAN MALVIYA",
    "id": "21192539034",
    "opening_balance": 600
  },
  {
    "account_number": "21192539051",
    "name": "KAVYA & TIWARI ASSOCIATES",
    "id": "21192539051",
    "opening_balance": 3622
  },
  {
    "account_number": "21192539108",
    "name": "Kedar Ji Ajmera",
    "id": "21192539108",
    "opening_balance": 3000
  },
  {
    "account_number": "21192539119",
    "name": "KESHAV TRANSPORT NARWAL",
    "id": "21192539119",
    "opening_balance": 29044.41
  },
  {
    "account_number": "21192539043",
    "name": "KOMAL CONSTRUCTION",
    "id": "21192539043",
    "opening_balance": 100001.25
  },
  {
    "account_number": "21192539137",
    "name": "Kshema Power India PVT LTD",
    "id": "21192539137",
    "opening_balance": 20505.78
  },
  {
    "account_number": "21192539146",
    "name": "L",
    "id": "21192539146",
    "opening_balance": 0
  },
  {
    "account_number": "21192539094",
    "name": "LUV KUSH",
    "id": "21192539094",
    "opening_balance": 0
  },
  {
    "account_number": "21192539147",
    "name": "M",
    "id": "21192539147",
    "opening_balance": 0
  },
  {
    "account_number": "21192539059",
    "name": "MAA CHAMUNDA",
    "id": "21192539059",
    "opening_balance": 0
  },
  {
    "account_number": "21192539046",
    "name": "MADAN SINGH JI NIPANIYA",
    "id": "21192539046",
    "opening_balance": 20.0
  },
  {
    "account_number": "21192539113",
    "name": "Mahakal Darshan",
    "id": "21192539113",
    "opening_balance": -8372
  },
  {
    "account_number": "21192539022",
    "name": "MAHENDRA SINGH JI AWAR",
    "id": "21192539022",
    "opening_balance": 0
  },
  {
    "account_number": "21192539076",
    "name": "MALWA INFRACON",
    "id": "21192539076",
    "opening_balance": 0
  },
  {
    "account_number": "21192539029",
    "name": "MANISH JI SHARMA KANAD",
    "id": "21192539029",
    "opening_balance": 5640
  },
  {
    "account_number": "21192539134",
    "name": "MANISH SONI",
    "id": "21192539134",
    "opening_balance": 18427.75
  },
  {
    "account_number": "21192539125",
    "name": "MEGA GAS",
    "id": "21192539125",
    "opening_balance": -236255.86
  },
  {
    "account_number": "21192539123",
    "name": "Mitansh Enterprises",
    "id": "21192539123",
    "opening_balance": 60179.3
  },
  {
    "account_number": "21192539089",
    "name": "MOHANLAL JI YADAV BAPCHA",
    "id": "21192539089",
    "opening_balance": 171331.36
  },
  {
    "account_number": "21192539044",
    "name": "MOONBRIGHT INFRA",
    "id": "21192539044",
    "opening_balance": 0
  },
  {
    "account_number": "21192539002",
    "name": "MS Latent Landinfra",
    "id": "21192539002",
    "opening_balance": 46.54
  },
  {
    "account_number": "21192539148",
    "name": "N",
    "id": "21192539148",
    "opening_balance": 0
  },
  {
    "account_number": "21192539038",
    "name": "NAGAR PALIKA AGAR",
    "id": "21192539038",
    "opening_balance": 2191652.82
  },
  {
    "account_number": "21192539088",
    "name": "NAPTOL MADAM",
    "id": "21192539088",
    "opening_balance": 4791
  },
  {
    "account_number": "21192539047",
    "name": "NARAYAN SINGH DUDH WAHAN",
    "id": "21192539047",
    "opening_balance": 0
  },
  {
    "account_number": "21192539055",
    "name": "NARAYAN SINGH SOLAR",
    "id": "21192539055",
    "opening_balance": 68884.45
  },
  {
    "account_number": "21192539100",
    "name": "NATRAJ CONSTRUCTION",
    "id": "21192539100",
    "opening_balance": 0
  },
  {
    "account_number": "21192539142",
    "name": "Nilesh jain",
    "id": "21192539142",
    "opening_balance": 82510.0
  },
  {
    "account_number": "21192539083",
    "name": "NILESH JI JAIN",
    "id": "21192539083",
    "opening_balance": 0
  },
  {
    "account_number": "21192539054",
    "name": "NIRVACHAN AAYOG",
    "id": "21192539054",
    "opening_balance": 60587
  },
  {
    "account_number": "21192539149",
    "name": "O",
    "id": "21192539149",
    "opening_balance": 0
  },
  {
    "account_number": "21192539006",
    "name": "OM JI GOYAL",
    "id": "21192539006",
    "opening_balance": 69935.19
  },
  {
    "account_number": "21192539124",
    "name": "Oyester Green Hybrid",
    "id": "21192539124",
    "opening_balance": 98575.35
  },
  {
    "account_number": "21192539150",
    "name": "P",
    "id": "21192539150",
    "opening_balance": 0
  },
  {
    "account_number": "21192539045",
    "name": "PANKAJ JI KOTHARI",
    "id": "21192539045",
    "opening_balance": 6184.4
  },
  {
    "account_number": "21192539048",
    "name": "PARAS GAWALI",
    "id": "21192539048",
    "opening_balance": 14789.66
  },
  {
    "account_number": "21192539077",
    "name": "PATIDAR CONSTRUCTION",
    "id": "21192539077",
    "opening_balance": 0
  },
  {
    "account_number": "21192539007",
    "name": "PHE AGAR",
    "id": "21192539007",
    "opening_balance": 231226.73
  },
  {
    "account_number": "21192539053",
    "name": "PHONEPE",
    "id": "21192539053",
    "opening_balance": 312456.1
  },
  {
    "account_number": "21192539050",
    "name": "PINTU SHARMA MP SHASHAN",
    "id": "21192539050",
    "opening_balance": 0
  },
  {
    "account_number": "21192539008",
    "name": "PIU PWD AGAR",
    "id": "21192539008",
    "opening_balance": 84796.87
  },
  {
    "account_number": "21192539070",
    "name": "PRAKASH BHAIYA boi",
    "id": "21192539070",
    "opening_balance": 14964
  },
  {
    "account_number": "21192539009",
    "name": "PRAVIN YADAV JCB",
    "id": "21192539009",
    "opening_balance": 29717
  },
  {
    "account_number": "21192539010",
    "name": "PRINCE HYUNDAI AGAR",
    "id": "21192539010",
    "opening_balance": 4143.17
  },
  {
    "account_number": "21192539057",
    "name": "PSH TECHNO ENGG",
    "id": "21192539057",
    "opening_balance": -698
  },
  {
    "account_number": "21192539130",
    "name": "Raish Bhai",
    "id": "21192539130",
    "opening_balance": 0
  },
  {
    "account_number": "21192539069",
    "name": "RAJESH JI DUDH DAIRY",
    "id": "21192539069",
    "opening_balance": 32942
  },
  {
    "account_number": "21192539133",
    "name": "ramesh sultanpura",
    "id": "21192539133",
    "opening_balance": 0.55
  },
  {
    "account_number": "21192539112",
    "name": "Richi Crane Service",
    "id": "21192539112",
    "opening_balance": 90054.89
  },
  {
    "account_number": "21192539127",
    "name": "S.K.JAIN",
    "id": "21192539127",
    "opening_balance": 0
  },
  {
    "account_number": "21192539143",
    "name": "Samir bhai elc",
    "id": "21192539143",
    "opening_balance": 3820.88
  },
  {
    "account_number": "21192539114",
    "name": "Sanghvi Removeable",
    "id": "21192539114",
    "opening_balance": 10041
  },
  {
    "account_number": "21192539107",
    "name": "Sanwaliya Wintech Pvt Ltd",
    "id": "21192539107",
    "opening_balance": 0
  },
  {
    "account_number": "21192539061",
    "name": "SATYALAKSHMI INFRACOM",
    "id": "21192539061",
    "opening_balance": 18231
  },
  {
    "account_number": "21192539028",
    "name": "SBTF DG",
    "id": "21192539028",
    "opening_balance": 45707.8
  },
  {
    "account_number": "21192539023",
    "name": "SBTF MP09H0127",
    "id": "21192539023",
    "opening_balance": 8593.8
  },
  {
    "account_number": "21192539031",
    "name": "SDM COLLECTOR OFFICE",
    "id": "21192539031",
    "opening_balance": 2372
  },
  {
    "account_number": "21192539126",
    "name": "SDO AGAR SATYALAKSHAMI",
    "id": "21192539126",
    "opening_balance": 55222.88
  },
  {
    "account_number": "21192539012",
    "name": "SDO WRD AGAR",
    "id": "21192539012",
    "opening_balance": 6706
  },
  {
    "account_number": "21192539117",
    "name": "Sethiy Company",
    "id": "21192539117",
    "opening_balance": 12722
  },
  {
    "account_number": "21192539037",
    "name": "SHIV AKYA",
    "id": "21192539037",
    "opening_balance": 0
  },
  {
    "account_number": "21192539014",
    "name": "SHIV YADAV JCB",
    "id": "21192539014",
    "opening_balance": 85647.7
  },
  {
    "account_number": "21192539015",
    "name": "SHREE MAYA AGRO AGAR",
    "id": "21192539015",
    "opening_balance": 13296
  },
  {
    "account_number": "21192539058",
    "name": "SHREYAS CIVIL",
    "id": "21192539058",
    "opening_balance": 0
  },
  {
    "account_number": "21192539078",
    "name": "SIDDHARTH BHAIYA(HARRIER)",
    "id": "21192539078",
    "opening_balance": 95075.1
  },
  {
    "account_number": "21192539082",
    "name": "SIMRAN SOLAR ENERGY",
    "id": "21192539082",
    "opening_balance": 0
  },
  {
    "account_number": "21192539098",
    "name": "SIS COMPANY",
    "id": "21192539098",
    "opening_balance": 3000
  },
  {
    "account_number": "21192539081",
    "name": "SITARAM JI GURJAR",
    "id": "21192539081",
    "opening_balance": 59132.53
  },
  {
    "account_number": "21192539106",
    "name": "SK INFRA",
    "id": "21192539106",
    "opening_balance": 0
  },
  {
    "account_number": "21192539079",
    "name": "SODAN SINGH KHEDA",
    "id": "21192539079",
    "opening_balance": 45263.72
  },
  {
    "account_number": "21192539080",
    "name": "STC MPBB",
    "id": "21192539080",
    "opening_balance": 125818.03
  },
  {
    "account_number": "21192539116",
    "name": "Sudeep Jain",
    "id": "21192539116",
    "opening_balance": 0
  },
  {
    "account_number": "21192539105",
    "name": "SUDIP KOTHARI",
    "id": "21192539105",
    "opening_balance": 0
  },
  {
    "account_number": "21192539141",
    "name": "Sundar ji yadav",
    "id": "21192539141",
    "opening_balance": 16288.8
  },
  {
    "account_number": "21192539035",
    "name": "SUNIL JI JINDAL",
    "id": "21192539035",
    "opening_balance": 89789.26
  },
  {
    "account_number": "21192539084",
    "name": "SUSNER GADI",
    "id": "21192539084",
    "opening_balance": 0
  },
  {
    "account_number": "21192539064",
    "name": "SUZLON COMPANY",
    "id": "21192539064",
    "opening_balance": 20185
  },
  {
    "account_number": "21192539067",
    "name": "SYSTEM RENWABLE",
    "id": "21192539067",
    "opening_balance": 11308
  },
  {
    "account_number": "21192539096",
    "name": "TONY NAWAL",
    "id": "21192539096",
    "opening_balance": 0
  },
  {
    "account_number": "21192539092",
    "name": "TUSHAR JI JOSHI",
    "id": "21192539092",
    "opening_balance": 0
  },
  {
    "account_number": "21192539111",
    "name": "UFILL",
    "id": "21192539111",
    "opening_balance": 708
  },
  {
    "account_number": "21192539131",
    "name": "Vaishnav tour",
    "id": "21192539131",
    "opening_balance": 8.47
  },
  {
    "account_number": "21192539101",
    "name": "Virendar shing sisodiya",
    "id": "21192539101",
    "opening_balance": 0
  },
  {
    "account_number": "21192539135",
    "name": "Virendra shing Sisodiya",
    "id": "21192539135",
    "opening_balance": 3580
  },
  {
    "account_number": "21192539039",
    "name": "VISHNU DAL MILL",
    "id": "21192539039",
    "opening_balance": 0
  },
  {
    "account_number": "21192539068",
    "name": "YASH TILE",
    "id": "21192539068",
    "opening_balance": 0
  },
  {
    "account_number": "21192539017",
    "name": "ZSK",
    "id": "21192539017",
    "opening_balance": 19216.35
  }
];

const inr = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const todayStr = () => new Date().toISOString().slice(0, 10);
const emptyDay = (rates) => ({
  fuel: { petrol: { volume: 0, rate: rates.petrol }, diesel: { volume: 0, rate: rates.diesel }, cng: { volume: 0, rate: rates.cng } },
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
function NumberField({ label, value, onChange, prefix, suffix }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-500">{label}</span>
      <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
        {prefix && <span className="pl-3 text-slate-400 text-sm select-none">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full bg-transparent py-3 px-2 text-right text-lg font-medium tabular-nums text-slate-900 outline-none"
        />
        {suffix && <span className="pr-3 text-slate-400 text-sm select-none">{suffix}</span>}
      </div>
    </label>
  );
}

function Card({ title, right, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
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
      <input
        type="text"
        value={value ? `${value.name} · ${value.account_number}` : query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={`Search ${creditors.length} customers by name or account no.`}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-slate-900"
      />
      {open && !value && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          {filtered.length === 0 && <p className="p-3 text-sm text-slate-400">No matching customer.</p>}
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onChange(c);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-800">{c.name}</span>
              <span className="text-xs text-slate-400">{c.account_number}</span>
            </button>
          ))}
          {!query && <p className="border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-400">Type to search all.</p>}
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
  const updateRate = (key, val) => {
    update({ fuel: { ...day.fuel, [key]: { ...day.fuel[key], rate: val } } });
    setRate(key, val);
  };
  const updateCollection = (key, val) => update({ collections: { ...day.collections, [key]: val } });
  const addExpense = () =>
    update({ expenses: [...day.expenses, { id: Date.now(), category: (typeof window !== "undefined" && window.__expenseCategories) ? window.__expenseCategories[0] : "Misc", amount: 0, remarks: "" }] });
  const updateExpense = (id, field, val) => update({ expenses: day.expenses.map((e) => (e.id === id ? { ...e, [field]: val } : e)) });
  const removeExpense = (id) => update({ expenses: day.expenses.filter((e) => e.id !== id) });

  return (
    <div className="space-y-5">
      <Card title="Fuel sales">
        <p className="mb-3 -mt-1 text-xs text-slate-400">Rate carries forward — edit and it updates everywhere instantly.</p>
        <div className="space-y-4">
          {FUEL_KEYS.map((k) => (
            <div key={k} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${FUEL_ACCENT[k]}`} />
                <span className="text-sm font-medium text-slate-800">{FUEL_LABEL[k]}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label={`Volume (${FUEL_UNIT[k]})`} value={day.fuel[k].volume} onChange={(v) => updateVolume(k, v)} />
                <NumberField label="Rate" prefix="₹" value={day.fuel[k].rate} onChange={(v) => updateRate(k, v)} />
              </div>
              <p className="mt-2 text-right text-sm text-slate-500">
                Amount: <span className="font-medium text-slate-800">{inr(day.fuel[k].volume * day.fuel[k].rate)}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3">
          <span className="text-sm text-slate-300">Total revenue</span>
          <span className="text-xl font-semibold tabular-nums text-white">{inr(totalRevenue)}</span>
        </div>
      </Card>

      <Card title="Collections">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Cash — by shift</p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Morning" prefix="₹" value={day.collections.cashMorning} onChange={(v) => updateCollection("cashMorning", v)} />
          <NumberField label="Evening" prefix="₹" value={day.collections.cashEvening} onChange={(v) => updateCollection("cashEvening", v)} />
        </div>
        <p className="mt-2 text-right text-sm text-slate-500">
          Cash total: <span className="font-medium text-slate-800">{inr(cashTotal)}</span>
        </p>
        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">Online</p>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="PhonePe" prefix="₹" value={day.collections.phonepe} onChange={(v) => updateCollection("phonepe", v)} />
          <NumberField label="Card" prefix="₹" value={day.collections.creditCard} onChange={(v) => updateCollection("creditCard", v)} />
        </div>
        <div className="mt-3">
          <NumberField label="Other online (BPCL / UFILL etc.)" prefix="₹" value={day.collections.otherOnline} onChange={(v) => updateCollection("otherOnline", v)} />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-100 px-4 py-2.5">
          <span className="text-sm text-slate-600">Total collected</span>
          <span className="font-semibold tabular-nums text-slate-900">{inr(totalCollected)}</span>
        </div>
      </Card>

      <Card title="Credit & payments" right={<button onClick={onGoToCredit} className="text-xs font-medium text-sky-700 underline underline-offset-2">Open workflow</button>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-100 px-4 py-2.5">
            <p className="text-xs text-slate-500">Credit given</p>
            <p className="font-semibold tabular-nums text-slate-900">{inr(creditGivenToday)}</p>
          </div>
          <div className="rounded-lg bg-slate-100 px-4 py-2.5">
            <p className="text-xs text-slate-500">Payments received</p>
            <p className="font-semibold tabular-nums text-slate-900">{inr(paymentsReceivedToday)}</p>
          </div>
        </div>
      </Card>

      <Card title="Expenses">
        <div className="space-y-3">
          {day.expenses.map((e) => (
            <div key={e.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <select value={e.category} onChange={(ev) => updateExpense(e.id, "category", ev.target.value)} className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800">
                  {(typeof window !== "undefined" && window.__expenseCategories ? window.__expenseCategories : DEFAULT_EXPENSE_CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => removeExpense(e.id)} aria-label="Remove expense" className="px-2 text-slate-400">✕</button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <NumberField label="Amount" prefix="₹" value={e.amount} onChange={(v) => updateExpense(e.id, "amount", v)} />
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-500">Remarks</span>
                  <input type="text" value={e.remarks} onChange={(ev) => updateExpense(e.id, "remarks", ev.target.value)} placeholder="Optional" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-slate-900" />
                </label>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addExpense} className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500">+ Add expense</button>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-100 px-4 py-2.5">
          <span className="text-sm text-slate-600">Total expenses</span>
          <span className="font-semibold tabular-nums text-slate-900">{inr(totalExpenses)}</span>
        </div>
      </Card>

      <section className={`rounded-xl border p-4 ${balanced ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Collections + credit + expenses</span>
          <span className="font-medium tabular-nums text-slate-900">{inr(accountedFor)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-slate-600">Total revenue</span>
          <span className="font-medium tabular-nums text-slate-900">{inr(totalRevenue)}</span>
        </div>
        <div className="mt-2 border-t border-black/5 pt-2 text-sm font-semibold">
          {balanced ? <span className="text-emerald-700">Balanced ✓</span> : diff > 0 ? <span className="text-amber-700">{inr(diff)} short</span> : <span className="text-amber-700">{inr(Math.abs(diff))} extra</span>}
        </div>
      </section>
    </div>
  );
}

// ============ Credit tab (give + receive) ============
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

  const chooseFuel = (k) => {
    setFuelType(k);
    setRate(currentRates[k]);
  };

  const amount = quantity * rate;
  const canAdd = customer && quantity > 0 && rate > 0;
  const creditTotal = day.creditEntries.reduce((s, e) => s + e.amount, 0);
  const paymentTotal = day.paymentEntries.reduce((s, e) => s + e.amount, 0);

  const addCreditEntry = () => {
    if (!canAdd) return;
    update({ creditEntries: [{ id: Date.now(), customerName: customer.name, accountNumber: customer.account_number, fuelType, quantity, rate, amount, remarks }, ...day.creditEntries] });
    setCustomer(null);
    setQuantity(0);
    setRemarks("");
  };
  const removeCreditEntry = (id) => update({ creditEntries: day.creditEntries.filter((e) => e.id !== id) });

  const canPay = payCustomer && payAmount > 0;
  const addPayment = () => {
    if (!canPay) return;
    update({ paymentEntries: [{ id: Date.now(), customerName: payCustomer.name, accountNumber: payCustomer.account_number, amount: payAmount, source: paySource, remarks: payRemarks }, ...day.paymentEntries] });
    setPayCustomer(null);
    setPayAmount(0);
    setPayRemarks("");
  };
  const removePayment = (id) => update({ paymentEntries: day.paymentEntries.filter((e) => e.id !== id) });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-1">
        <button onClick={() => setMode("give")} className={`rounded-lg py-2 text-sm font-medium ${mode === "give" ? "bg-slate-900 text-white" : "text-slate-500"}`}>Give credit</button>
        <button onClick={() => setMode("receive")} className={`rounded-lg py-2 text-sm font-medium ${mode === "receive" ? "bg-slate-900 text-white" : "text-slate-500"}`}>Receive payment</button>
      </div>

      {mode === "give" ? (
        <>
          <Card title="Log credit entry">
            <label className="mb-3 block">
              <span className="mb-1 block text-sm text-slate-500">Customer</span>
              <CustomerPicker value={customer} onChange={setCustomer} creditors={creditors} />
            </label>
            {customer && <p className="mb-3 -mt-2 text-xs text-slate-500">Current balance: <span className="font-medium text-slate-800">{inr(balances[customer.account_number] ?? 0)}</span></p>}
            <label className="mb-3 block">
              <span className="mb-1 block text-sm text-slate-500">Fuel</span>
              <div className="grid grid-cols-3 gap-2">
                {FUEL_KEYS.map((k) => (
                  <button key={k} onClick={() => chooseFuel(k)} className={`rounded-lg border py-2 text-sm font-medium ${fuelType === k ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600"}`}>{FUEL_LABEL[k]}</button>
                ))}
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Quantity" value={quantity} onChange={setQuantity} />
              <NumberField label="Rate" prefix="₹" value={rate} onChange={setRate} />
            </div>
            <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks (optional)" className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900" />
            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-100 px-4 py-2.5">
              <span className="text-sm text-slate-600">Amount</span>
              <span className="font-semibold tabular-nums text-slate-900">{inr(amount)}</span>
            </div>
            <button onClick={addCreditEntry} disabled={!canAdd} className="mt-3 w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white disabled:opacity-40">Add entry</button>
          </Card>
          <Card title={`Today's credit entries (${day.creditEntries.length})`}>
            {day.creditEntries.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No credit logged yet.</p> : <ul className="divide-y divide-slate-100">{day.creditEntries.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.customerName}</p>
                  <p className="text-xs text-slate-400">{FUEL_LABEL[e.fuelType]} · {e.quantity} @ ₹{e.rate}{e.remarks ? ` · ${e.remarks}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-slate-900">{inr(e.amount)}</span>
                  <button onClick={() => removeCreditEntry(e.id)} aria-label="Remove entry" className="text-slate-400">✕</button>
                </div>
              </li>
            ))}</ul>}
          </Card>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-sm text-slate-500">Total credit given today</span>
            <span className="text-lg font-semibold tabular-nums text-slate-900">{inr(creditTotal)}</span>
          </div>
        </>
      ) : (
        <>
          <Card title="Receive payment">
            <label className="mb-3 block">
              <span className="mb-1 block text-sm text-slate-500">Customer</span>
              <CustomerPicker value={payCustomer} onChange={setPayCustomer} creditors={creditors} />
            </label>
            {payCustomer && <p className="mb-3 -mt-2 text-xs text-slate-500">Current balance: <span className="font-medium text-slate-800">{inr(balances[payCustomer.account_number] ?? 0)}</span></p>}
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Amount received" prefix="₹" value={payAmount} onChange={setPayAmount} />
              <label className="block">
                <span className="mb-1 block text-sm text-slate-500">Source</span>
                <select value={paySource} onChange={(e) => setPaySource(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-3 text-sm text-slate-800">
                  {(typeof window !== "undefined" && window.__creditSources ? window.__creditSources : DEFAULT_CREDIT_SOURCES).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <input type="text" value={payRemarks} onChange={(e) => setPayRemarks(e.target.value)} placeholder="Remarks (optional)" className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900" />
            <button onClick={addPayment} disabled={!canPay} className="mt-3 w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white disabled:opacity-40">Record payment</button>
          </Card>
          <Card title={`Today's payments (${day.paymentEntries.length})`}>
            {day.paymentEntries.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No payments logged yet.</p> : <ul className="divide-y divide-slate-100">{day.paymentEntries.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-800">{e.customerName}</p>
                  <p className="text-xs text-slate-400">{e.source}{e.remarks ? ` · ${e.remarks}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-emerald-700">{inr(e.amount)}</span>
                  <button onClick={() => removePayment(e.id)} aria-label="Remove entry" className="text-slate-400">✕</button>
                </div>
              </li>
            ))}</ul>}
          </Card>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="text-sm text-slate-500">Total received today</span>
            <span className="text-lg font-semibold tabular-nums text-emerald-700">{inr(paymentTotal)}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ============ Stock tab ============
function StockTab({ day, update, ledgerRow, hasPreviousDay }) {
  const [fuel, setFuel] = useState("diesel");
  const [quantity, setQuantity] = useState(0);
  const [supplier, setSupplier] = useState("");

  const addReceiving = () => {
    if (quantity <= 0) return;
    update({ stock: { ...day.stock, receiving: [{ id: Date.now(), fuel, quantity, supplier }, ...day.stock.receiving] } });
    setQuantity(0);
    setSupplier("");
  };
  const removeReceiving = (id) => update({ stock: { ...day.stock, receiving: day.stock.receiving.filter((r) => r.id !== id) } });
  const setOpeningOverride = (fuelKey, val) =>
    update({ stock: { ...day.stock, openingOverride: { ...day.stock.openingOverride, [fuelKey]: val === "" ? null : Number(val) } } });

  return (
    <div className="space-y-5">
      {!hasPreviousDay && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">Set opening stock manually today. Tomorrow it carries forward automatically from closing.</div>}
      <Card title="Stock — Petrol & Diesel">
        <div className="grid grid-cols-2 gap-3">
          {STOCK_FUELS.map((k) => (
            <div key={k} className="rounded-lg border border-slate-100 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${FUEL_ACCENT[k]}`} />
                <span className="text-sm font-medium text-slate-800">{FUEL_LABEL[k]}</span>
              </div>
              {hasPreviousDay ? (
                <p className="text-xs text-slate-500">Opening: <span className="font-medium text-slate-800">{ledgerRow[k].opening.toFixed(2)} L</span></p>
              ) : (
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500">Opening stock (L)</span>
                  <input type="number" value={day.stock.openingOverride[k] ?? ""} onChange={(e) => setOpeningOverride(k, e.target.value)} placeholder="0" className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm tabular-nums outline-none focus:border-slate-900" />
                </label>
              )}
              <p className="mt-1 text-xs text-slate-500">Received: <span className="font-medium text-slate-800">{ledgerRow[k].received.toFixed(2)} L</span></p>
              <p className="mt-1 text-xs text-slate-500">Sold: <span className="font-medium text-slate-800">{ledgerRow[k].sold.toFixed(2)} L</span></p>
              <div className="mt-2 rounded-md bg-slate-900 px-2 py-2 text-center">
                <p className="text-[11px] text-slate-300">Closing stock</p>
                <p className="text-base font-semibold tabular-nums text-white">{ledgerRow[k].closing.toFixed(2)} L</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Fuel receiving (tanker delivery)">
        <label className="mb-3 block">
          <span className="mb-1 block text-sm text-slate-500">Fuel</span>
          <div className="grid grid-cols-2 gap-2">
            {STOCK_FUELS.map((k) => (
              <button key={k} onClick={() => setFuel(k)} className={`rounded-lg border py-2 text-sm font-medium ${fuel === k ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600"}`}>{FUEL_LABEL[k]}</button>
            ))}
          </div>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Quantity received (L)" value={quantity} onChange={setQuantity} />
          <label className="block">
            <span className="mb-1 block text-sm text-slate-500">Supplier / invoice</span>
            <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Optional" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900" />
          </label>
        </div>
        <button onClick={addReceiving} disabled={quantity <= 0} className="mt-3 w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white disabled:opacity-40">Add receiving entry</button>
        {day.stock.receiving.length > 0 && <ul className="mt-4 divide-y divide-slate-100">{day.stock.receiving.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-800">{FUEL_LABEL[r.fuel]}</p>
              {r.supplier && <p className="text-xs text-slate-400">{r.supplier}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tabular-nums text-slate-900">{r.quantity} L</span>
              <button onClick={() => removeReceiving(r.id)} aria-label="Remove" className="text-slate-400">✕</button>
            </div>
          </li>
        ))}</ul>}
      </Card>
    </div>
  );
}

// ============ Report tab (printable / downloadable) ============
function ReportTab({ currentDate, day, ledgerRow, creditGivenToday, paymentsReceivedToday, balances, creditors }) {
  const totalRevenue = FUEL_KEYS.reduce((s, k) => s + day.fuel[k].volume * day.fuel[k].rate, 0);
  const cashTotal = day.collections.cashMorning + day.collections.cashEvening;
  const onlineTotal = day.collections.phonepe + day.collections.creditCard + day.collections.otherOnline;
  const totalCollected = cashTotal + onlineTotal;
  const totalExpenses = day.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const handlePrint = () => typeof window !== "undefined" && window.print();
  const handleDownload = async () => {
    if (typeof window === "undefined") return;
    const html = document.getElementById("report-content").outerHTML;
    const dataStr = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    const link = document.createElement("a");
    link.href = dataStr;
    link.download = `SBTF_Report_${currentDate}.html`;
    link.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <button onClick={handlePrint} className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-800">🖨️ Print</button>
        <button onClick={handleDownload} className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-800">⬇️ Download HTML</button>
      </div>

      <div id="report-content" className="rounded-xl border border-slate-200 bg-white p-8 text-sm print:p-0 print:border-0">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Shree Balaji Tirupati Fuels</h1>
          <p className="mt-1 text-xs text-slate-500">Daily Operations Report</p>
          <p className="text-base font-semibold text-slate-700">{currentDate}</p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Revenue</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{inr(totalRevenue)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Collected</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{inr(totalCollected)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total Expenses</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{inr(totalExpenses)}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-base font-bold text-slate-800">Fuel Sales</h2>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-2 py-2 font-semibold text-slate-700">Fuel</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700">Volume</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700">Rate</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {FUEL_KEYS.map((k) => (
                <tr key={k} className="border-b border-slate-100">
                  <td className="px-2 py-2">{FUEL_LABEL[k]}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{day.fuel[k].volume}</td>
                  <td className="px-2 py-2 text-right tabular-nums">₹{day.fuel[k].rate}</td>
                  <td className="px-2 py-2 text-right tabular-nums font-semibold">{inr(day.fuel[k].volume * day.fuel[k].rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-base font-bold text-slate-800">Collections</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-slate-500">Cash (Morning)</span>: <span className="font-semibold">{inr(day.collections.cashMorning)}</span></div>
            <div><span className="text-slate-500">Cash (Evening)</span>: <span className="font-semibold">{inr(day.collections.cashEvening)}</span></div>
            <div><span className="text-slate-500">PhonePe</span>: <span className="font-semibold">{inr(day.collections.phonepe)}</span></div>
            <div><span className="text-slate-500">Card</span>: <span className="font-semibold">{inr(day.collections.creditCard)}</span></div>
            <div><span className="text-slate-500">Other Online</span>: <span className="font-semibold">{inr(day.collections.otherOnline)}</span></div>
            <div><span className="text-slate-500 font-bold">Total</span>: <span className="font-bold text-slate-900">{inr(totalCollected)}</span></div>
          </div>
        </div>

        {day.expenses.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-base font-bold text-slate-800">Expenses</h2>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-2 py-2 font-semibold text-slate-700">Category</th>
                  <th className="px-2 py-2 text-right font-semibold text-slate-700">Amount</th>
                  <th className="px-2 py-2 font-semibold text-slate-700">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {day.expenses.filter((e) => e.amount > 0).map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="px-2 py-2">{e.category}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{inr(e.amount)}</td>
                    <td className="px-2 py-2 text-xs text-slate-500">{e.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-6">
          <h2 className="mb-2 text-base font-bold text-slate-800">Stock (Petrol & Diesel)</h2>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-2 py-2 font-semibold text-slate-700">Fuel</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700">Opening</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700">Received</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700">Sold</th>
                <th className="px-2 py-2 text-right font-semibold text-slate-700">Closing</th>
              </tr>
            </thead>
            <tbody>
              {STOCK_FUELS.map((k) => (
                <tr key={k} className="border-b border-slate-100">
                  <td className="px-2 py-2 font-medium">{FUEL_LABEL[k]}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{ledgerRow[k].opening.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{ledgerRow[k].received.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{ledgerRow[k].sold.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right tabular-nums font-bold">{ledgerRow[k].closing.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(day.creditEntries.length > 0 || day.paymentEntries.length > 0) && (
          <div className="mb-6">
            <h2 className="mb-2 text-base font-bold text-slate-800">Credit & Payments Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-slate-600">Credit Given</p>
                <p className="text-lg font-bold text-slate-900">{inr(creditGivenToday)}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-slate-600">Payments Received</p>
                <p className="text-lg font-bold text-slate-900">{inr(paymentsReceivedToday)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-slate-600">Net Credit Balance</p>
                <p className="text-lg font-bold text-slate-900">{inr(creditGivenToday - paymentsReceivedToday)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// ============ Analytics tab ============
function AnalyticsTab({ days, creditors, balances }) {
  const allCreditEntries = useMemo(() => Object.values(days).flatMap((d) => d.creditEntries), [days]);
  const allPaymentEntries = useMemo(() => Object.values(days).flatMap((d) => d.paymentEntries), [days]);
  const allExpenses = useMemo(() => Object.values(days).flatMap((d) => d.expenses), [days]);

  // Top 10 creditors by credit given
  const creditorCredit = useMemo(() => {
    const map = {};
    allCreditEntries.forEach((e) => {
      map[e.accountNumber] = (map[e.accountNumber] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .map(([acc, amount]) => ({ accountNumber: acc, amount, name: allCreditEntries.find((e) => e.accountNumber === acc)?.customerName }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [allCreditEntries]);

  // Top 10 creditors by outstanding balance
  const topByBalance = useMemo(() => {
    return creditors
      .map((c) => ({ ...c, balance: balances[c.account_number] ?? 0 }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);
  }, [creditors, balances]);

  // Expense breakdown
  const expensesByCategory = useMemo(() => {
    const map = {};
    allExpenses.forEach((e) => {
      if (e.amount > 0) {
        map[e.category] = (map[e.category] ?? 0) + e.amount;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allExpenses]);

  // Total fuel sales by type
  const fuelSales = useMemo(() => {
    const totals = { petrol: 0, diesel: 0, cng: 0 };
    Object.values(days).forEach((d) => {
      FUEL_KEYS.forEach((k) => {
        totals[k] += d.fuel[k].volume * d.fuel[k].rate;
      });
    });
    return totals;
  }, [days]);

  const totalCreditGiven = creditorCredit.reduce((s, c) => s + c.amount, 0);
  const totalPaymentsReceived = allPaymentEntries.reduce((s, e) => s + e.amount, 0);
  const totalExpensesAmount = allExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalOutstandingBalance = Object.values(balances).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">
      <Card title="Summary metrics">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total credit given (all dates)</p>
            <p className="mt-1 font-bold text-slate-900">{inr(totalCreditGiven)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Payments received (all dates)</p>
            <p className="mt-1 font-bold text-slate-900">{inr(totalPaymentsReceived)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total expenses (all dates)</p>
            <p className="mt-1 font-bold text-slate-900">{inr(totalExpensesAmount)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Outstanding credit balance</p>
            <p className="mt-1 font-bold text-slate-900">{inr(totalOutstandingBalance)}</p>
          </div>
        </div>
      </Card>

      <Card title="Total fuel sales (amount in ₹)">
        <div className="space-y-2 text-sm">
          {FUEL_KEYS.map((k) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-slate-600">{FUEL_LABEL[k]}</span>
              <span className="font-semibold text-slate-900">{inr(fuelSales[k])}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Top 10 customers by credit given (this session)">
        {creditorCredit.length === 0 ? (
          <p className="text-sm text-slate-400">No credit entries yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {creditorCredit.map((c, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="text-slate-800">{c.name}</span>
                <span className="font-semibold text-slate-900">{inr(c.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Top 10 customers by outstanding balance">
        <ul className="divide-y divide-slate-100 text-sm">
          {topByBalance.map((c, i) => (
            <li key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400">Acc: {c.account_number}</p>
              </div>
              <span className={`font-semibold ${c.balance > 0 ? "text-red-700" : "text-emerald-700"}`}>{inr(c.balance)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Expenses by category">
        {expensesByCategory.length === 0 ? (
          <p className="text-sm text-slate-400">No expenses logged yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {expensesByCategory.map(([category, amount]) => (
              <li key={category} className="flex items-center justify-between py-2">
                <span className="text-slate-800">{category}</span>
                <span className="font-semibold text-slate-900">{inr(amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ============ Admin tab ============
function AdminTab({ creditors, setCreditors, expenseCategories, setExpenseCategories, creditSources, setCreditSources, currentRates, setRate }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newCreditorName, setNewCreditorName] = useState("");
  const [newCreditorBalance, setNewCreditorBalance] = useState("");
  const [bulkImportText, setBulkImportText] = useState("");
  const [importMode, setImportMode] = useState("add"); // 'add' | 'replace'

  if (!unlocked) {
    return (
      <Card title="Admin access">
        <p className="mb-3 text-sm text-slate-500">Enter the admin passcode to manage settings.</p>
        <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Passcode" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900" />
        <button onClick={() => passcode === ADMIN_PASSCODE && setUnlocked(true)} className="mt-3 w-full rounded-lg bg-slate-900 py-3 text-sm font-medium text-white">Unlock</button>
        {passcode && passcode !== ADMIN_PASSCODE && <p className="mt-2 text-xs text-red-600">Incorrect.</p>}
      </Card>
    );
  }

  const addCategory = () => {
    const v = newCategory.trim();
    if (!v || expenseCategories.includes(v)) return;
    setExpenseCategories([...expenseCategories, v]);
    setNewCategory("");
  };
  const removeCategory = (c) => setExpenseCategories(expenseCategories.filter((x) => x !== c));
  const addSource = () => {
    const v = newSource.trim();
    if (!v || creditSources.includes(v)) return;
    setCreditSources([...creditSources, v]);
    setNewSource("");
  };
  const removeSource = (s) => setCreditSources(creditSources.filter((x) => x !== s));

  const addCreditor = () => {
    const name = newCreditorName.trim();
    const balance = Number(newCreditorBalance) || 0;
    if (!name) return;
    const newAcc = String(Math.max(...creditors.map((c) => parseInt(c.account_number)), 21192539999) + 1);
    setCreditors([...creditors, { id: newAcc, account_number: newAcc, name, opening_balance: balance }]);
    setNewCreditorName("");
    setNewCreditorBalance("");
  };

  const bulkImport = () => {
    if (!bulkImportText.trim()) return;
    const lines = bulkImportText.trim().split("\n");
    const imported = [];
    lines.forEach((line) => {
      const [acc, name, balance] = line.split(",").map((s) => s.trim());
      if (acc && name) {
        imported.push({ id: acc, account_number: acc, name, opening_balance: Number(balance) || 0 });
      }
    });
    if (importMode === "replace") {
      setCreditors(imported);
    } else {
      const existing = creditors.map((c) => c.account_number);
      setCreditors([...creditors, ...imported.filter((i) => !existing.includes(i.account_number))]);
    }
    setBulkImportText("");
  };

  const exportCreditors = () => {
    if (typeof window === "undefined") return;
    const csv = creditors.map((c) => `${c.account_number},"${c.name}",${c.opening_balance}`).join("\n");
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent("AccountNumber,Name,OutstandingBalance\n" + csv);
    link.download = "SBTF_Creditors.csv";
    link.click();
  };

  return (
    <div className="space-y-5">
      <Card title="Fuel rates">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Petrol" prefix="₹" value={currentRates.petrol} onChange={(v) => setRate("petrol", v)} />
          <NumberField label="Diesel" prefix="₹" value={currentRates.diesel} onChange={(v) => setRate("diesel", v)} />
        </div>
        <div className="mt-3">
          <NumberField label="CNG" prefix="₹" value={currentRates.cng} onChange={(v) => setRate("cng", v)} />
        </div>
      </Card>

      <Card title="Customer list management">
        <p className="mb-3 text-xs text-slate-500">Total customers: {creditors.length}</p>
        <div className="mb-3 flex gap-2">
          <input type="text" value={newCreditorName} onChange={(e) => setNewCreditorName(e.target.value)} placeholder="Customer name" className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900" />
          <input type="number" value={newCreditorBalance} onChange={(e) => setNewCreditorBalance(e.target.value)} placeholder="Balance" className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:border-slate-900" />
          <button onClick={addCreditor} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white">Add</button>
        </div>
        <button onClick={exportCreditors} className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-800">📥 Export as CSV</button>
      </Card>

      <Card title="Bulk import creditors">
        <p className="mb-2 text-xs text-slate-500">Format: account_number,name,balance (one per line)</p>
        <label className="mb-2 block">
          <span className="text-xs text-slate-500">Mode:</span>
          <div className="mt-1 flex gap-2">
            <button onClick={() => setImportMode("add")} className={`text-xs py-1 px-2 rounded ${importMode === "add" ? "bg-slate-900 text-white" : "border border-slate-300"}`}>Add to existing</button>
            <button onClick={() => setImportMode("replace")} className={`text-xs py-1 px-2 rounded ${importMode === "replace" ? "bg-slate-900 text-white" : "border border-slate-300"}`}>Replace all</button>
          </div>
        </label>
        <textarea value={bulkImportText} onChange={(e) => setBulkImportText(e.target.value)} placeholder="21192539001,Customer Name,15000&#10;21192539002,Another Customer,25000" rows={4} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono outline-none focus:border-slate-900" />
        <button onClick={bulkImport} className="mt-2 w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white">Import</button>
      </Card>

      <Card title="Expense categories">
        <ul className="mb-3 divide-y divide-slate-100">
          {expenseCategories.map((c) => (
            <li key={c} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-800">{c}</span>
              <button onClick={() => removeCategory(c)} className="text-xs text-red-600">Remove</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category" className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900" />
          <button onClick={addCategory} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add</button>
        </div>
      </Card>

      <Card title="Payment sources">
        <ul className="mb-3 divide-y divide-slate-100">
          {creditSources.map((s) => (
            <li key={s} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-800">{s}</span>
              <button onClick={() => removeSource(s)} className="text-xs text-red-600">Remove</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input type="text" value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="New source" className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900" />
          <button onClick={addSource} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Add</button>
        </div>
      </Card>
    </div>
  );
}

// ============ App ============
export default function App() {
  const [currentDate, setCurrentDate] = useState(todayStr());
  const [currentRates, setCurrentRates] = useState(DEFAULT_RATES);
  const [days, setDays] = useState(() => ({ [todayStr()]: emptyDay(DEFAULT_RATES) }));
  const [tab, setTab] = useState("sales");
  const [creditors, setCreditors] = useState(CREDITORS_INITIAL);
  const [expenseCategories, setExpenseCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);
  const [creditSources, setCreditSources] = useState(DEFAULT_CREDIT_SOURCES);

  // Safely assign to window for sub-components without crashing SSR
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__expenseCategories = expenseCategories;
      window.__creditSources = creditSources;
    }
  }, [expenseCategories, creditSources]);

  useEffect(() => {
    setDays((prev) => (prev[currentDate] ? prev : { ...prev, [currentDate]: emptyDay(currentRates) }));
  }, [currentDate, currentRates]);

  const day = days[currentDate] || emptyDay(currentRates);
  const update = (patch) => setDays((prev) => ({ ...prev, [currentDate]: { ...(prev[currentDate] || emptyDay(currentRates)), ...patch } }));
  const setRate = (fuelKey, val) => setCurrentRates((prev) => ({ ...prev, [fuelKey]: val }));

  const ledger = useMemo(() => computeStockLedger(days), [days]);
  const ledgerRow = ledger[currentDate] || { petrol: { opening: 0, received: 0, sold: 0, closing: 0 }, diesel: { opening: 0, received: 0, sold: 0, closing: 0 } };
  const hasPreviousDay = Object.keys(days).sort().indexOf(currentDate) > 0;

  const creditGivenToday = day.creditEntries.reduce((s, e) => s + e.amount, 0);
  const paymentsReceivedToday = day.paymentEntries.reduce((s, e) => s + e.amount, 0);

  const balances = useMemo(() => {
    const map = {};
    creditors.forEach((c) => (map[c.account_number] = c.opening_balance));
    Object.values(days).forEach((d) => {
      d.creditEntries.forEach((e) => {
        map[e.accountNumber] = (map[e.accountNumber] ?? 0) + e.amount;
      });
      d.paymentEntries.forEach((e) => {
        map[e.accountNumber] = (map[e.accountNumber] ?? 0) - e.amount;
      });
    });
    return map;
  }, [days, creditors]);

  const totalOutstandingCredit = useMemo(() => Object.values(balances).reduce((s, v) => s + v, 0), [balances]);

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
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Shree Balaji Tirupati Fuels</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">{TABS.find((t) => t.key === tab)?.label}</h1>
          {tab !== "admin" && tab !== "analytics" && (
            <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700" />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-5">
        {tab === "sales" && <SalesTab day={day} update={update} currentRates={currentRates} setRate={setRate} creditGivenToday={creditGivenToday} paymentsReceivedToday={paymentsReceivedToday} onGoToCredit={() => setTab("credit")} />}
        {tab === "credit" && <CreditTab day={day} update={update} currentRates={currentRates} balances={balances} creditors={creditors} />}
        {tab === "stock" && <StockTab day={day} update={update} ledgerRow={ledgerRow} hasPreviousDay={hasPreviousDay} />}
        {tab === "report" && <ReportTab currentDate={currentDate} day={day} ledgerRow={ledgerRow} creditGivenToday={creditGivenToday} paymentsReceivedToday={paymentsReceivedToday} balances={balances} creditors={creditors} />}
        {tab === "analytics" && <AnalyticsTab days={days} creditors={creditors} balances={balances} />}
        {tab === "admin" && <AdminTab creditors={creditors} setCreditors={setCreditors} expenseCategories={expenseCategories} setExpenseCategories={setExpenseCategories} creditSources={creditSources} setCreditSources={setCreditSources} currentRates={currentRates} setRate={setRate} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-md grid-cols-6 text-[10px]">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`py-3 text-center font-medium ${tab === t.key ? "text-slate-900" : "text-slate-400"}`}>{t.label}</button>
          ))}
        </div>
      </nav>
    </div>
  );
}