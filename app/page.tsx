"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';

interface PurityMapping {
  id: string;
  purity_name: string;
  purity_percentage: number;
}

interface LaborRule {
  id: string;
  tier_name: string;
  base_labor_rate: number;
}

export default function OmDiamondsApp() {
  // --- CONFIG / SETTINGS DEFAULTS ---
  const [defaultGoldRate, setDefaultGoldRate] = useState<string>("14000");
  const [defaultDiamondRate, setDefaultDiamondRate] = useState<string>("60000");
  const [defaultWastagePct, setDefaultWastagePct] = useState<string>("8.0");
  const [defaultColorStoneRate, setDefaultColorStoneRate] = useState<string>("200");
  const [defaultCertRate, setDefaultCertRate] = useState<string>("700"); 

  // --- DYNAMIC PURITY SEEDS ---
  const [purities, setPurities] = useState<PurityMapping[]>([
    { id: "1", purity_name: "18K", purity_percentage: 76.0 },
    { id: "2", purity_name: "14K", purity_percentage: 60.0 },
  ]);

  // --- LABOR SEEDS ---
  const [laborRules, setLaborRules] = useState<LaborRule[]>([
    { id: "1", tier_name: "Standard Plain", base_labor_rate: 650 },
  ]);

  // --- NAVIGATION & DRAWER STATE ---
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false); // Slide-out control

  // --- CALCULATOR FORM STATE ---
  const [goldRate, setGoldRate] = useState<string>("");
  const [grossWeight, setGrossWeight] = useState<string>("");
  const [selectedPurity, setSelectedPurity] = useState<string>("1"); 
  
  const [costType, setCostType] = useState<"Labor" | "Wastage">("Labor");
  const [laborRate, setLaborRate] = useState<string>("");
  const [wastagePct, setWastagePct] = useState<string>("");

  const [diamondWeight, setDiamondWeight] = useState<string>("");
  const [diamondRate, setDiamondRate] = useState<string>("");

  const [colorStoneWeight, setColorStoneWeight] = useState<string>("");
  const [colorStoneRate, setColorStoneRate] = useState<string>("");

  const [isCertEnabled, setIsCertEnabled] = useState<boolean>(false);
  const [certRate, setCertRate] = useState<string>("");

  // Discount Configuration
  const [discountType, setDiscountType] = useState<"Percentage" | "Amount">("Percentage");
  const [discountValue, setDiscountValue] = useState<string>("");

  // --- ADMIN FORM INPUTS STATE ---
  const [newPurityName, setNewPurityName] = useState("");
  const [newPurityPct, setNewPurityPct] = useState("");
  const [newLaborTier, setNewLaborTier] = useState("");
  const [newLaborRateInput, setNewLaborRateInput] = useState("");

  // Live sync configuration fields whenever global settings default overrides change
  useEffect(() => {
    setGoldRate(defaultGoldRate);
  }, [defaultGoldRate]);

  useEffect(() => {
    setDiamondRate(defaultDiamondRate);
  }, [defaultDiamondRate]);

  useEffect(() => {
    setWastagePct(defaultWastagePct);
  }, [defaultWastagePct]);

  useEffect(() => {
    setColorStoneRate(defaultColorStoneRate);
  }, [defaultColorStoneRate]);

  useEffect(() => {
    if (isCertEnabled) {
      setCertRate(defaultCertRate); 
    } else {
      setCertRate(""); 
    }
  }, [isCertEnabled, defaultCertRate]);

  useEffect(() => {
    const selectedRule = laborRules.find((l) => l.id === "1");
    if (selectedRule && !laborRate) {
      setLaborRate(selectedRule.base_labor_rate.toString());
    }
  }, [laborRules]);

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

    return {
      subtotal: subtotal.toFixed(2),
      netGoldWeight: netGoldWeight.toFixed(3),
      goldValue: calculatedGoldValue.toFixed(2),
      processingCharge: processingCharge.toFixed(2),
      totalDiamondCost: totalDiamondCost.toFixed(2),
      totalColorStoneCost: totalColorStoneCost.toFixed(2),
      totalCertCost: totalCertCost.toFixed(2),
      appliedDiscount: appliedDiscount.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
    };
  };

  const results = calculateTotal();

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

  const handleAddLabor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaborTier || !newLaborRateInput) return;
    setLaborRules([...laborRules, { id: Date.now().toString(), tier_name: newLaborTier, base_labor_rate: parseFloat(newLaborRateInput) }]);
    setNewLaborTier("");
    setNewLaborRateInput("");
  };

  const handleDeleteLabor = (id: string) => {
    setLaborRules(laborRules.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans relative overflow-x-hidden">
      
      {/* BACKGROUND SHADE OVERLAY (Active when drawer slides open) */}
      {isDrawerOpen && (
        <div 
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* SLIDE-OUT DRAWER FOR MANAGERS */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200 p-5 z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Manager Discounts</h3>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Discount Type</span>
            <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setDiscountType("Percentage")}
                className={`py-1.5 text-xs font-semibold rounded-lg transition ${discountType === "Percentage" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                % Percentage
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("Amount")}
                className={`py-1.5 text-xs font-semibold rounded-lg transition ${discountType === "Amount" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              >
                ₹ Fixed Amount
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Discount Value Given ({discountType === "Percentage" ? "%" : "₹"})
            </label>
            <input
              type="number"
              step={discountType === "Percentage" ? "0.1" : "1"}
              placeholder="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:border-slate-400 focus:outline-none"
            />
          </div>

          <div className="bg-slate-50 border rounded-xl p-3.5 space-y-2 text-xs">
            <span className="block font-bold text-slate-400 uppercase tracking-wide mb-1">Live Impact Summary</span>
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{results.subtotal}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Applied Reduction:</span>
              <span>-₹{results.appliedDiscount}</span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-slate-900 text-sm">
              <span>Final Value:</span>
              <span>₹{results.finalPrice}</span>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-xs transition"
          >
            Apply & Close Drawer
          </button>
        </div>
      </div>

      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700 drop-shadow-sm">
              Om Diamonds
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Secret Option B Switch Trigger */}
            {!isAdminView && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition shadow-sm"
                title="Open Settings Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
              </button>
            )}

            <button
              onClick={() => setIsAdminView(!isAdminView)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-lg text-xs font-semibold transition shadow-sm border border-slate-200"
            >
              {isAdminView ? "← Back to Calculator" : "⚙️ Settings"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-12">
        {!isAdminView ? (
          /* =======================================================
             FRONTEND: RATE CALCULATOR SCREEN
             ======================================================= */
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Calculation Inputs</h2>
              </div>
              
              {/* Gold Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gold Rate (₹/1g)</label>
                  <input
                    type="number"
                    value={goldRate}
                    onChange={(e) => setGoldRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Metal Purity</label>
                  <select
                    value={selectedPurity}
                    onChange={(e) => setSelectedPurity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-sm"
                  >
                    {purities.map((p) => (
                      <option key={p.id} value={p.id}>{p.purity_name} ({p.purity_percentage}%)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Gross Weight (g)</label>
                <input
                  type="number"
                  step="0.001"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="0.000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Cost Type Selection (Labor vs Wastage) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cost Type Mechanism</span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() => setCostType("Labor")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${costType === "Labor" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      Labor
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostType("Wastage")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition ${costType === "Wastage" ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
                    >
                      Wastage
                    </button>
                  </div>
                </div>

                {costType === "Labor" ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Labor Rate (₹/g)</label>
                    <input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Wastage Percentage (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={wastagePct}
                      onChange={(e) => setWastagePct(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Diamond Matrix Inputs */}
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Diamond Weight (ct)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={diamondWeight}
                    onChange={(e) => setDiamondWeight(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Diamond Rate (₹/ct)</label>
                  <input
                    type="number"
                    value={diamondRate}
                    onChange={(e) => setDiamondRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Adaptive Certificate Switch Framework */}
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="certToggle" className="text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer select-none">
                    Apply Certification Charge
                  </label>
                  <input
                    id="certToggle"
                    type="checkbox"
                    checked={isCertEnabled}
                    onChange={(e) => setIsCertEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 accent-amber-500 cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 transition-colors ${isCertEnabled ? "text-slate-600" : "text-slate-300"}`}>
                    Certificate Rate (₹/Diamond ct)
                  </label>
                  <input
                    type="number"
                    disabled={!isCertEnabled}
                    value={certRate}
                    onChange={(e) => setCertRate(e.target.value)}
                    placeholder={isCertEnabled ? "Enter rate..." : "Disabled (₹0)"}
                    className={`w-full px-3 py-2 border rounded-xl text-sm font-medium transition-all ${
                      isCertEnabled 
                        ? "border-slate-300 bg-white text-slate-900" 
                        : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed select-none"
                    }`}
                  />
                </div>
              </div>

              {/* Color Stone Matrix Inputs */}
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Color Stone Wt (ct)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={colorStoneWeight}
                    onChange={(e) => setColorStoneWeight(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Color Stone Rate (₹/ct)</label>
                  <input
                    type="number"
                    value={colorStoneRate}
                    onChange={(e) => setColorStoneRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

            </div>

            {/* RECEIPT CALCULATION VIEW */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pricing Valuation</h2>
              
              <div className="space-y-3 border-b border-slate-800 pb-4 text-sm text-slate-300">
                <div className="flex justify-between font-medium text-amber-100">
                  <span>Calculated Net Gold Wt:</span>
                  <span className="font-mono">{results.netGoldWeight} g</span>
                </div>
                <hr className="border-slate-800" />
                <div className="flex justify-between">
                  <span>Net Gold Value:</span>
                  <span className="font-mono">₹{results.goldValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>{costType === "Labor" ? "Labor Charges (on Net Wt)" : "Wastage Cost (on Net Wt)"}:</span>
                  <span className="font-mono">₹{results.processingCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Diamond Value:</span>
                  <span className="font-mono">₹{results.totalDiamondCost}</span>
                </div>
                {isCertEnabled && parseFloat(results.totalCertCost) > 0 && (
                  <div className="flex justify-between text-amber-200/90">
                    <span>Diamond Cert Fee:</span>
                    <span className="font-mono">₹{results.totalCertCost}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Total Color Stone Value:</span>
                  <span className="font-mono">₹{results.totalColorStoneCost}</span>
                </div>
                {parseFloat(results.appliedDiscount) > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Applied Discount:</span>
                    <span className="font-mono">-₹{results.appliedDiscount}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-400">Total Valuation:</span>
                <span className="text-3xl font-extrabold text-amber-400 font-mono">₹{results.finalPrice}</span>
              </div>
            </div>
          </div>
        ) : (
          /* =======================================================
             BACKEND: MANAGE RULES VIEW
             ======================================================= */
          <div className="space-y-6">
            {/* DEFAULT BASELINE SETTINGS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b pb-2">Global System Defaults</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Gold Rate (₹/1g)</label>
                  <input
                    type="number"
                    value={defaultGoldRate}
                    onChange={(e) => setDefaultGoldRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Diamond Rate (₹/ct)</label>
                  <input
                    type="number"
                    value={defaultDiamondRate}
                    onChange={(e) => setDefaultDiamondRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Certificate Rate (₹/ct)</label>
                  <input
                    type="number"
                    value={defaultCertRate}
                    onChange={(e) => setDefaultCertRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Wastage Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultWastagePct}
                    onChange={(e) => setDefaultWastagePct(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Default Color Stone Rate (₹/ct)</label>
                  <input
                    type="number"
                    value={defaultColorStoneRate}
                    onChange={(e) => setDefaultColorStoneRate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* PURITY MATRIX WITH MANAGEMENT */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b pb-2">Purity Dynamic Matrix</h2>
              <div className="space-y-2">
                {purities.map((p) => (
                  <div key={p.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">{p.purity_name} ({p.purity_percentage}%)</span>
                    <button
                      onClick={() => handleDeletePurity(p.id)}
                      className="text-xs text-red-500 font-medium hover:underline px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddPurity} className="flex gap-2 pt-2 border-t border-dashed">
                <input
                  type="text"
                  placeholder="e.g., 22K"
                  value={newPurityName}
                  onChange={(e) => setNewPurityName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border rounded-xl outline-none"
                />
                <input
                  type="number"
                  placeholder="%"
                  value={newPurityPct}
                  onChange={(e) => setNewPurityPct(e.target.value)}
                  className="w-20 px-3 py-1.5 text-sm border rounded-xl outline-none"
                />
                <button type="submit" className="px-3 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded-xl">Add</button>
              </form>
            </div>

            {/* LABOR MATRIX RULES */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b pb-2">Labour Framework</h2>
              <div className="space-y-2">
                {laborRules.map((l) => (
                  <div key={l.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">{l.tier_name} - ₹{l.base_labor_rate}/g</span>
                    {laborRules.length > 1 && (
                      <button
                        onClick={() => handleDeleteLabor(l.id)}
                        className="text-xs text-red-500 font-medium hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddLabor} className="flex gap-2 pt-2 border-t border-dashed">
                <input
                  type="text"
                  placeholder="Tier Name"
                  value={newLaborTier}
                  onChange={(e) => setNewLaborTier(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border rounded-xl outline-none"
                />
                <input
                  type="number"
                  placeholder="₹/g"
                  value={newLaborRateInput}
                  onChange={(e) => setNewLaborRateInput(e.target.value)}
                  className="w-20 px-3 py-1.5 text-sm border rounded-xl outline-none"
                />
                <button type="submit" className="px-3 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded-xl">Add</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}