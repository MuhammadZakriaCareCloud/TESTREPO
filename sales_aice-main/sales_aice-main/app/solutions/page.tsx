'use client'
import { useEffect, useState } from 'react';
import CallToAction from '@/components/CTA';
import Link from "next/link";
import "@/app/page.css";

// Define the FormData type interface
interface FormData {
  salesReps: number;
  avgSalary: number;
  callsPerDay: number;
  conversionRate: number;
}

const SolutionPage = () => {
  const [roiData, setRoiData] = useState({
    costSavings: '$150,000',
    productivityGain: '300%',
    roiPercentage: '450%',
  });

  // Define the state for form data with appropriate types
  const [formData, setFormData] = useState<FormData>({
    salesReps: 5,
    avgSalary: 60000,
    callsPerDay: 50,
    conversionRate: 15,
  });

  // Handle input change for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [id as keyof FormData]: parseInt(value) || 0, // Cast id to keyof FormData
    }));
  };

  // Calculate ROI based on the form data values
  useEffect(() => {
    const calculateROI = () => {
      const { salesReps, avgSalary, callsPerDay } = formData;

      const annualSavings = salesReps * avgSalary * 0.7;
      const productivityGain = Math.round((callsPerDay * 10 / callsPerDay - 1) * 100);
      const aiceCost = salesReps * 2000 * 12;
      const roi = Math.round((annualSavings / aiceCost) * 100);

      setRoiData({
        costSavings: `$${annualSavings.toLocaleString()}`,
        productivityGain: `${productivityGain}%`,
        roiPercentage: `${roi}%`,
      });
    };

    calculateROI();
  }, [formData]);

  // Handle smooth scrolling for anchor links
  useEffect(() => {
    const handleSmoothScroll = (e: any) => {
      const target = document.querySelector(e.target.getAttribute('href'));
      if (target) {
        e.preventDefault();
        (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => anchor.addEventListener('click', handleSmoothScroll));

    return () => anchors.forEach((anchor) => anchor.removeEventListener('click', handleSmoothScroll));
  }, []);

  // Handle navbar background color change on scroll
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        (navbar as HTMLElement).style.background = window.scrollY > 100 ? 'rgba(26, 38, 57, 0.98)' : 'rgba(26, 38, 57, 0.95)';
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Observe and animate role cards when they come into view
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach((card) => {
      (card as HTMLElement).style.opacity = '0';
      (card as HTMLElement).style.transform = 'translateY(30px)';
      (card as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });

    return () => {
      roleCards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  const [clients, setClients] = useState(10);
  const [monthlyCharge, setMonthlyCharge] = useState(710);
  const agencyRevenue = clients * monthlyCharge;

  // === Business State ===
  const [callsPerDay, setCallsPerDay] = useState(200);
  const [callDuration, setCallDuration] = useState(5);
  const [agents, setAgents] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(15);
  const [costPerCall, setCostPerCall] = useState(0.25);

  const monthlyCalls = callsPerDay * 22;
  const totalCostHuman = (agents * hourlyRate * callDuration * monthlyCalls) / (60 * agents);
  const totalCostAICE = costPerCall * monthlyCalls;
  const businessSavings = Math.max(0, totalCostHuman - totalCostAICE);

  return (
    <>
      <div>
<section className="hero1 pt-6 sm:pt-8 md:pt-16 pb-12 md:pb-24 flex items-center justify-center min-h-[70vh] overflow-hidden">
  <div className="w-full max-w-screen-xl px-4 sm:px-8 mx-auto text-center overflow-hidden">
    <div className="hero1-content text-center max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-[fadeInUp_1s_ease-out] opacity-0 [animation-fill-mode:forwards]">
        Built for Your Sales Role
      </h1>
      <p className="hero1-subtitle mb-2 text-lg md:text-xl animate-[fadeInUp_1s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
        Tailored AI solutions that deliver measurable outcomes for every position in your sales organization.
      </p>
    </div>

    {/* Break out of container for full-width GIF + text */}
    <div className="max-w-6xl mx-auto mb-0 mt-4 w-full px-4 overflow-hidden animate-[fadeInUp_1s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
    <div className="w-full flex flex-col items-center justify-center">
      <img 
        src="Solutionanimationgif2.gif" 
        alt="Sales AI Animation" 
        className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl h-auto object-cover mx-auto animate-[fadeInUp_1s_ease-out_0.6s] opacity-0 [animation-fill-mode:forwards]"
      />
     <h3 className="text-center mt-15 !text-[16px] sm:!text-base md:!text-lg lg:!text-xl leading-relaxed px-6 max-w-2xl md:max-w-4xl mx-auto animate-[fadeInUp_1s_ease-out_0.8s] opacity-0 [animation-fill-mode:forwards]">
        Seamlessly integrate with more than 20 CRMs covering 80% of the market, making it effortless to find the perfect fit for your sales stack.
      </h3>
    </div>
    </div>
  </div>
</section>




        <section className="pb-24 bg-[#122037]">
          <div className="max-w-screen-xl mx-auto px-8">
            <div className="text-center mb-[4rem]">
              <h2>Choose Your AI Sales Assistant</h2>
              <p>Specialized configurations for maximum impact in your specific role</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-16 justify-center">

                {[{
                  id: 'sdr',
                  icon: 'loading.gif',   // 👈 replace with your SDR gif
                  title: 'SDR Automation',
                  subtitle: 'Prospecting + Qualification',
                  features: [
                    'Automated lead research and qualification',
                    'Personalized outreach at scale',
                    'Meeting scheduling and calendar integration',
                    'Lead scoring and pipeline management',
                    'Follow-up sequence automation',
                    'CRM data enrichment',
                  ],
                  cta: 'Start SDR Trial',
                },
                {
                  id: 'inbound',
                  icon: 'Inbound Agent.gif',
                  title: 'Inbound Agent',
                  subtitle: 'Answering + Scheduling',
                  features: [
                    '24/7 inbound call handling',
                    'Intelligent call routing and escalation',
                    'Real-time appointment scheduling',
                    'Lead capture and qualification',
                    'Multi-language support',
                    'Integration with existing phone systems',
                  ],
                  cta: 'Try Inbound AI',
                },
                {
                  id: 'closer',
                  icon: 'Deal closer.gif',
                  title: 'Sales Closer',
                  subtitle: 'Objection Handling + Deal Closing',
                  features: [
                    'Advanced objection handling frameworks',
                    'Emotional intelligence and rapport building',
                    'Multiple closing techniques',
                    'Real-time negotiation support',
                    'Deal progression tracking',
                    'Win/loss analysis and optimization',
                  ],
                  cta: 'Deploy Closer AI',
                },
                {
                  id: 'nurturing',
                  icon: 'Nurturing Agent.GIF',
                  title: 'Nurturing Agent',
                  subtitle: 'Follow-ups + Renewals',
                  features: [
                    'Automated follow-up campaigns',
                    'Renewal and upsell conversations',
                    'Customer health monitoring',
                    'Personalized touchpoint scheduling',
                    'Churn prevention strategies',
                    'Relationship maintenance automation',
                  ],
                  cta: 'Launch Nurturing',
                },
                {
                  id: 'customer-success',
                  icon: 'handshake.gif',
                  title: 'Customer Success AI',
                  subtitle: 'Account Check-ins + Upsell Cues',
                  features: [
                    'Proactive customer health checks',
                    'Usage pattern analysis and insights',
                    'Expansion opportunity identification',
                    'Automated satisfaction surveys',
                    'Support ticket trend analysis',
                    'Success milestone celebrations',
                  ],
                  cta: 'Enable CS AI',
                }].map((role) => (
                  <div key={role.id} className="role-card" id={role.id}>
                    <div className="role-icon">
                      <img src={role.icon} alt={role.title} className="w-15 h-15" />
                    </div>
                    <h3 className="role-title">{role.title}</h3>
                    <p className="role-subtitle">{role.subtitle}</p>
                    <ul className="role-features">
                      {role.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                    <Link href="#contact" className="btn1 btn1-primary">{role.cta}</Link>
                  </div>
                ))}
              </div>

          </div>
        </section>

        <section className="p-8 flex flex-col items-center justify-center bg-[#1A2739] text-white">
          <h2 className="text-2xl font-bold mb-6 sm:text-sm">Pricing Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
            {/* === Agency Calculator === */}
            <div className="border border-[#FFD700] p-6 rounded-lg shadow-lg w-full">
              <h3 className="text-xl font-semibold mb-2 text-[#FACC15]">
                Agency Calculator: <span className="highlight">Profit Calculator</span>
              </h3>
              <p className="mb-4 text-gray-400">See how much you can make with Sales AICE</p>

              {/* How many clients */}
              <div className="grid-cols-4 gap-4 mb-4  ">
                <div className="col-span-3 flex flex-col items-start gap-1">
                  <label>How many clients do you have?</label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={clients}
                    onChange={(e) => setClients(+e.target.value)}
                    className="w-full h-2 bg-[#041b38] rounded-full cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="number"
                    value={clients}
                    onChange={(e) => setClients(+e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[#041B38] text-white text-center"
                  />
                </div>
              </div>

              {/* How much do you charge per client monthly */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-3 flex flex-col items-start gap-1">
                  <label>How much do you charge per client monthly?</label>
                  <input
                    type="range"
                    min={100}
                    max={2000}
                    value={monthlyCharge}
                    onChange={(e) => setMonthlyCharge(+e.target.value)}
                    className="w-full h-2 bg-[#041b38] rounded-full cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="number"
                    className="w-full px-2 py-1 rounded text-white text-center"
                    value={monthlyCharge}
                    onChange={(e) => setMonthlyCharge(+e.target.value)}
                  />
                </div>
              </div>

              <p className="result-label mt-4 font-medium">Estimated Monthly Revenue</p>
             
                <div className='flex flex-col'>Amount : <span className="result-amount text-xl text-green-700 font-bold">${agencyRevenue.toLocaleString()}</span></div>
              
            </div>

            {/* === Business Calculator === */}
            <div className="border p-6 border-[#FFD700] rounded-lg shadow-lg w-full">
              <h3 className="text-xl font-semibold mb-2 text-[#FACC15]">
                Business Calculator: <span className="highlight">Savings Calculator</span>
              </h3>
              <p className="mb-4 text-gray-400">See how much you can save using Sales AICE</p>

              {/* How many calls per day */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-3 flex flex-col items-start gap-1">
                  <label>How many calls per day? </label>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    value={callsPerDay}
                    onChange={(e) => setCallsPerDay(+e.target.value)}
                    className="w-full h-2 bg-[#041b38] rounded-full cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="number"
                    value={callsPerDay}
                    onChange={(e) => setCallsPerDay(+e.target.value)}
                    className="w-full px-2 py-1 rounded bg-transparent text-white text-center"
                  />
                </div>
              </div>

              {/* Avg. call duration */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-3 flex flex-col items-start gap-1">
                  <label>Avg. call duration (minutes)</label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={callDuration}
                    onChange={(e) => setCallDuration(+e.target.value)}
                    className="w-full h-2 bg-[#041b38] rounded-full cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="number"
                    value={callDuration}
                    onChange={(e) => setCallDuration(+e.target.value)}
                    className="w-full px-2 py-1 rounded bg-transparent text-white text-center"
                  />
                </div>
              </div>

              {/* # of agents/closers */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-3 flex flex-col items-start gap-1">
                  <label># of agents/closers</label>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={agents}
                    onChange={(e) => setAgents(+e.target.value)}
                    className="w-full h-2 bg-[#041b38] rounded-full cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="number"
                    value={agents}
                    onChange={(e) => setAgents(+e.target.value)}
                    className="w-full px-2 py-1 rounded bg-transparent text-white text-center"
                  />
                </div>
              </div>

              {/* Average hourly salary per agent */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-3 flex flex-col items-start gap-1">
                  <label>Average hourly salary per agent</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(+e.target.value)}
                    className="w-full h-2 bg-[#041b38] rounded-full  cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(+e.target.value)}
                    className="w-full px-2 py-1 rounded text-white text-center"
                  />
                </div>
              </div>

              {/* Sales AICE cost per call */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-3 flex flex-col items-start gap-1">
                  <label>Sales AICE cost per call</label>
                  <input
                    type="range"
                    step={0.01}
                    min={0.05}
                    max={5.0}
                    value={costPerCall}
                    onChange={(e) => setCostPerCall(+e.target.value)}
                    className="w-full h-2 bg-[#041b38] rounded-full cursor-pointer"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <input
                    type="number"
                    step={0.01}
                    value={costPerCall}
                    onChange={(e) => setCostPerCall(+e.target.value)}
                    className="w-full px-2 py-1 rounded bg-transparent text-white text-center"
                  />
                </div>
              </div>

              <p className="result-label mt-4 font-medium">Estimated Monthly Savings</p>
              <p className="result-amount text-xl text-blue-700 font-bold">
                ${businessSavings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </section>



        {/* <section className="roi-calculator">
        <div className="container1">
          <div className="section-title text-center">
            <h2>Calculate Your ROI</h2>
            <p>See how much Sales AICE can save your organization</p>
          </div>

          <div className="calculator-container">
            <div className="calculator-inputs">
              {[{ label: 'Number of Sales Reps', id: 'salesReps', min: 1, max: 1000 },
              { label: 'Average Annual Salary', id: 'avgSalary', min: 30000, max: 200000 },
              { label: 'Calls per Rep per Day', id: 'callsPerDay', min: 10, max: 200 },
              { label: 'Current Conversion Rate (%)', id: 'conversionRate', min: 1, max: 50 }].map((input) => (
                <div className="input-group" key={input.id}>
                  <label htmlFor={input.id}>{input.label}</label>
                  <input
                    type="number"
                    id={input.id}
                    value={formData[input.id as keyof FormData]} // Using the correct typing for formData
                    min={input.min}
                    max={input.max}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>

            <div className="bg-[rgba(255,107,53,0.1)] border border-orange-500 rounded-[15px] p-8 text-center max-w-xs mx-auto">
              <h3 className="text-2xl font-bold mb-6 text-white">Annual Savings with Sales AICE</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                <div className="text-center">
                  <span className="text-[2.5rem] font-bold text-yellow-400 block" id="cost-savings">{roiData.costSavings}</span>
                  <span className="text-white text-sm">Cost Savings</span>
                </div>
                <div className="text-center">
                  <span className="text-[2.5rem] font-bold text-yellow-400 block" id="productivity-gain">{roiData.productivityGain}</span>
                  <span className="text-white text-sm">Productivity Increase</span>
                </div>
                <div className="text-center">
                  <span className="text-[2.5rem] font-bold text-yellow-400 block" id="roi-percentage">{roiData.roiPercentage}</span>
                  <span className="text-white text-sm">ROI</span>
                </div>
              </div>

              <p className="text-xs mt-4 text-gray-600">*Based on industry averages and customer data.</p>
            </div>

          </div>
        </div>
      </section> */}



        <CallToAction />

      </div>
    </>
  );
};

export default SolutionPage;
