"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectToken, selectUser } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import {
  FileText, Save, ChevronDown, ChevronUp,
  CheckCircle, Loader2, Plus, X, Search,
  Pill, Activity, ClipboardList, FlaskConical
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Medication {
  id: string;
  drugName: string;
  genericName: string;
  dose: string;
  frequency: string;
  frequencyCustom: string;
  durationDays: number;
  route: string;
  notes: string;
}

interface DrugResult {
  brandName: string;
  genericName: string;
}

interface Props {
  appointmentId: number;
  onSaveFinal: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FREQUENCIES = [
  { label: "OD — Once daily",    value: "OD" },
  { label: "BD — Twice daily",   value: "BD" },
  { label: "TDS — Three times",  value: "TDS" },
  { label: "QID — Four times",   value: "QID" },
  { label: "SOS — As needed",    value: "SOS" },
  { label: "OW — Once weekly",   value: "OW" },
  { label: "HS — At bedtime",    value: "HS" },
  { label: "AC — Before meals",  value: "AC" },
  { label: "PC — After meals",   value: "PC" },
  { label: "Custom...",          value: "CUSTOM" },
];


const INDIAN_MEDICINES: DrugResult[] = [
  // Analgesics / Antipyretics
  { brandName: "Paracetamol 500mg", genericName: "Acetaminophen" },
  { brandName: "Dolo 650", genericName: "Paracetamol" },
  { brandName: "Crocin 500mg", genericName: "Paracetamol" },
  { brandName: "Combiflam", genericName: "Ibuprofen + Paracetamol" },
  { brandName: "Ibuprofen 400mg", genericName: "Ibuprofen" },
  { brandName: "Brufen 400mg", genericName: "Ibuprofen" },
  { brandName: "Voveran 50mg", genericName: "Diclofenac Sodium" },
  { brandName: "Diclofenac 50mg", genericName: "Diclofenac Sodium" },
  { brandName: "Nimesulide 100mg", genericName: "Nimesulide" },
  { brandName: "Nise 100mg", genericName: "Nimesulide" },

  // Antibiotics
  { brandName: "Amoxicillin 500mg", genericName: "Amoxicillin" },
  { brandName: "Augmentin 625mg", genericName: "Amoxicillin + Clavulanate" },
  { brandName: "Azithromycin 500mg", genericName: "Azithromycin" },
  { brandName: "Zithromax 500mg", genericName: "Azithromycin" },
  { brandName: "Ciprofloxacin 500mg", genericName: "Ciprofloxacin" },
  { brandName: "Ciplox 500mg", genericName: "Ciprofloxacin" },
  { brandName: "Metronidazole 400mg", genericName: "Metronidazole" },
  { brandName: "Flagyl 400mg", genericName: "Metronidazole" },
  { brandName: "Doxycycline 100mg", genericName: "Doxycycline" },
  { brandName: "Cefixime 200mg", genericName: "Cefixime" },
  { brandName: "Taxim-O 200mg", genericName: "Cefixime" },
  { brandName: "Cetirizine 10mg", genericName: "Cetirizine Hydrochloride" },

  // Cardiac / BP
  { brandName: "Aspirin 75mg", genericName: "Acetylsalicylic Acid" },
  { brandName: "Ecosprin 75mg", genericName: "Aspirin" },
  { brandName: "Atorvastatin 10mg", genericName: "Atorvastatin Calcium" },
  { brandName: "Atorvastatin 20mg", genericName: "Atorvastatin Calcium" },
  { brandName: "Atorvastatin 40mg", genericName: "Atorvastatin Calcium" },
  { brandName: "Lipitor 20mg", genericName: "Atorvastatin" },
  { brandName: "Storvas 20mg", genericName: "Atorvastatin" },
  { brandName: "Amlodipine 5mg", genericName: "Amlodipine Besylate" },
  { brandName: "Amlodipine 10mg", genericName: "Amlodipine Besylate" },
  { brandName: "Metoprolol 25mg", genericName: "Metoprolol Succinate" },
  { brandName: "Metoprolol 50mg", genericName: "Metoprolol Succinate" },
  { brandName: "Ramipril 5mg", genericName: "Ramipril" },
  { brandName: "Ramipril 2.5mg", genericName: "Ramipril" },
  { brandName: "Losartan 50mg", genericName: "Losartan Potassium" },
  { brandName: "Telmisartan 40mg", genericName: "Telmisartan" },
  { brandName: "Telmisartan 80mg", genericName: "Telmisartan" },
  { brandName: "Nitroglycerin 0.5mg", genericName: "Glyceryl Trinitrate" },
  { brandName: "Sorbitrate 5mg", genericName: "Isosorbide Dinitrate" },
  { brandName: "Furosemide 40mg", genericName: "Furosemide" },
  { brandName: "Lasix 40mg", genericName: "Furosemide" },

  // Diabetes
  { brandName: "Metformin 500mg", genericName: "Metformin Hydrochloride" },
  { brandName: "Metformin 1000mg", genericName: "Metformin Hydrochloride" },
  { brandName: "Glycomet 500mg", genericName: "Metformin" },
  { brandName: "Glimepiride 1mg", genericName: "Glimepiride" },
  { brandName: "Glimepiride 2mg", genericName: "Glimepiride" },
  { brandName: "Amaryl 2mg", genericName: "Glimepiride" },
  { brandName: "Januvia 100mg", genericName: "Sitagliptin" },
  { brandName: "Insulin Regular", genericName: "Human Insulin" },

  // Gastro
  { brandName: "Omeprazole 20mg", genericName: "Omeprazole" },
  { brandName: "Omez 20mg", genericName: "Omeprazole" },
  { brandName: "Pantoprazole 40mg", genericName: "Pantoprazole Sodium" },
  { brandName: "Pan 40mg", genericName: "Pantoprazole" },
  { brandName: "Rabeprazole 20mg", genericName: "Rabeprazole Sodium" },
  { brandName: "Ranitidine 150mg", genericName: "Ranitidine Hydrochloride" },
  { brandName: "Ondansetron 4mg", genericName: "Ondansetron" },
  { brandName: "Emeset 4mg", genericName: "Ondansetron" },
  { brandName: "Domperidone 10mg", genericName: "Domperidone" },
  { brandName: "Domstal 10mg", genericName: "Domperidone" },
  { brandName: "ORS Sachet", genericName: "Oral Rehydration Salts" },
  { brandName: "Electral Powder", genericName: "ORS" },

  // Respiratory
  { brandName: "Salbutamol 2mg", genericName: "Salbutamol Sulphate" },
  { brandName: "Asthalin 2mg", genericName: "Salbutamol" },
  { brandName: "Montelukast 10mg", genericName: "Montelukast Sodium" },
  { brandName: "Montair 10mg", genericName: "Montelukast" },
  { brandName: "Levocetrizine 5mg", genericName: "Levocetirizine" },
  { brandName: "Xyzal 5mg", genericName: "Levocetirizine" },
  { brandName: "Budesonide Inhaler", genericName: "Budesonide" },
  { brandName: "Budecort Inhaler", genericName: "Budesonide" },

  // Vitamins / Supplements
  { brandName: "Vitamin D3 60000 IU", genericName: "Cholecalciferol" },
  { brandName: "Vitamin B12 500mcg", genericName: "Cyanocobalamin" },
  { brandName: "Vitamin C 500mg", genericName: "Ascorbic Acid" },
  { brandName: "Calcium + Vitamin D3", genericName: "Calcium Carbonate" },
  { brandName: "Shelcal 500mg", genericName: "Calcium Carbonate" },
  { brandName: "Ferrous Sulphate 200mg", genericName: "Iron" },
  { brandName: "Folic Acid 5mg", genericName: "Folic Acid" },
  { brandName: "Becosules Capsule", genericName: "Vitamin B Complex" },
  { brandName: "Zinc 50mg", genericName: "Zinc Sulphate" },

  // Thyroid
  { brandName: "Levothyroxine 25mcg", genericName: "Levothyroxine Sodium" },
  { brandName: "Levothyroxine 50mcg", genericName: "Levothyroxine Sodium" },
  { brandName: "Eltroxin 50mcg", genericName: "Levothyroxine" },
  { brandName: "Thyronorm 50mcg", genericName: "Levothyroxine" },

  // Neurological / Psychiatric
  { brandName: "Pregabalin 75mg", genericName: "Pregabalin" },
  { brandName: "Lyrica 75mg", genericName: "Pregabalin" },
  { brandName: "Gabapentin 300mg", genericName: "Gabapentin" },
  { brandName: "Alprazolam 0.25mg", genericName: "Alprazolam" },
  { brandName: "Clonazepam 0.5mg", genericName: "Clonazepam" },

  // Skin / Topical
  { brandName: "Betamethasone Cream", genericName: "Betamethasone" },
  { brandName: "Betnovate Cream", genericName: "Betamethasone" },
  { brandName: "Clotrimazole Cream", genericName: "Clotrimazole" },
  { brandName: "Candid Cream", genericName: "Clotrimazole" },
  { brandName: "Mupirocin Ointment", genericName: "Mupirocin" },
  { brandName: "T-Bact Ointment", genericName: "Mupirocin" },
];

const ROUTES = ["Oral", "Topical", "Inhaled", "Injection", "Sublingual", "IV"];

// ─────────────────────────────────────────────────────────────────────────────
// OPENFDA DRUG SEARCH
// Calls OpenFDA public API directly — no backend needed, no auth required
// ─────────────────────────────────────────────────────────────────────────────

async function searchDrugs(query: string): Promise<DrugResult[]> {
  if (query.length < 2) return [];

  const q = query.toLowerCase();

  // Step 1 — Search local Indian medicines list first (instant)
  const localResults = INDIAN_MEDICINES.filter(
    (m) =>
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q)
  ).slice(0, 8);

  if (localResults.length >= 3) return localResults;

  // Step 2 — Fallback to OpenFDA for less common drugs
  try {
    const res = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${query}*&limit=6`
    );
    const data = await res.json();
    if (!data.results) return localResults;

    const seen = new Set<string>(
      localResults.map((m) => m.brandName.toLowerCase())
    );

    const fdaResults: DrugResult[] = data.results
      .flatMap((r: any) => {
        const brands = r.openfda?.brand_name || [];
        const generics = r.openfda?.generic_name || [];
        return brands.map((b: string, i: number) => ({
          brandName: b,
          genericName: generics[i] || generics[0] || "",
        }));
      })
      .filter((d: DrugResult) => {
        const key = d.brandName.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 4);

    return [...localResults, ...fdaResults];
  } catch {
    return localResults;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER — collapsible section with header
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5
                   bg-gray-50 hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#78355b]">{icon}</span>
          <span className="text-xs font-semibold text-gray-700
                           uppercase tracking-wide">
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp size={13} className="text-gray-400" />
          : <ChevronDown size={13} className="text-gray-400" />
        }
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDICATION SEARCH BOX
// ─────────────────────────────────────────────────────────────────────────────

function MedicationSearch({ onAdd }: { onAdd: (drug: DrugResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DrugResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const drugs = await searchDrugs(value);
      setResults(drugs);
      setShowResults(true);
      setSearching(false);
    }, 400);
  }, []);

  const handleSelect = (drug: DrugResult) => {
    onAdd(drug);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-gray-200
                      rounded-xl px-3 py-2 bg-gray-50
                      focus-within:border-[#78355b]">
        {searching
          ? <Loader2 size={14} className="text-gray-400 animate-spin flex-shrink-0" />
          : <Search size={14} className="text-gray-400 flex-shrink-0" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search medicine (e.g. Paracetamol)..."
          className="flex-1 text-sm bg-transparent focus:outline-none
                     text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white
                        border border-gray-200 rounded-xl shadow-lg z-50
                        overflow-hidden">
          {results.map((drug, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(drug)}
              className="w-full flex items-start gap-3 px-3 py-2.5
                         hover:bg-[#78355b]/5 transition text-left"
            >
              <Pill size={13} className="text-[#78355b] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {drug.brandName}
                </p>
                {drug.genericName && (
                  <p className="text-xs text-gray-400">{drug.genericName}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !searching && query.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white
                        border border-gray-200 rounded-xl shadow-lg z-50 px-3 py-3">
          <p className="text-xs text-gray-400 text-center">
            No results. Add manually:
          </p>
          <button
            onClick={() => handleSelect({ brandName: query, genericName: "" })}
            className="w-full mt-2 text-xs text-[#78355b] font-medium
                       py-1.5 border border-[#78355b]/20 rounded-lg
                       hover:bg-[#78355b]/5 transition"
          >
            + Add {query} manually
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDICATION ROW — one row per prescribed drug
// ─────────────────────────────────────────────────────────────────────────────

function MedicationRow({
  med,
  onChange,
  onRemove,
}: {
  med: Medication;
  onChange: (updated: Medication) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-[#78355b]/5 border border-[#78355b]/15 rounded-xl p-3
                    space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill size={13} className="text-[#78355b] flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800">
            {med.drugName}
          </span>
          {med.genericName && (
            <span className="text-xs text-gray-400">({med.genericName})</span>
          )}
        </div>
        <button onClick={onRemove}
                className="text-gray-400 hover:text-red-400 transition">
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-semibold text-gray-400
                             uppercase tracking-wide">Dose</label>
          <input
            type="text"
            value={med.dose}
            onChange={(e) => onChange({ ...med, dose: e.target.value })}
            placeholder="e.g. 500mg"
            className="w-full mt-0.5 text-xs border border-gray-200 rounded-lg
                       px-2 py-1.5 focus:outline-none focus:border-[#78355b] bg-white"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400
                             uppercase tracking-wide">Route</label>
          <select
            value={med.route}
            onChange={(e) => onChange({ ...med, route: e.target.value })}
            className="w-full mt-0.5 text-xs border border-gray-200 rounded-lg
                       px-2 py-1.5 focus:outline-none focus:border-[#78355b] bg-white"
          >
            {ROUTES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-semibold text-gray-400
                             uppercase tracking-wide">Frequency</label>
          <select
            value={med.frequency}
            onChange={(e) =>
              onChange({ ...med, frequency: e.target.value, frequencyCustom: "" })}
            className="w-full mt-0.5 text-xs border border-gray-200 rounded-lg
                       px-2 py-1.5 focus:outline-none focus:border-[#78355b] bg-white"
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          {med.frequency === "CUSTOM" && (
            <input
              type="text"
              value={med.frequencyCustom}
              onChange={(e) =>
                onChange({ ...med, frequencyCustom: e.target.value })}
              placeholder="e.g. Every 8 hours"
              className="w-full mt-1 text-xs border border-gray-200 rounded-lg
                         px-2 py-1.5 focus:outline-none focus:border-[#78355b] bg-white"
            />
          )}
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400
                             uppercase tracking-wide">Duration (days)</label>
          <input
            type="number"
            min={1}
            value={med.durationDays}
            onChange={(e) =>
              onChange({ ...med, durationDays: Number(e.target.value) })}
            className="w-full mt-0.5 text-xs border border-gray-200 rounded-lg
                       px-2 py-1.5 focus:outline-none focus:border-[#78355b] bg-white"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-semibold text-gray-400
                           uppercase tracking-wide">Special Instructions</label>
        <input
          type="text"
          value={med.notes}
          onChange={(e) => onChange({ ...med, notes: e.target.value })}
          placeholder="e.g. Take after food, avoid sunlight"
          className="w-full mt-0.5 text-xs border border-gray-200 rounded-lg
                     px-2 py-1.5 focus:outline-none focus:border-[#78355b] bg-white"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

export default function ConsultationNotesPanel({
  appointmentId,
  onSaveFinal,
}: Props) {
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Form state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [vitals, setVitals] = useState("");
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labTests, setLabTests] = useState("");
  const [instructions, setInstructions] = useState("");
  const [followUpDays, setFollowUpDays] = useState(7);

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Build request payload
  const buildPayload = useCallback(() => ({
    appointmentId,
    chiefComplaint,
    diagnosis,
    diagnosisCode,
    vitals,
    medications: medications.map((m) => ({
      drugName: m.drugName,
      genericName: m.genericName,
      dose: m.dose,
      frequency: m.frequency === "CUSTOM" ? m.frequencyCustom : m.frequency,
      durationDays: m.durationDays,
      route: m.route,
      notes: m.notes,
    })),
    labTests,
    instructions,
    followUpDays,
  }), [appointmentId, chiefComplaint, diagnosis, diagnosisCode,
       vitals, medications, labTests, instructions, followUpDays]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(async () => {
      if (!chiefComplaint && !diagnosis && medications.length === 0) return;
      try {
        await axiosInstance.post(
          "http://localhost:8089/api/v1/consultation-notes/auto-save",
          buildPayload(),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLastAutoSave(new Date());
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [buildPayload, token]);

  const handleFinalSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.post(
        "http://localhost:8089/api/v1/consultation-notes/save-final",
        buildPayload(),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      onSaveFinal();
    } catch (err) {
      console.error("Final save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const addMedication = (drug: DrugResult) => {
    setMedications((prev) => [...prev, {
      id: crypto.randomUUID(),
      drugName: drug.brandName,
      genericName: drug.genericName,
      dose: "",
      frequency: "OD",
      frequencyCustom: "",
      durationDays: 5,
      route: "Oral",
      notes: "",
    }]);
  };

  const autoSaveLabel = lastAutoSave
    ? `Auto-saved ${Math.floor(
        (Date.now() - lastAutoSave.getTime()) / 60000
      )} min ago`
    : "Auto-saves every 30 sec";

  // ── Saved state ────────────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl
                      shadow-2xl border border-gray-100 z-50">
        <div className="p-6 flex flex-col items-center gap-3 text-center">
          <CheckCircle size={36} className="text-emerald-500" />
          <p className="text-sm font-semibold text-gray-800">
            Notes saved successfully
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            AI is generating the full consultation report.
            Patient will be notified automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl
                    shadow-2xl border border-gray-100 z-50 flex flex-col
                    max-h-[85vh]">

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3
                   bg-[#78355b] rounded-t-2xl cursor-pointer flex-shrink-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-white" />
          <span className="text-sm font-semibold text-white">
            Consultation Notes
          </span>
          <span className="text-[10px] text-white/60 bg-white/10
                           px-2 py-0.5 rounded-full">
            {medications.length} meds
          </span>
        </div>
        {isOpen
          ? <ChevronDown size={15} className="text-white" />
          : <ChevronUp size={15} className="text-white" />
        }
      </div>

      {/* Body */}
      {isOpen && (
        <>
          <div className="overflow-y-auto flex-1 p-3 space-y-3">

            <Section icon={<Activity size={14} />} title="Chief Complaint">
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Chest pain for 3 days"
                className="w-full text-sm border border-gray-200 rounded-xl
                           px-3 py-2 focus:outline-none focus:border-[#78355b]
                           resize-none bg-gray-50"
              />
            </Section>

            <Section icon={<Activity size={14} />} title="Vitals"
                     defaultOpen={false}>
              <input
                type="text"
                value={vitals}
                onChange={(e) => setVitals(e.target.value)}
                placeholder="e.g. BP 130/80, HR 88, Temp 98.6F, SpO2 97%"
                className="w-full text-sm border border-gray-200 rounded-xl
                           px-3 py-2 focus:outline-none focus:border-[#78355b]
                           bg-gray-50"
              />
            </Section>

            <Section icon={<ClipboardList size={14} />} title="Diagnosis">
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Unstable Angina"
                  className="w-full text-sm border border-gray-200 rounded-xl
                             px-3 py-2 focus:outline-none focus:border-[#78355b]
                             resize-none bg-gray-50"
                />
                <input
                  type="text"
                  value={diagnosisCode}
                  onChange={(e) => setDiagnosisCode(e.target.value)}
                  placeholder="ICD-10 code (optional) e.g. I20.0"
                  className="w-full text-sm border border-gray-200 rounded-xl
                             px-3 py-2 focus:outline-none focus:border-[#78355b]
                             bg-gray-50"
                />
              </div>
            </Section>

            <Section icon={<Pill size={14} />}
                     title={`Medications (${medications.length})`}>
              <div className="space-y-3">
                <MedicationSearch onAdd={addMedication} />
                {medications.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Search and add medications above
                  </p>
                )}
                {medications.map((med) => (
                  <MedicationRow
                    key={med.id}
                    med={med}
                    onChange={(updated) =>
                      setMedications((prev) =>
                        prev.map((m) => (m.id === med.id ? updated : m)))}
                    onRemove={() =>
                      setMedications((prev) =>
                        prev.filter((m) => m.id !== med.id))}
                  />
                ))}
              </div>
            </Section>

            <Section icon={<FlaskConical size={14} />} title="Tests Ordered"
                     defaultOpen={false}>
              <textarea
                rows={2}
                value={labTests}
                onChange={(e) => setLabTests(e.target.value)}
                placeholder="e.g. ECG, CBC, Troponin, Chest X-ray"
                className="w-full text-sm border border-gray-200 rounded-xl
                           px-3 py-2 focus:outline-none focus:border-[#78355b]
                           resize-none bg-gray-50"
              />
            </Section>

            <Section icon={<ClipboardList size={14} />} title="Instructions">
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Rest for 5 days, avoid strenuous activity"
                className="w-full text-sm border border-gray-200 rounded-xl
                           px-3 py-2 focus:outline-none focus:border-[#78355b]
                           resize-none bg-gray-50"
              />
            </Section>

            <div className="flex items-center gap-3 px-1">
              <span className="text-xs font-semibold text-gray-500
                               uppercase tracking-wide flex-shrink-0">
                Follow-up in
              </span>
              <input
                type="number"
                min={1}
                value={followUpDays}
                onChange={(e) => setFollowUpDays(Number(e.target.value))}
                className="w-20 text-sm border border-gray-200 rounded-xl
                           px-3 py-1.5 focus:outline-none
                           focus:border-[#78355b] bg-gray-50 text-center"
              />
              <span className="text-xs text-gray-500">days</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={handleFinalSave}
              disabled={saving || !chiefComplaint}
              className="w-full flex items-center justify-center gap-2
                         bg-[#78355b] text-white text-sm font-semibold
                         py-2.5 rounded-xl hover:bg-[#6a2d50] transition
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving & generating AI report...
                </>
              ) : (
                <>
                  <Save size={14} />
                  End Call & Save Notes
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              {autoSaveLabel} · AI expands into full report for patient
            </p>
          </div>
        </>
      )}
    </div>
  );
}





