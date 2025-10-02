import React, { useState } from "react";

const PricingCalculator: React.FC = () => {
  // === Agency State ===
  const [clients, setClients] = useState(10);
  const [monthlyCharge, setMonthlyCharge] = useState(710);
  const agencyRevenue = clients * monthlyCharge;

  // === Business State ===
  const [callsPerDay, setCallsPerDay] = useState(200);
  const [callDuration, setCallDuration] = useState(5);
  const [agents, setAgents] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(15);
  const [costPerCall, setCostPerCall] = useState(0.25);

  // const monthlyCalls = callsPerDay * 22;
  // const totalCostHuman = (agents * hourlyRate * callDuration * monthlyCalls) / (60 * agents);
  // const totalCostAICE = costPerCall * monthlyCalls;
  // const businessSavings = Math.max(0, totalCostHuman - totalCostAICE);

  const monthlyCalls = callsPerDay * 22; // workdays/month

  // total human hours = (callDuration in minutes * total calls) / 60
  const totalHumanHours = (callDuration * monthlyCalls) / 60;

  // total cost for humans (hourly rate * total hours)
  const totalCostHuman = totalHumanHours * hourlyRate;

  // total cost for Sales AICE
  const totalCostAICE = costPerCall * monthlyCalls;

  // savings
  const businessSavings = Math.max(0, totalCostHuman - totalCostAICE);


  return (
    <section className="bg-[#1A2739] text-white py-12 px-6 md:px-16">
      <h2 className="text-3xl font-bold text-center mb-10">Pricing Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Agency Calculator */}
        <div className="bg-transparent border p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-yellow-400 mb-2">
            Agency Calculator: <span className="text-white">(Profit Calculator)</span>
          </h3>
          <p className="mb-4 text-gray-300">See how much you can make with Sales AICE</p>

          <label className="block mb-1">How many clients do you have?</label>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="range"
              min={1}
              max={100}
              value={clients}
              onChange={(e) => setClients(Number(e.target.value))}
              className="w-full mb-2"
            />
            <input
              type="number"
              value={clients}
              onChange={(e) => setClients(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded text-black"
            />
          </div>

          <label className="block mb-1">How much do you charge per client monthly?</label>
          <div className="flex items-center gap-4 mb-4">

            <input
              type="range"
              min={100}
              max={5000}
              step={10}
              value={monthlyCharge}
              onChange={(e) => setMonthlyCharge(Number(e.target.value))}
              className="w-full mb-2"
            />
            <input
              type="number"
              value={monthlyCharge}
              onChange={(e) => setMonthlyCharge(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded text-black"
            />
          </div>
          <h4 className="text-lg font-semibold text-gray-300">Estimated Monthly revenue</h4>
          <p className="text-3xl font-bold text-yellow-400">${agencyRevenue.toLocaleString()}</p>
        </div>

        {/* Business Calculator */}
        <div className="bg-transparent border p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-blue-300 mb-2">
            Business Calculator: <span className="text-white">(Savings Calculator)</span>
          </h3>
          <p className="mb-4 text-gray-300">See how much you can save by using Sales AICE.</p>

          <label className="block mb-1">How many calls per day?</label>
          <div className="flex items-center gap-4 mb-4">

            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={callsPerDay}
              onChange={(e) => setCallsPerDay(Number(e.target.value))}
              className="w-full mb-2"
            />
            <input
              type="number"
              value={callsPerDay}
              onChange={(e) => setCallsPerDay(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded text-black"
            />
          </div>
          <label className="block mb-1">Avg. call duration (minutes)</label>
          <div className="flex items-center gap-4 mb-4">

            <input
              type="range"
              min={1}
              max={60}
              value={callDuration}
              onChange={(e) => setCallDuration(Number(e.target.value))}
              className="w-full mb-2"
            />
            <input
              type="number"
              value={callDuration}
              onChange={(e) => setCallDuration(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded text-black"
            />
          </div>
          <label className="block mb-1"># of agents/closers</label>
          <div className="flex items-center gap-4 mb-4">

            <input
              type="range"
              min={1}
              max={50}
              value={agents}
              onChange={(e) => setAgents(Number(e.target.value))}
              className="w-full mb-2"
            />
            <input
              type="number"
              value={agents}
              onChange={(e) => setAgents(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded text-black"
            />
          </div>
          <label className="block mb-1">Average hourly salary per agent ($)</label>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="range"
              min={1}
              max={50}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full mb-2"
            />
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded text-black"
            />

          </div>
          <label className="block mb-1">Sales AICE cost per call ($)</label>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="range"
              min={1}
              max={50}
              value={costPerCall}
              onChange={(e) => setCostPerCall(Number(e.target.value))}
              className="w-full mb-2"
            />
            <input
              type="number"
              step={0.01}
              value={costPerCall}
              onChange={(e) => setCostPerCall(Number(e.target.value))}
              className="w-full mb-4 p-2 rounded text-black"
            />
          </div>
          <h4 className="text-lg font-semibold text-gray-300">Estimated Monthly Savings</h4>
          <p className="text-3xl font-bold text-green-400">${businessSavings.toLocaleString()}</p>
        </div>
      </div>
    </section>
  );
};

export default PricingCalculator;
