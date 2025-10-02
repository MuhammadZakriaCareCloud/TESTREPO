import Link  from "next/link";
import '../app/page.css';
// import '../index.css';

const Footer = () => {
    return (
        <footer className="footer" id="contact">
            <div className="container1 mx-auto px-4">
                <div className="footer-content grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Sales AICE Section */}
                    <div className="footer-section">
                        <h3 className="text-gold mb-4 text-xl font-semibold">Sales AICE</h3>
                        <p className="text-gray">The future of autonomous sales is here. Transform your sales process with AI that actually closes deals.</p>
                    </div>

                    {/* Quick Links Section */}
                    <div className="footer-section">
                        <h3 className="text-[#D4AF37] mb-4 text-xl font-semibold">Quick Links</h3>
                        <ul className="text-gray space-y-2">
                            <li><Link href="/" className="hover:text-gold">Home</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-gold">How It Works</Link></li>
                            <li><Link href="/solutions" className="hover:text-gold">Solutions</Link></li>
                            <li><Link href="/about" className="hover:text-gold">About</Link></li>
                        </ul>
                    </div>

                    {/* Solutions Section */}
                    <div className="footer-section">
                        <h3 className="text-[#D4AF37] mb-4 text-xl font-semibold">Solutions</h3>
                        <ul className="text-gray space-y-2">
                            <li><Link href="/solutions#sdr" className="hover:text-gold">SDR Automation</Link></li>
                            <li><Link href="/solutions#inbound" className="hover:text-gold">Inbound Handling</Link></li>
                            <li><Link href="/solutions#closer" className="hover:text-gold">Sales Closing</Link></li>
                            <li><Link href="/solutions#nurturing" className="hover:text-gold">Lead Nurturing</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="footer-section">
                        <h3 className="text-[#D4AF37] mb-4 text-xl font-semibold">Contact</h3>
                        <ul className="text-gray space-y-2">
                            <li><a href="mailto:sales@salesaice.ai" className="hover:text-gold">sales@salesaice.ai</a></li>
                            {/* <li><a href="tel:+1-555-AICE-AI" className="hover:text-gold">+1 (555) AICE-AI</a></li> */}
                        </ul>
                        <p className="mt-4 text-gray">
                            Ready to see AICE in action?<br />
                            <a href="#demo" className="text-gold hover:underline">Schedule a live demo</a>
                        </p>
                    </div>
                </div>

                {/* Footer Bottom Section */}
                <div className="footer-bottom text-center text-gray text-sm py-1 border-t border-gray-800">
                    <p>&copy; 2025 Sales AICE. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
