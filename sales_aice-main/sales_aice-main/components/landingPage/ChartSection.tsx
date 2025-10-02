import Link from 'next/link';

const Chart = () => {
  return (
    <>
    <section className='bg-[#131F36]'>
      <div className="container1 px-4 sm:px-8 bg-[#131F36]">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">The Future of Sales is AI Driven</h2>
          <h4 className="text-xl md:text-2xl mt-2">Unlock Your Share of a $15 Trillion Opportunity</h4>
        </div>

        <h3 className="text-center md:text-left w-full text-xl md:text-2xl font-semibold mb-4">
          AI Adoption is Accelerating - Be Ahead of the Curve
        </h3>
        <p className="text-center md:text-left w-full text-xl md:text-xl font-semibold mb-4">
          In just 5 years, AI adoption has skyrocketed from 0% to 50% in the enterprise sector. 
              Don't get left behind as your competitors leverage AI to supercharge their sales teams.
        </p>
              
            
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* GIF and Text Section */}
          <div className="flex justify-between items-start w-full flex-wrap">
            {/* GIF */}
            <div className="w-full md:w-[90%]">
              <img
                src="/chart2.gif"  // Replace with the actual path of your GIF
                alt="Animated GIF"
                className="w-full h-auto rounded-lg"
              />
            </div>

            {/* Text */}
            
          </div>
        </div>

        {/* Buttons */}
        <div className="text-center mb-8">
          <button className="btn1 btn1-primary mr-4 mb-2">
            <Link href="/login">Start Your Free Trial Today</Link>
          </button>
          <button className="btn1 btn1-secondary">
            <Link href="/login">Book a Live Demo</Link>
          </button>
        </div>
      </div>
      </section>
    </>
  );
}

export default Chart;
