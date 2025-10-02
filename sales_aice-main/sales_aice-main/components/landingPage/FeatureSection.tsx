import '../../app/page.css';
const FeatureSection = () => {
    return (
        <section className="features1">
            <div className="container1">
                <div className="section-title">
                    <h2 className="text-white">Why Sales AICE Outperforms Human Closers</h2>
                    <p>Built with cutting-edge AI technology and proven sales methodologies</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                    <div className="feature-icon">
                        <img 
                        src="artificial-intelligence.GIF"   // 👈 save your robot gif in public/icons/
                        alt="Fully Autonomous"
                        className="w-15 h-15"    // 👈 adjust size as needed (w-16 h-16 looks nice too)
                        />
                    </div>
                    <h3>Fully Autonomous</h3>
                    <p>
                        No human handoff required. AICE handles the entire sales process from initial 
                        contact to deal closure, operating 24/7 with consistent performance.
                    </p>
                    </div>


                   <div className="feature-card">
                     <div className="feature-icon">
                     <img 
                          src="Objection handling.GIF"   
                          alt="Advanced Objection Handling"
                          className="w-15 h-15"   
                         />
                    </div>
                        <h3>Advanced Objection Handling</h3>
                          <p>AICE uses tactical empathy and proven frameworks to overcome any sales objection.</p>
                    </div>



                    <div className="feature-card">
                    <div className="feature-icon">
                        <img 
                        src="Speed.GIF"   
                        alt="Lightning Fast Tech Stack"
                        className="w-15 h-15"       
                        />
                    </div>
                    <h3>Lightning-Fast Tech Stack</h3>
                    <p>
                        Powered by our custom tech stack, and OpenAI with sub-1-second response latency. 
                        Natural conversations that feel completely human.
                    </p>
                    </div>


                    <div className="feature-card">
                    <div className="feature-icon">
                        <img 
                        src="Emotional detection.gif"   // 👈 save your heart/emoji gif in public/icons/
                        alt="Emotional Intelligence"
                        className="w-15 h-15"    // 👈 adjust size as needed (e.g. w-16 h-16)
                        />
                    </div>
                    <h3>Emotional Intelligence</h3>
                    <p>
                        Real-time emotion detection and response adaptation. AICE reads vocal cues and 
                        adjusts its approach for maximum rapport and conversion.
                    </p>
                    </div>


                    <div className="feature-card">
                    <div className="feature-icon">
                        <img 
                        src="Scaleble.GIF"   // 👈 place your chart/graph gif in public/icons/
                        alt="Scalable Performance"
                        className="w-15 h-15"    // 👈 adjust size (try w-16 h-16 if you want it bigger)
                        />
                    </div>
                    <h3>Scalable Performance</h3>
                    <p>
                        Handle unlimited concurrent conversations without quality degradation. 
                        Scale your sales team instantly without hiring or training costs.
                    </p>
                    </div>


                  <div className="feature-card">
                    <div className="feature-icon">
                        <img 
                        src="CRM.gif"   // 👈 place your CRM/target gif in public/icons/
                        alt="CRM Integration"
                        className="w-15 h-15"     // 👈 adjust size (w-16 h-16 if you want it bigger)
                        />
                    </div>
                    <h3>CRM Integration</h3>
                    <p>
                        Seamlessly integrates with your existing CRM and sales tools. 
                        Automatic lead scoring, follow-up scheduling, and deal pipeline management.
                    </p>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FeatureSection;
