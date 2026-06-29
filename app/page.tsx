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
  const [defaultColorStoneRate, setDefaultColorStoneRate] = useState<string>("200"); // Added requested default

  // --- DYNAMIC PURITY SEEDS ---
  const [purities, setPurities] = useState<PurityMapping[]>([
    { id: "1", purity_name: "18K", purity_percentage: 76.0 },
    { id: "2", purity_name: "14K", purity_percentage: 60.0 },
  ]);

  // --- LABOR SEEDS ---
  const [laborRules, setLaborRules] = useState<LaborRule[]>([
    { id: "1", tier_name: "Standard Plain", base_labor_rate: 650 },
  ]);

  // --- NAVIGATION STATE ---
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // --- CALCULATOR FORM STATE ---
  const [goldRate, setGoldRate] = useState<string>("");
  const [grossWeight, setGrossWeight] = useState<string>("");
  const [selectedPurity, setSelectedPurity] = useState<string>("1"); // Default 18K
  
  // Cost Type Management (Labor vs Wastage)
  const [costType, setCostType] = useState<"Labor" | "Wastage">("Labor");
  const [laborRate, setLaborRate] = useState<string>("");
  const [wastagePct, setWastagePct] = useState<string>("");

  // Diamonds
  const [diamondWeight, setDiamondWeight] = useState<string>("");
  const [diamondRate, setDiamondRate] = useState<string>("");

  // Color Stones
  const [colorStoneWeight, setColorStoneWeight] = useState<string>("");
  const [colorStoneRate, setColorStoneRate] = useState<string>("");

  // --- ADMIN FORM INPUTS STATE ---
  const [newPurityName, setNewPurityName] = useState("");
  const [newPurityPct, setNewPurityPct] = useState("");
  const [newLaborTier, setNewLaborTier] = useState("");
  const [newLaborRateInput, setNewLaborRateInput] = useState("");

  // Sync defaults on initialization
  useEffect(() => {
    if (!goldRate) setGoldRate(defaultGoldRate);
    if (!diamondRate) setDiamondRate(defaultDiamondRate);
    if (!wastagePct) setWastagePct(defaultWastagePct);
    if (!colorStoneRate) setColorStoneRate(defaultColorStoneRate);
  }, [defaultGoldRate, defaultDiamondRate, defaultWastagePct, defaultColorStoneRate]);

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

    const purityObj = purities.find((p) => p.id === selectedPurity);
    const purityPct = purityObj ? purityObj.purity_percentage : 76.0;

    // Convert gemstone carats to grams (1 ct = 0.2 grams)
    const stonesWeightGrams = (dWeightCt + csWeightCt) * 0.2;

    // Calculate Net Gold Weight
    const netGoldWeight = Math.max(0, gWeight - stonesWeightGrams);

    let calculatedGoldValue = 0;
    let processingCharge = 0;

    if (costType === "Labor") {
      // Standard separate flow: Gold Purity Value + Weight-based Labor
      calculatedGoldValue = netGoldWeight * gRatePerGram * (purityPct / 100);
      const lRate = parseFloat(laborRate) || 0;
      processingCharge = netGoldWeight * lRate;
    } else {
      // Adjusted specification flow: Net Wt * Rate * (Purity % + Wastage %)
      const wPct = parseFloat(wastagePct) || 0;
      const combinedFactor = (purityPct + wPct) / 100;
      
      // Total combined metal cost
      const totalMetalCost = netGoldWeight * gRatePerGram * combinedFactor;
      
      // Separate out for receipt transparency
      calculatedGoldValue = netGoldWeight * gRatePerGram * (purityPct / 100);
      processingCharge = netGoldWeight * gRatePerGram * (wPct / 100);
    }

    // Gemstone Pricing
    const totalDiamondCost = dWeightCt * dRate;
    const totalColorStoneCost = csWeightCt * csRate;

    // Final Aggregate Valuation Sum
    const finalPrice = calculatedGoldValue + processingCharge + totalDiamondCost + totalColorStoneCost;

    return {
      netGoldWeight: netGoldWeight.toFixed(3),
      goldValue: calculatedGoldValue.toFixed(2),
      processingCharge: processingCharge.toFixed(2),
      totalDiamondCost: totalDiamondCost.toFixed(2),
      totalColorStoneCost: totalColorStoneCost.toFixed(2),
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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
      {/* HEADER BAR */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          
          {/* 1. Left Side: Your Clean, Tailored Gold Text Brand Mark */}
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700 drop-shadow-sm">
              Om Diamonds
            </span>
          </div>

          {/* 2. Right Side: The Smart, Working Toggle Button */}
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-lg text-xs font-semibold transition shadow-sm border border-slate-200"
          >
            {isAdminView ? "← Back to Calculator" : "⚙️ Manage Rules"}
          </button>

        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-12">
        {!isAdminView ? (
          /* =======================================================
             FRONTEND: RATE CALCULATOR SCREEN
             ======================================================= */
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Calculation Inputs</h2>
              
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
                <div className="flex justify-between">
                  <span>Total Color Stone Value:</span>
                  <span className="font-mono">₹{results.totalColorStoneCost}</span>
                </div>
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