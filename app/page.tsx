"use client";

import React, { useState, useEffect, useRef } from "react";
//import { PDFDownloadLink } from '@react-pdf/renderer';
//import { QuotePDF } from '@/components/QuotePDF';

import dynamic from "next/dynamic";

// Define a safe Client-side only component bridge
const SafePDFDownloadButton = dynamic(
  () =>
    Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/QuotePDF")
    ]).then(([pdfMod, quoteMod]) => {
      const PDFDownloadLink = pdfMod.PDFDownloadLink;
      const QuotePDF = quoteMod.QuotePDF;
      
      return function PDFButtonWrapper({ data, clientName }: { data: any; clientName: string }) {
        return (
          <PDFDownloadLink
            document={<QuotePDF data={data} />}
            fileName={`Quote_${clientName || "Customer"}.pdf`}
            className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition text-center shadow-xs inline-block cursor-pointer w-full"
          >
            {/* @ts-ignore */}
            {({ loading }) => (loading ? "Preparing Document..." : "🖨️ Download PDF")}
          </PDFDownloadLink>
        );
      };
    }),
  { ssr: false }
);

interface PurityMapping {
  id: string;
  purity_name: string;
  purity_percentage: number;
}

export default function OmDiamondsApp() {
  // --- CONFIG / SETTINGS DEFAULTS ---
  const [defaultGoldRate, setDefaultGoldRate] = useState<string>("14000");
  const [defaultDiamondRate, setDefaultDiamondRate] = useState<string>("60000");
  const [defaultWastagePct, setDefaultWastagePct] = useState<string>("8.0");
  const [defaultColorStoneRate, setDefaultColorStoneRate] = useState<string>("200");
  const [defaultCertRate, setDefaultCertRate] = useState<string>("700");
  const [defaultLaborRate, setDefaultLaborRate] = useState("500");

  // --- DYNAMIC PURITY SEEDS ---
  const [purities, setPurities] = useState<PurityMapping[]>([
    { id: "1", purity_name: "18K", purity_percentage: 76.0 },
    { id: "2", purity_name: "14K", purity_percentage: 60.0 },
  ]);

  // --- NAVIGATION & DRAWER STATE ---
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false); 

  // --- CALCULATOR FORM STATE ---
  const [goldRate, setGoldRate] = useState<string>("");
  const [grossWeight, setGrossWeight] = useState<string>("");
  const [selectedPurity, setSelectedPurity] = useState<string>("1"); 
  
  const [costType, setCostType] = useState<"Labor" | "Wastage">("Labor");
  const [laborRate, setLaborRate] = useState<string>("");
  const [wastagePct, setWastagePct] = useState<string>("");

  const [diamondWeight, setDiamondWeight] = useState<string>("");
  const [diamondRate, setDiamondRate] = useState<string>("60000");

  // --- NEW ERRORS TRIGGER STATE ---
  const [showCalcErrors, setShowCalcErrors] = useState<boolean>(false);

  const [colorStoneWeight, setColorStoneWeight] = useState<string>("");
  const [colorStoneRate, setColorStoneRate] = useState<string>("");

  const [isCertEnabled, setIsCertEnabled] = useState<boolean>(false);
  const [certRate, setCertRate] = useState<string>("");

  // Discount Configuration
  const [discountType, setDiscountType] = useState<"Percentage" | "Amount">("Percentage");
  const [discountValue, setDiscountValue] = useState<string>("");

  // --- QUOTE MAKER WORKFLOW STATE ---
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showFinalQuoteSheet, setShowFinalQuoteSheet] = useState<boolean>(false);
  const [quoteDate, setQuoteDate] = useState<string>("");

  // --- ADMIN FORM INPUTS STATE ---
  const [newPurityName, setNewPurityName] = useState("");
  const [newPurityPct, setNewPurityPct] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load live settings from the API endpoint when any user opens the page
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          if (data.defaultGoldRate) { setDefaultGoldRate(data.defaultGoldRate); setGoldRate(data.defaultGoldRate); }
          if (data.defaultDiamondRate) { setDefaultDiamondRate(data.defaultDiamondRate); setDiamondRate(data.defaultDiamondRate); }
          if (data.defaultWastagePct) { setDefaultWastagePct(data.defaultWastagePct); setWastagePct(data.defaultWastagePct); }
          if (data.defaultColorStoneRate) { setDefaultColorStoneRate(data.defaultColorStoneRate); setColorStoneRate(data.defaultColorStoneRate); }
          if (data.defaultCertRate) setDefaultCertRate(data.defaultCertRate);
          if (data.defaultLaborRate) setLaborRate(data.defaultLaborRate);
        }
      })
      .catch((err) => console.error("Failed to load global settings:", err));
  }, []);

  // Live sync configuration fields whenever global settings default overrides change
  useEffect(() => { setGoldRate(defaultGoldRate); }, [defaultGoldRate]);
  useEffect(() => { setDiamondRate(defaultDiamondRate); }, [defaultDiamondRate]);
  useEffect(() => { setWastagePct(defaultWastagePct); }, [defaultWastagePct]);
  useEffect(() => { setColorStoneRate(defaultColorStoneRate); }, [defaultColorStoneRate]);
  useEffect(() => { setLaborRate(defaultLaborRate); }, [defaultLaborRate]);

  useEffect(() => {
    if (isCertEnabled) {
      setCertRate(defaultCertRate); 
    } else {
      setCertRate(""); 
    }
  }, [isCertEnabled, defaultCertRate]);

  // Enhanced print style sheet injector that avoids structural heights and top blank areas
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        @page {
          margin: 0mm;
          size: auto;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
        }
        body * {
          visibility: hidden !important;
        }
        #print-quote-frame, #print-quote-frame * {
          visibility: visible !important;
        }
        #print-quote-frame {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 24px !important;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // --- CALCULATOR MATH ENGINE ---
  const calculateTotal = () => {
    const gRatePerGram = parseFloat(goldRate) || 0;
    const gWeight = parseFloat(grossWeight) || 0;
    
    const dWeightCt = parseFloat(diamondWeight) || 0;
    const dRate = parseFloat(diamondRate) || 0;
    
    const csWeightCt = parseFloat(colorStoneWeight) || 0;
    const csRate = parseFloat(colorStoneRate) || 0;

    const cRate = isCertEnabled ? (parseFloat(certRate) || 0) : 0;

    const purityObj = purities.find((p) => p.id === selectedPurity);
    const purityName = purityObj ? purityObj.purity_name : "18K";
    const purityPct = purityObj ? purityObj.purity_percentage : 76.0;

    const stonesWeightGrams = (dWeightCt + csWeightCt) * 0.2;
    const netGoldWeight = Math.max(0, gWeight - stonesWeightGrams);

    let calculatedGoldValue = 0;
    let processingCharge = 0;

    if (costType === "Labor") {
      calculatedGoldValue = netGoldWeight * gRatePerGram * (purityPct / 100);
      const lRate = parseFloat(laborRate) || 0;
      processingCharge = netGoldWeight * lRate;
    } else {
      const wPct = parseFloat(wastagePct) || 0;
      calculatedGoldValue = netGoldWeight * gRatePerGram * (purityPct / 100);
      processingCharge = netGoldWeight * gRatePerGram * (wPct / 100);
    }

    const totalDiamondCost = dWeightCt * dRate;
    const totalColorStoneCost = csWeightCt * csRate;
    const totalCertCost = dWeightCt * cRate;

    const subtotal = calculatedGoldValue + processingCharge + totalDiamondCost + totalColorStoneCost + totalCertCost;

    const discVal = parseFloat(discountValue) || 0;
    let appliedDiscount = 0;

    if (discountType === "Percentage") {
      appliedDiscount = subtotal * (discVal / 100);
    } else {
      appliedDiscount = discVal;
    }

    const finalPrice = Math.max(0, subtotal - appliedDiscount);
    const roundedFinalPrice = Math.round(finalPrice);

    return {
      purityName,
      purityPct,
      subtotal: subtotal.toFixed(2),
      netGoldWeight: netGoldWeight.toFixed(3),
      goldValue: calculatedGoldValue.toFixed(2),
      processingCharge: processingCharge.toFixed(2),
      totalDiamondCost: totalDiamondCost.toFixed(2),
      totalColorStoneCost: totalColorStoneCost.toFixed(2),
      totalCertCost: totalCertCost.toFixed(2),
      appliedDiscount: appliedDiscount.toFixed(2),
      finalPrice: roundedFinalPrice.toString(),
    };
  };

  const results = calculateTotal();

  // --- IMAGE SELECTION COMPONENT FUNCTION ---
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- OPEN CUSTOMER INTAKE SCREEN WITH MANDATORY LAZY INPUT VALIDATIONS ---
  const handleInitiateQuote = () => {
    setShowCalcErrors(true);

    if (!grossWeight || parseFloat(grossWeight) <= 0) {
      alert("Validation Error: Gross Weight is mandatory and must be greater than 0.");
      return;
    }
    if (!diamondWeight || parseFloat(diamondWeight) <= 0) {
      alert("Validation Error: Diamond Weight is mandatory and must be greater than 0.");
      return;
    }

    const currentGoldRate = parseFloat(goldRate) || 0;
    const currentDiamondRate = parseFloat(diamondRate) || 0;
    const currentColorStoneRate = parseFloat(colorStoneRate) || 0;

    if (currentGoldRate <= 0) {
      alert("Validation Error: Gold Rate cannot be 0 or empty.");
      return;
    }
    if (currentDiamondRate <= 0) {
      alert("Validation Error: Diamond Rate cannot be 0 or empty.");
      return;
    }
    if (parseFloat(colorStoneWeight) > 0 && currentColorStoneRate <= 0) {
      alert("Validation Error: Color Stone Rate cannot be 0 when color stone weight is defined.");
      return;
    }

    setQuoteDate(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }));
    setIsQuoteModalOpen(true);
    setShowFinalQuoteSheet(false);
  };

  // --- COMPILE QUOTE DOCUMENT WITH USER DATA VALIDATIONS ---
  const handleCompileQuote = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert("Validation Error: Customer Name is required.");
      return;
    }
    if (!clientPhone.trim()) {
      alert("Validation Error: Phone Number is required.");
      return;
    }

    const numericPhone = clientPhone.replace(/\D/g, "");
    if (numericPhone.length !== 10) {
      alert("Validation Error: Phone number must be exactly 10 digits.");
      return;
    }

    if (!itemType.trim()) {
      alert("Validation Error: Item Type is required.");
      return;
    }

    setShowFinalQuoteSheet(true);
  };

  // --- NATIVE SHARE ENGINE WITH DIRECT WHATSAPP REDIRECT ---
  const handleWhatsAppInvoke = () => {
    const cleanPhone = clientPhone.replace(/\D/g, "");
    const localizedPhone = cleanPhone.startsWith("91") && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone}`;
    
    const messageText = `Hello ${clientName},\n\nThank you for visiting Om Diamonds. Here is your custom item estimation:\n\n✨ Total Valuation: ₹${parseInt(results.finalPrice).toLocaleString('en-IN')}\n▫ Gold Net Wt: ${results.netGoldWeight}g (${results.purityName})\n▫ Diamond Wt: ${diamondWeight || "0"} ct\n\nGenerated on ${quoteDate}.`;
    
    const encodedMsg = encodeURIComponent(messageText);
    window.open(`https://wa.me/${localizedPhone}?text=${encodedMsg}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Om Diamonds Quote",
          text: `Valuation Quote for ${clientName} - Total: ₹${parseInt(results.finalPrice).toLocaleString('en-IN')}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Sharing cancelled or failed", err);
      }
    } else {
      handleWhatsAppInvoke();
    }
  };

  // --- BACKEND ADMIN MANAGEMENT CODE ---
  const handleAddPurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurityName || !newPurityPct) return;
    setPurities([...purities, { id: Date.now().toString(), purity_name: newPurityName, purity_percentage: parseFloat(newPurityPct) }]);
    setNewPurityName("");
    setNewPurityPct("");
  };

  const handleDeletePurity = (id: string) => {
    setPurities(purities.filter((p) => p.id !== id));
  };

  // --- Function to save the global settings to the database --- //
  const saveGlobalSettings = async (updatedFields: Record<string, string>) => {
    try {
      const payload = {
        defaultGoldRate,
        defaultDiamondRate,
        defaultWastagePct,
        defaultColorStoneRate,
        defaultCertRate,
        defaultLaborRate,
        ...updatedFields
      };
  
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Failed to sync updated configurations with server:", err);
    }
  };

  const isGrossWeightInvalid = showCalcErrors && (!grossWeight || parseFloat(grossWeight) <= 0);
  const isDiamondWeightInvalid = showCalcErrors && (!diamondWeight || parseFloat(diamondWeight) <= 0);
  const isGoldRateInvalid = showCalcErrors && (!goldRate || parseFloat(goldRate) <= 0);
  const isDiamondRateInvalid = showCalcErrors && (!diamondRate || parseFloat(diamondRate) <= 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans relative overflow-x-hidden">
      
      {/* BACKGROUND OVERLAY SHADE FOR MENU DRAWER */}
      {isDrawerOpen && (
        <div onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity" />
      )}

      {/* SLIDE-OUT DRAWER FOR MANAGERS */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200 p-5 z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Manager Discounts</h3>
          <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 text-sm font-bold">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Discount Type</span>
            <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button type="button" onClick={() => setDiscountType("Percentage")} className={`py-1.5 text-xs font-semibold rounded-lg transition ${discountType === "Percentage" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600"}`}>% Percentage</button>
              <button type="button" onClick={() => setDiscountType("Amount")} className={`py-1.5 text-xs font-semibold rounded-lg transition ${discountType === "Amount" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600"}`}>₹ Fixed Amount</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Discount Value Given ({discountType === "Percentage" ? "%" : "₹"})</label>
            <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none" />
          </div>
          <div className="bg-slate-50 border rounded-xl p-3.5 space-y-2 text-xs">
            <span className="block font-bold text-slate-400 uppercase tracking-wide mb-1">Live Impact Summary</span>
            <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>₹{parseFloat(results.subtotal).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-emerald-600 font-medium"><span>Applied Reduction:</span><span>-₹{parseFloat(results.appliedDiscount).toLocaleString('en-IN')}</span></div>
            <hr />
            <div className="flex justify-between font-bold text-slate-900 text-sm"><span>Final Value:</span><span>₹{parseInt(results.finalPrice).toLocaleString('en-IN')}</span></div>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="w-full mt-4 py-2.5 bg-slate-900 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-xs">Apply & Close</button>
        </div>
      </div>

      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <span className="text-xl font-bold tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700">Om Diamonds</span>
          <div className="flex items-center gap-2">
            {!isAdminView && (
              <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
              </button>
            )}
            <button onClick={() => setIsAdminView(!isAdminView)} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border">
              {isAdminView ? "← Back to Calculator" : "⚙️ Settings"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-12">
        {!isAdminView ? (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Calculation Inputs</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gold Rate (₹/1g) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={goldRate} 
                    onChange={(e) => setGoldRate(e.target.value)} 
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${isGoldRateInvalid ? "border-red-500 bg-red-50" : "border-slate-200"}`} 
                  />
                  {isGoldRateInvalid && <span className="text-[10px] font-semibold text-red-500">Rate required & can&apos;t be 0</span>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Metal Purity</label>
                  <select value={selectedPurity} onChange={(e) => setSelectedPurity(e.target.value)} className="w-full px-3 py-2 border bg-white rounded-xl text-sm">
                    {purities.map((p) => (<option key={p.id} value={p.id}>{p.purity_name} ({p.purity_percentage}%)</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Gross Weight (g) <span className="text-red-500 font-bold">*</span>
                </label>
                <input 
                  type="number" 
                  step="0.001" 
                  value={grossWeight} 
                  onChange={(e) => setGrossWeight(e.target.value)} 
                  placeholder="0.000" 
                  className={`w-full px-3 py-2 border rounded-xl text-sm transition-colors ${
                    isGrossWeightInvalid ? "border-red-500 bg-red-50 focus:outline-red-500" : "border-slate-200"
                  }`} 
                />
                {isGrossWeightInvalid && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1">⚠️ Gross Weight is mandatory and must be greater than 0</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cost Type Mechanism</span>
                  <div className="inline-flex rounded-lg border bg-white p-0.5">
                    <button type="button" onClick={() => setCostType("Labor")} className={`px-3 py-1 text-xs font-medium rounded-md ${costType === "Labor" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600"}`}>Labor</button>
                    <button type="button" onClick={() => setCostType("Wastage")} className={`px-3 py-1 text-xs font-medium rounded-md ${costType === "Wastage" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600"}`}>Wastage</button>
                  </div>
                </div>
                {costType === "Labor" ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Labor Rate (₹/g)</label>
                    <input type="number" value={laborRate} onChange={(e) => setLaborRate(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Wastage Percentage (%)</label>
                    <input type="number" step="0.1" value={wastagePct} onChange={(e) => setWastagePct(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Diamond Weight (ct) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={diamondWeight} 
                    onChange={(e) => setDiamondWeight(e.target.value)} 
                    placeholder="0.00" 
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${isDiamondWeightInvalid ? "border-red-500 bg-red-50" : "border-slate-200"}`} 
                  />
                  {isDiamondWeightInvalid && <p className="text-red-500 text-[10px] font-semibold mt-1">⚠️ Diamond Weight is mandatory</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Diamond Rate (₹/ct) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    value={diamondRate} 
                    onChange={(e) => setDiamondRate(e.target.value)} 
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${isDiamondRateInvalid ? "border-red-500 bg-red-50" : "border-slate-200"}`} 
                  />
                  {isDiamondRateInvalid && <span className="text-[10px] font-semibold text-red-500">Rate required & can&apos;t be 0</span>}
                </div>
              </div>

              <div className="bg-slate-50 border p-3.5 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="certToggle" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer">Apply Certification Charge</label>
                  <input id="certToggle" type="checkbox" checked={isCertEnabled} onChange={(e) => setIsCertEnabled(e.target.checked)} className="w-4 h-4 text-amber-600 accent-amber-500 cursor-pointer" />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isCertEnabled ? "text-slate-600" : "text-slate-300"}`}>Certificate Rate (₹/Diamond ct)</label>
                  <input type="number" disabled={!isCertEnabled} value={certRate} onChange={(e) => setCertRate(e.target.value)} placeholder={isCertEnabled ? "Enter rate..." : "Disabled (₹0)"} className={`w-full px-3 py-2 border rounded-xl text-sm font-medium ${isCertEnabled ? "border-slate-300 bg-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Color Stone Wt (ct)</label>
                  <input type="number" step="0.01" value={colorStoneWeight} onChange={(e) => setColorStoneWeight(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Color Stone Rate (₹/ct)</label>
                  <input 
                    type="number" 
                    value={colorStoneRate} 
                    onChange={(e) => setColorStoneRate(e.target.value)} 
                    className={`w-full px-3 py-2 border rounded-xl text-sm ${showCalcErrors && parseFloat(colorStoneWeight) > 0 && (parseFloat(colorStoneRate) || 0) <= 0 ? "border-red-500 bg-red-50" : "border-slate-200"}`} 
                  />
                  {showCalcErrors && parseFloat(colorStoneWeight) > 0 && (parseFloat(colorStoneRate) || 0) <= 0 && <span className="text-[10px] font-semibold text-red-500">Rate required when Wt added</span>}
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pricing Valuation</h2>
              <div className="space-y-3 border-b border-slate-800 pb-4 text-sm text-slate-300">
                <div className="flex justify-between font-medium text-amber-100"><span>Calculated Net Gold Wt:</span><span className="font-mono">{results.netGoldWeight} g</span></div>
                <hr className="border-slate-800" />
                <div className="flex justify-between"><span>Net Gold Value:</span><span className="font-mono">₹{parseFloat(results.goldValue).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>{costType === "Labor" ? "Labor Charges (on Net Wt)" : "Wastage Cost (on Net Wt)"}:</span><span className="font-mono">₹{parseFloat(results.processingCharge).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Total Diamond Value:</span><span className="font-mono">₹{parseFloat(results.totalDiamondCost).toLocaleString('en-IN')}</span></div>
                {isCertEnabled && parseFloat(results.totalCertCost) > 0 && (<div className="flex justify-between text-amber-200/90"><span>Diamond Cert Fee:</span><span className="font-mono">₹{parseFloat(results.totalCertCost).toLocaleString('en-IN')}</span></div>)}
                <div className="flex justify-between"><span>Total Color Stone Value:</span><span className="font-mono">₹{parseFloat(results.totalColorStoneCost).toLocaleString('en-IN')}</span></div>
                {parseFloat(results.appliedDiscount) > 0 && (<div className="flex justify-between text-emerald-400 font-medium"><span>Applied Discount:</span><span className="font-mono">-₹{parseFloat(results.appliedDiscount).toLocaleString('en-IN')}</span></div>)}
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-400">Total Valuation:</span>
                <span className="text-3xl font-extrabold text-amber-400 font-mono">₹{parseInt(results.finalPrice).toLocaleString('en-IN')}</span>
              </div>
              
              <button 
                onClick={handleInitiateQuote}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg flex justify-center items-center gap-2"
              >
                📄 Create Quote
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b pb-2">Global System Defaults</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Gold Rate (₹/1g)</label>
                  <input 
                    type="number" 
                    value={defaultGoldRate} 
                    onChange={(e) => setDefaultGoldRate(e.target.value)}
                    onBlur={(e) => saveGlobalSettings({ defaultGoldRate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Diamond Rate (₹/ct)</label>
                  <input 
                    type="number" 
                    value={defaultDiamondRate} 
                    onChange={(e) => setDefaultDiamondRate(e.target.value)}
                    onBlur={(e) => saveGlobalSettings({ defaultDiamondRate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Certificate Rate (₹/ct)</label>
                  <input 
                    type="number" 
                    value={defaultCertRate} 
                    onChange={(e) => setDefaultCertRate(e.target.value)}
                    onBlur={(e) => saveGlobalSettings({ defaultCertRate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Wastage Percentage (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={defaultWastagePct} 
                    onChange={(e) => setDefaultWastagePct(e.target.value)}
                    onBlur={(e) => saveGlobalSettings({ defaultWastagePct: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-sm" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Color Stone Rate (₹/ct)</label>
                  <input 
                    type="number" 
                    value={defaultColorStoneRate} 
                    onChange={(e) => setDefaultColorStoneRate(e.target.value)}
                    onBlur={(e) => saveGlobalSettings({ defaultColorStoneRate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Labor Rate (per gram)</label>
                  <input
                    type="number"
                    value={defaultLaborRate}
                    onChange={(e) => setDefaultLaborRate(e.target.value)}
                    onBlur={(e) => saveGlobalSettings({ defaultLaborRate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-xl text-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b pb-2">Purity Dynamic Matrix</h2>
              <div className="space-y-2">
                {purities.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border">
                    <span className="font-bold text-slate-700">{p.purity_name} ({p.purity_percentage}%)</span>
                    <button onClick={() => handleDeletePurity(p.id)} className="text-xs text-red-500 font-medium hover:underline">Delete</button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddPurity} className="flex gap-2 pt-2 border-t border-dashed">
                <input type="text" placeholder="e.g., 22K" value={newPurityName} onChange={(e) => setNewPurityName(e.target.value)} className="flex-1 px-3 py-1.5 text-sm border rounded-xl outline-none" />
                <input type="number" placeholder="%" value={newPurityPct} onChange={(e) => setNewPurityPct(e.target.value)} className="w-20 px-3 py-1.5 text-sm border rounded-xl outline-none" />
                <button type="submit" className="px-3 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded-xl">Add</button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: QUOTE GENERATION STUDIO */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl sticky top-0 z-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                {!showFinalQuoteSheet ? "Step 2 & 3: Details & Media" : "Step 4: Final Document Print"}
              </h3>
              <button 
                onClick={() => setIsQuoteModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center bg-slate-200/60 text-slate-700 font-bold rounded-full text-xs"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div className={`${showFinalQuoteSheet ? "p-3" : "p-5"} flex-1 space-y-4`}>
              {!showFinalQuoteSheet ? (
                <form onSubmit={handleCompileQuote} className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Prospect Credentials</h4>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Customer Full Name *</label>
                      <input required type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Enter full name" className="w-full px-3 py-2 border rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile Contact Phone *</label>
                      <input required type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="e.g., 9876543210" className="w-full px-3 py-2 border rounded-xl text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email ID address (Optional)</label>
                      <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@example.com" className="w-full px-3 py-2 border rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item Type (e.g., Ring, Bracelet, Necklace) *</label>
                      <input required type="text" value={itemType} onChange={(e) => setItemType(e.target.value)} placeholder="e.g., Ring" className="w-full px-3 py-2 border rounded-xl text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Jewellery Ornament Asset Attachment</h4>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Capture ornament from live counter camera view</label>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      ref={fileInputRef}
                      onChange={handleImageCapture}
                      className="hidden" 
                    />

                    {attachedImage ? (
                      <div className="relative group rounded-2xl overflow-hidden border bg-slate-50 h-40 flex items-center justify-center shadow-inner">
                        <img src={attachedImage} alt="Jewelry Snapshot" className="h-full w-full object-contain" />
                        <button 
                          type="button" 
                          onClick={() => setAttachedImage(null)}
                          className="absolute bottom-2 right-2 px-3 py-1 bg-red-600 text-white rounded-lg text-2xl shadow-md font-bold"
                        >
                          🗑️ Swap Image
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl bg-amber-50/20 transition flex flex-col items-center justify-center text-slate-500 gap-1.5"
                      >
                        <span className="text-2xl">📸</span>
                        <span className="text-xs font-bold text-slate-600">Click Camera / Upload Photo</span>
                        <span className="text-[10px] text-slate-400">Supports live capture snapshot directly</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md"
                  >
                    Compile Final Valuation Quote →
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div id="print-quote-frame" className="border border-slate-300 rounded-2xl p-5 bg-white shadow-xs space-y-4 text-slate-800 font-sans">
  
                    {/* 1. Spiritual Invocations */}
                    <div className="text-center space-y-0.5 border-b pb-2 border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-500 tracking-wide">|| Om Shree Ganeshay Namah ||</div>
                      <div className="text-[9px] text-slate-400 font-medium">|| Om Shree Shishoda Kshetrapal Bavji Namah ||</div>
                      <div className="text-[9px] text-slate-400 font-medium">|| Om Shree Purvaj Bavji Namah ||</div>
                    </div>

                    {/* 2. Main Store Branding */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                      <div>
                        <h1 className="text-xl font-black uppercase tracking-[0.15em] text-slate-900">
                          Om Diamonds
                        </h1>
                        <span className="block text-[10px] font-bold text-amber-700 tracking-wider uppercase">
                          Exclusive Diamond Jewellery
                        </span>
                        <div className="mt-1.5 text-[10px] text-slate-500 font-mono leading-tight">
                          <div>📞 +91-897 6732 617</div>
                          <div>📞 +91-865 5558 470</div>
                          <div>✉️ omdiamond123@gmail.com</div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <span className="text-sm font-black text-slate-900 block tracking-widest uppercase bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                          Quotation
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 block">Date: {quoteDate}</span>
                      </div>
                    </div>

                    {/* 3. Customer Credentials */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Quotation For:</span>
                          <span className="font-extrabold text-slate-900 text-sm">{clientName}</span>
                        </div>
                        {clientEmail && (
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Email:</span>
                            <span className="text-slate-600 font-mono block truncate">{clientEmail}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right border-l pl-3 border-slate-200 space-y-1">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Contact Line:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">{clientPhone}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Item Type:</span>
                          <span className="font-bold text-amber-800 capitalize">{itemType || "Ornament Estimate"}</span>
                        </div>
                      </div>
                    </div>

                    {/* TABULAR ITEM & PRICE LEDGER BREAKDOWN */}
                    <div className="overflow-hidden border border-slate-200 rounded-xl text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                            <th className="p-2">Description</th>
                            <th className="p-2 text-right">Weight/Qty</th>
                            <th className="p-2 text-right">Rate (₹)</th>
                            <th className="p-2 text-right">Net Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          <tr>
                            <td className="p-2 font-medium">Gross Weight</td>
                            <td className="p-2 text-right font-mono">{grossWeight || "0.000"} g</td>
                            <td className="p-2 text-right text-slate-400">—</td>
                            <td className="p-2 text-right text-slate-400">—</td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="p-2 font-medium">Net Gold ({results.purityName})</td>
                            <td className="p-2 text-right font-mono">{results.netGoldWeight} g</td>
                            <td className="p-2 text-right font-mono">₹{parseFloat(goldRate).toLocaleString('en-IN')}</td>
                            <td className="p-2 text-right font-mono text-slate-900">₹{parseFloat(results.goldValue).toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-medium">
                              {costType === "Labor" ? "Labor Charges" : `Wastage Premium (${wastagePct}%)`}
                            </td>
                            <td className="p-2 text-right font-mono">{results.netGoldWeight} g</td>
                            <td className="p-2 text-right font-mono">
                              {costType === "Labor" ? `₹${laborRate}` : "Dynamic"}
                            </td>
                            <td className="p-2 text-right font-mono text-slate-900">₹{parseFloat(results.processingCharge).toLocaleString('en-IN')}</td>
                          </tr>
                          {parseFloat(diamondWeight) > 0 && (
                            <tr className="bg-slate-50/50">
                              <td className="p-2 font-medium">Diamonds</td>
                              <td className="p-2 text-right font-mono">{diamondWeight} ct</td>
                              <td className="p-2 text-right font-mono">₹{parseFloat(diamondRate).toLocaleString('en-IN')}</td>
                              <td className="p-2 text-right font-mono text-slate-900">₹{parseFloat(results.totalDiamondCost).toLocaleString('en-IN')}</td>
                            </tr>
                          )}
                          {isCertEnabled && parseFloat(results.totalCertCost) > 0 && (
                            <tr>
                              <td className="p-2 font-medium">Diamond Lab Cert</td>
                              <td className="p-2 text-right font-mono">{diamondWeight} ct</td>
                              <td className="p-2 text-right font-mono">₹{parseFloat(certRate).toLocaleString('en-IN')}</td>
                              <td className="p-2 text-right font-mono text-slate-900">₹{parseFloat(results.totalCertCost).toLocaleString('en-IN')}</td>
                            </tr>
                          )}
                          {parseFloat(colorStoneWeight) > 0 && (
                            <tr className={isCertEnabled ? "bg-slate-50/50" : ""}>
                              <td className="p-2 font-medium">Color Stones</td>
                              <td className="p-2 text-right font-mono">{colorStoneWeight} ct</td>
                              <td className="p-2 text-right font-mono">₹{parseFloat(colorStoneRate).toLocaleString('en-IN')}</td>
                              <td className="p-2 text-right font-mono text-slate-900">₹{parseFloat(results.totalColorStoneCost).toLocaleString('en-IN')}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Reconciliation Totals */}
                    <div className="text-xs pt-1 space-y-1.5 text-right max-w-xs ml-auto">
                      <div className="flex justify-between font-medium text-slate-500">
                        <span>Subtotal Framework:</span>
                        <span className="font-mono text-slate-900">₹{parseFloat(results.subtotal).toLocaleString('en-IN')}</span>
                      </div>
                      {parseFloat(results.appliedDiscount) > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Privilege Discount ({discountType === "Percentage" ? `${discountValue}%` : "Fixed"}):</span>
                          <span className="font-mono">-₹{parseFloat(results.appliedDiscount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="bg-slate-900 text-amber-400 p-3 rounded-xl flex justify-between items-center text-left mt-2 shadow-md">
                        <span className="text-xs font-bold uppercase tracking-wider">Total Value:</span>
                        <span className="text-xl font-black font-mono">
                          ₹{parseInt(results.finalPrice).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* ACTION FOOTER BUTTON TRIGGERS */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Render client-side PDF component only after client initialization is fully resolved */}
                    {typeof window !== 'undefined' && results && (
                      <SafePDFDownloadButton
                        clientName={clientName}
                        data={{
                          customerName: clientName,
                          customerPhone: clientPhone,
                          customerEmail: clientEmail,
                          itemType: itemType,
                          goldRate: goldRate,
                          diamondRate: diamondRate,
                          totalAmount: parseInt(results.finalPrice),
                          imageSrc: attachedImage,
                          grossWeight: grossWeight,
                          netGoldWeight: results.netGoldWeight,
                          goldValue: results.goldValue,
                          purityName: results.purityName,
                          diamondWeight: diamondWeight,
                          totalDiamondCost: results.totalDiamondCost,
                          processingCharge: results.processingCharge,
                          costType: costType,
                          wastagePct: wastagePct,
                          laborRate: laborRate,
                          appliedDiscount: results.appliedDiscount,
                          discountType: discountType,
                          discountValue: discountValue,
                          subtotal: results.subtotal,
                          colorStoneWeight: colorStoneWeight,
                          colorStoneRate: colorStoneRate,
                          totalColorStoneCost: results.totalColorStoneCost,
                          isCertEnabled: isCertEnabled,
                          certRate: certRate,
                          totalCertCost: results.totalCertCost,
                          quoteDate: quoteDate,
                        }}
                      />
                    )}
                    />
                    
                    <button
                      onClick={handleNativeShare}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md flex justify-center items-center gap-1.5"
                    >
                      Share Quote
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
