import "@/app/page.css";
import CallToAction from "@/components/CTA";

const AboutPage = () =>{
  return (
    <>
      <section className="hero1 pt-6 sm:pt-8 md:pt-16 pb-12 md:pb-24 flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-screen-xl px-4 sm:px-8 mx-auto text-center">
          <div className="hero1-content text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-[fadeInUp_1s_ease-out] opacity-0 [animation-fill-mode:forwards]">
              What Makes Sales AICE Different
            </h1>
            <p className="hero1-subtitle mb-2 text-lg md:text-xl animate-[fadeInUp_1s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
              How we stand apart from other AI sales solutions
            </p>
          </div>

          <div className="competitor-comparison animate-[fadeInUp_1s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards] w-full max-w-full overflow-hidden px-4">
            <div className="competitor-row grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 p-4 border-b border-[rgba(42,75,124,0.2)]">
              <div className="competitor-name font-semibold text-[#FFD700] text-sm md:text-base">SimpleTalk AI</div>
              <div className="competitor-difference text-gray-300 text-sm md:text-base leading-relaxed">
                While SimpleTalk focuses on basic conversation flow, Sales AICE incorporates real-time emotion detection and advanced psychological frameworks. We don't just talk—we understand and adapt to emotional states.
              </div>
            </div>

            <div className="competitor-row grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 p-4 border-b border-[rgba(42,75,124,0.2)]">
              <div className="competitor-name font-semibold text-[#FFD700] text-sm md:text-base">Connex AI</div>
              <div className="competitor-difference text-gray-300 text-sm md:text-base leading-relaxed">
                Connex offers emotion tagging, but Sales AICE goes further with actionable emotional intelligence. We don't just detect emotions—we respond with proven empathy techniques that build genuine rapport.
              </div>
            </div>

            <div className="competitor-row grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 p-4 border-b border-[rgba(42,75,124,0.2)]">
              <div className="competitor-name font-semibold text-[#FFD700] text-sm md:text-base">Traditional Dialers</div>
              <div className="competitor-difference text-gray-300 text-sm md:text-base leading-relaxed">
                Legacy systems focus on volume over quality. Sales AICE prioritizes meaningful conversations that actually convert, using advanced objection handling and closing techniques from top sales experts.
              </div>
            </div>

            <div className="competitor-row grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 p-4 border-b border-[rgba(42,75,124,0.2)]">
              <div className="competitor-name font-semibold text-[#FFD700] text-sm md:text-base">Chatbot Solutions</div>
              <div className="competitor-difference text-gray-300 text-sm md:text-base leading-relaxed">
                Most chatbots follow rigid scripts. Sales AICE engages in dynamic, contextual conversations that adapt in real-time based on prospect responses and emotional cues.
              </div>
            </div>

            <div className="competitor-row grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 p-4">
              <div className="competitor-name font-semibold text-[#FFD700] text-sm md:text-base">Human-Only Teams</div>
              <div className="competitor-difference text-gray-300 text-sm md:text-base leading-relaxed">
                Human teams are limited by availability, mood, and skill variations. Sales AICE delivers consistent, expert-level performance 24/7 while scaling infinitely without additional training costs.
              </div>
            </div>
          </div>
        </div>
      </section>

            <section className="philosophy-section">
              <div className="container1">
                <div className="section-title text-center">
                  <h2>Our Philosophy: Empathy + Automation = Elevation</h2>
                  <p>The principles that guide everything we build</p>
                </div>

                <div className="philosophy-grid">
                  <div className="philosophy-card">
                    <div className="philosophy-icon">
                      <img src="empathy.gif" alt="Empathy First" className="w-15 h-15" />
                    </div>
                    <h3 className="philosophy-title">Empathy First</h3>
                    <p>
                      Technology should enhance human connection, not replace it. Our AI understands emotions and responds with genuine care, building trust that leads to better outcomes for everyone.
                    </p>
                  </div>

                  <div className="philosophy-card">
                    <div className="philosophy-icon">
                      <img src="outcome.gif" alt="Outcome Focused" className="w-15 h-15" />
                    </div>
                    <h3 className="philosophy-title">Outcome Focused</h3>
                    <p>
                      We measure success not by features or metrics, but by real business impact. Every conversation should move prospects closer to solutions that genuinely help them.
                    </p>
                  </div>

                  <div className="philosophy-card">
                    <div className="philosophy-icon">
                      <img src="machine-learning.gif" alt="Continuous Learning" className="w-15 h-15" />
                    </div>
                    <h3 className="philosophy-title">Continuous Learning</h3>
                    <p>
                      Our AI doesn't just execute—it learns from every interaction, constantly improving its ability to understand, empathize, and respond effectively to human needs.
                    </p>
                  </div>

                  <div className="philosophy-card">
                    <div className="philosophy-icon">
                      <img src="business.gif" alt="Human Partnership" className="w-15 h-15" />
                    </div>
                    <h3 className="philosophy-title">Human Partnership</h3>
                    <p>
                      AI works best when it amplifies human capabilities. We design our systems to make sales professionals more effective, not to replace them entirely.
                    </p>
                  </div>

                  <div className="philosophy-card">
                    <div className="philosophy-icon">
                      <img src="book.gif" alt="Ethical AI" className="w-15 h-15" />
                    </div>
                    <h3 className="philosophy-title">Ethical AI</h3>
                    <p>
                      With great power comes great responsibility. We're committed to transparent, ethical AI that respects privacy and builds genuine value for all stakeholders.
                    </p>
                  </div>

                  <div className="philosophy-card">
                    <div className="philosophy-icon">
                      <img src="scalability.gif" alt="Scalable Excellence" className="w-15 h-15" />
                    </div>
                    <h3 className="philosophy-title">Scalable Excellence</h3>
                    <p>
                      Excellence shouldn't be limited by human constraints. Our platform makes world-class sales performance accessible to organizations of any size.
                    </p>
                  </div>
                </div>
              </div>
            </section>

      <section className="story-section">
        <div className="container1">
          <div className="story-content">
            <h2 style={{ color: "white", marginBottom: "3rem" }}>
              The AICE Origin Story
            </h2>

            <p>
              Sales AICE was born from a simple observation: the best salespeople aren't just great talkers—they're exceptional listeners who understand human psychology and respond with genuine empathy. Yet traditional sales training focuses on scripts and techniques, missing the emotional intelligence that truly drives conversions.
            </p>

            <p>
              Our founder, after witnessing countless sales teams struggle with inconsistent performance, burnout, and scalability challenges, envisioned a different future. What if we could combine the emotional intelligence of top performers like Chris Voss and Jeb Blount with the consistency and scalability of AI?
            </p>

            <p>
              The breakthrough came when we realized that AI doesn't need to replace human empathy—it can amplify it. By training our system on proven psychological frameworks and real-time emotion detection, we created an AI that doesn't just follow scripts, but truly understands and responds to human emotions.
            </p>

            <p>
              Today, Sales AICE represents the culmination of years of research in conversational AI, emotional intelligence, and sales psychology. We're not just automating sales—we're elevating it to a level of consistency and empathy that was previously impossible to achieve at scale.
            </p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container1">
          <div className="section-title text-center">
            <h2>Our Vision for the Future</h2>
            <p>Where we're heading and why it matters</p>
          </div>

          <div className="vision-card">
            <div className="vision-quote">
              "We envision a world where every business conversation is an opportunity to create genuine value, where AI amplifies human empathy rather than replacing it, and where sales becomes a force for positive connection rather than mere transaction."
            </div>
            <p style={{ color: "var(--text-gray)", marginBottom: "3rem" }}>
              Our team combines decades of experience in AI research, sales psychology, and enterprise software. We're united by the belief that technology should make business more human, not less.
            </p>

           <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
    marginTop: "3rem",
  }}
>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                // background: "#1C3766",
                // borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                overflow: "hidden", // ensures GIF fits inside circle
              }}
            >
              <img
                src="mind-research.gif" // replace with your actual gif path
                alt="AI Research"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
              />
            </div>
            <h4 style={{ color: "var(--gold-accent)" }}>AI Research</h4>
            <p style={{ color: "var(--text-gray)", fontSize: "0.9rem", margin: "0" }}>
              PhD-level expertise in conversational AI and emotional intelligence
            </p>
          </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  // background: "#1C3766",
                  // borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  overflow: "hidden",
                }}
              >
                <img
                  src="sales-enablement.gif"
                  alt="Sales Expertise"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
              </div>
              <h4 style={{ color: "var(--gold-accent)" }}>Sales Expertise</h4>
              <p style={{ color: "var(--text-gray)", fontSize: "0.9rem", margin: "0" }}>
                Former sales leaders from Fortune 500 companies
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  // background: "#1C3766",
                  // borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  overflow: "hidden",
                }}
              >
                <img
                  src="helmet.gif"
                  alt="Engineering"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
              </div>
              <h4 style={{ color: "var(--gold-accent)" }}>Engineering</h4>
              <p style={{ color: "var(--text-gray)", fontSize: "0.9rem", margin: "0" }}>
                World-class engineers from leading tech companies
              </p>
            </div>
          </div>

          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>2024</h3>
              <p>Founded</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <p>Enterprise Clients</p>
            </div>
            <div className="stat-item">
              <h3>1M+</h3>
              <p>Conversations Handled</p>
            </div>
            <div className="stat-item">
              <h3>95%</h3>
              <p>Client Satisfaction</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>Support & Availability</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <div className="section-title text-center">
            <h2>What Our Clients Say</h2>
            <p>Real feedback from companies transforming their sales with AICE</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Sales AICE didn't just automate our sales process—it elevated it. Our conversion rates increased by 40% while our team stress levels decreased significantly. It's like having our best closer available 24/7."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">SM</div>
                <div className="author-info">
                  <h4>Sarah Mitchell</h4>
                  <p>VP of Sales, TechFlow Solutions</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                "The emotional intelligence of Sales AICE is remarkable. Prospects often don't realize they're talking to AI because the conversations feel so natural and empathetic. It's revolutionized how we think about customer engagement."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">MR</div>
                <div className="author-info">
                  <h4>Michael Rodriguez</h4>
                  <p>CEO, Growth Dynamics</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">
                "We were skeptical about AI handling our high-value B2B sales, but AICE proved us wrong. It handles objections better than most of our human reps and never has a bad day. ROI was positive within the first month."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">JC</div>
                <div className="author-info">
                  <h4>Jennifer Chen</h4>
                  <p>Sales Director, Enterprise Solutions Inc</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     <CallToAction/>
    </>
  );
};

export default AboutPage;
