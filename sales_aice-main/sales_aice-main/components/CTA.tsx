// import { Link } from "Next/Link";

const CallToAction = () => {
    return (
        <section className="py-24 bg-[#1C3766] text-center">
            <div className="container1">
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">
                    Ready to Transform Your Sales Process?
                </h2>
                <p className="text-lg mb-12 max-w-2xl mx-auto">
                    Join forward-thinking companies that are already using AI to close more deals with less effort.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                    <a href="/login" className="btn1 btn1-primary py-3 px-6 rounded-lg font-semibold hover:bg-yellow-400 transition">
                        Start Free Trial
                    </a>
                    <a href="/solutions" className="btn1 btn1-secondary py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition">
                        Explore Solutions
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;
