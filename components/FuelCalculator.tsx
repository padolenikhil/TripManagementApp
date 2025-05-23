
import React, { useState } from 'react';

type FuelType = 'petrol' | 'diesel';

interface CalculationResults {
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
}

const FuelCalculator: React.FC = () => {
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [distance, setDistance] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [fuelPrice, setFuelPrice] = useState<string>('');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    setResults(null);

    const numDistance = parseFloat(distance);
    const numMileage = parseFloat(mileage);
    const numFuelPrice = parseFloat(fuelPrice);

    if (isNaN(numDistance) || numDistance <= 0) {
      setError('Please enter a valid daily distance.');
      return;
    }
    if (isNaN(numMileage) || numMileage <= 0) {
      setError('Please enter a valid mileage.');
      return;
    }
    if (isNaN(numFuelPrice) || numFuelPrice <= 0) {
      setError('Please enter a valid fuel price.');
      return;
    }

    const dailyFuelNeeded = numDistance / numMileage;
    const dailyCost = dailyFuelNeeded * numFuelPrice;
    const monthlyCost = dailyCost * 30; // Approximation
    const yearlyCost = dailyCost * 365; // Approximation

    setResults({ dailyCost, monthlyCost, yearlyCost });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const inputBaseClasses = "w-full p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
  const inputBgClasses = "bg-white dark:bg-slate-700";
  const unitClasses = "px-3 py-3 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border border-l-0 border-slate-300 dark:border-slate-500 rounded-r-lg whitespace-nowrap";
  const labelClasses = "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1";


  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl" style={{background: "linear-gradient(145deg, #2d3748, #3c4a60)", boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"}} > {/* Matching dark theme from image */}
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-8">Fuel Cost Calculator</h2>

        {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md text-sm" role="alert">
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <div className="space-y-6">
                <div>
                    <label className={labelClasses}>Fuel Type</label>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => setFuelType('petrol')}
                            aria-pressed={fuelType === 'petrol'}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 dark:focus:ring-offset-slate-900
                                ${fuelType === 'petrol' ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:ring-blue-500' : 'bg-slate-600 hover:bg-slate-500 text-slate-300 focus:ring-slate-400'}`}
                        >
                            PETROL
                        </button>
                        <button
                            type="button"
                            onClick={() => setFuelType('diesel')}
                             aria-pressed={fuelType === 'diesel'}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 dark:focus:ring-offset-slate-900
                                ${fuelType === 'diesel' ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:ring-blue-500' : 'bg-slate-600 hover:bg-slate-500 text-slate-300 focus:ring-slate-400'}`}
                        >
                            DIESEL
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="dailyDistance" className={labelClasses}>Daily Distance Travelled</label>
                    <div className="flex">
                        <input
                            id="dailyDistance"
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                            placeholder="e.g., 70"
                            className={`${inputBaseClasses} ${inputBgClasses} border border-slate-300 dark:border-slate-500 rounded-l-lg`}
                            aria-describedby="distance-unit"
                        />
                        <span id="distance-unit" className={unitClasses}>KM</span>
                    </div>
                </div>

                <div>
                    <label htmlFor="mileage" className={labelClasses}>Mileage</label>
                    <div className="flex">
                        <input
                            id="mileage"
                            type="number"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                            placeholder="e.g., 15"
                            className={`${inputBaseClasses} ${inputBgClasses} border border-slate-300 dark:border-slate-500 rounded-l-lg`}
                            aria-describedby="mileage-unit"
                        />
                        <span id="mileage-unit" className={unitClasses}>KM/LTR</span>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="fuelPrice" className={labelClasses}>Fuel Cost</label>
                    <div className="flex">
                        <input
                            id="fuelPrice"
                            type="number"
                            value={fuelPrice}
                            onChange={(e) => setFuelPrice(e.target.value)}
                            placeholder="e.g., 94.77"
                            className={`${inputBaseClasses} ${inputBgClasses} border border-slate-300 dark:border-slate-500 rounded-l-lg`}
                             aria-describedby="fuelprice-unit"
                        />
                        <span id="fuelprice-unit" className={unitClasses}>₹/L</span>
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 dark:focus:ring-offset-slate-900"
                >
                    Calculate
                </button>
            </div>

            {/* Results Section */}
            <div className="bg-slate-700/50 p-6 rounded-lg shadow-inner">
                 <div className="grid grid-cols-2 py-2 border-b border-slate-600">
                    <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Cost Category</h3>
                    <h3 className="font-semibold text-sm text-slate-400 uppercase tracking-wider text-right">Estimated Price</h3>
                </div>
                
                {!results ? (
                    <p className="text-slate-400 mt-4 text-center italic">Enter details and click "Calculate" to see results.</p>
                ) : (
                    <div className="space-y-3 mt-3">
                        <div className="grid grid-cols-2 items-center py-2">
                            <span className="text-slate-300">Daily Fuel Cost</span>
                            <span className="text-xl font-semibold text-slate-100 text-right">{formatCurrency(results.dailyCost)}</span>
                        </div>
                         <div className="grid grid-cols-2 items-center py-2 border-t border-slate-600">
                            <span className="text-slate-300">Monthly Fuel Cost</span>
                            <span className="text-xl font-semibold text-slate-100 text-right">{formatCurrency(results.monthlyCost)}</span>
                        </div>
                         <div className="grid grid-cols-2 items-center py-2 border-t border-slate-600">
                            <span className="text-slate-300">Yearly Fuel Cost</span>
                            <span className="text-xl font-semibold text-slate-100 text-right">{formatCurrency(results.yearlyCost)}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default FuelCalculator;
