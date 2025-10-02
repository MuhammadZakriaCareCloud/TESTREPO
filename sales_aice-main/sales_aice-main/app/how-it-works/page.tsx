'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import '@/app/page.css';
import CallToAction from '@/components/CTA';

const HowItWorks: React.FC = () => {
  useEffect(() => {
    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    const smoothScroll = (e: Event) => {
      const target = document.querySelector((e.target as HTMLAnchorElement).getAttribute('href') || '');
      if (target) {
        e.preventDefault();
        (target as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    };

    // Add event listeners for smooth scroll
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', smoothScroll);
    });

    // Navbar background on scroll (removed for now)
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
      if (navbar) {
        if (window.scrollY > 100) {
          (navbar as HTMLElement).style.background = 'rgba(26, 38, 57, 0.98)';
        } else {
          (navbar as HTMLElement).style.background = 'rgba(26, 38, 57, 0.95)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Animate flow steps on scroll (Intersection Observer)
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.flow-step').forEach((step) => {
      observer.observe(step);
    });

    // Tech card animation
    const techObserver = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    document.querySelectorAll('.tech-card').forEach((card) => {
      (card as HTMLElement).style.opacity = '0';
      (card as HTMLElement).style.transform = 'translateY(30px)';
      (card as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      techObserver.observe(card);
    });

    // Cleanup function
    return () => {
      // Remove scroll event listener
      window.removeEventListener('scroll', handleScroll);

      // Remove smooth scroll event listeners
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', smoothScroll);
      });
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <>
      {/* Navigation */}
      {/* <nav className="navbar">
        <div className="nav-container">
          <div className="logo-container">
            <img src="../images/logo-resonance-field.png" alt="Sales AICE Logo" className="logo" />
            <Link href="../index.html" className="logo-text">
              Sales AICE
            </Link>
          </div>
          <ul className="nav-links">
            <li>
              <Link href="../index.html">Home</Link>
            </li>
            <li>
              <Link href="how-it-works.html">How It Works</Link>
            </li>
            <li>
              <Link href="solutions.html">Solutions</Link>
            </li>
            <li>
              <Link href="about.html">About</Link>
            </li>
            <li>
              <Link href="../index.html#demo" className="btn btn-secondary">
                See Demo
              </Link>
            </li>
          </ul>
        </div>
      </nav> */}

      {/* Hero Section */}
      <section className="hero1 pt-6 sm:pt-8 md:pt-16 pb-12 md:pb-24 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-screen-xl px-4 sm:px-8 mx-auto text-center">
            {/* Text block */}
            <div className="hero1-content text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                End-to-End Sales Execution—Autonomously
              </h1>
              <p className="hero1-subtitle mb-2 text-lg md:text-xl">
                Discover how Sales AICE handles complete sales conversations with human-level
                emotional intelligence and proven closing techniques.
              </p>
            </div>

            {/* GIF below text */}
            {/* <div className="max-w-6xl mx-1 mt-2 w-full">
              <img 
                src="Howitworks2.GIF" 
                alt="Sales Execution Animation" 
                className="w-full rounded-lg shadow-lg max-w-full md:max-w-[98vw] xl:max-w-[1800px]"
                style={{objectFit: 'cover'}}
              />
            </div> */}
            <div className="flow-container flex justify-center">
            <div className="max-w-6xl mx-auto mt-4 w-full">
              <img 
                src="/SalesFlow.gif" 
                alt="The Sales AICE Process" 
                className="w-full rounded-lg shadow-lg max-w-full md:max-w-[98vw] xl:max-w-[1800px]"
                style={{objectFit: 'cover', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'}}
              />
            </div>
          </div>
          </div>


      </section>

      {/* Process Flow Section */}
      <section className="sales-process-flow my-4" style={{marginTop: '2.5rem', marginBottom: '2.5rem'}}>
  <div className="salesflow-container">
          <div className="section-title text-center">
            <h2>The Sales AICE Process</h2>
            <p>From initial contact to closed deal, fully automated</p>
          </div>
          

          {[{ title: '🎯 Lead Acquisition', description: 'AICE automatically fetches qualified leads from your CRM...', step: 1 },
          { title: '📞 Call Initiation', description: 'Intelligent dialing system initiates calls at optimal times...', step: 2 },
          { title: '🎤 Voice Understanding', description: 'Advanced speech-to-text processing captures every word...', step: 3 },
          { title: '💝 Emotion Detection', description: 'Hume AI analyzes vocal patterns, tone, and speech cadence...', step: 4 },
          { title: '⚙️ Objection Handling', description: 'Trained on Chris Voss and Jeb Blount methodologies...', step: 5 },
          { title: '🎯 Deal Closing', description: 'Advanced closing techniques including assumptive close...', step: 6 },
          { title: '📊 CRM Update', description: 'Automatic logging of call outcomes, next steps...', step: 7 }].map(({ title, description, step }) => (
            <div key={step} className="flow-step">
              <div className="step-number">{step}</div>
              <div className="step-content">
                <h3 className="step-title">{title}</h3>
                <p className="step-description">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call Sample Section */}
      <section className="call-sample">
        <div className="container1">
          <div className="section-title text-center">
            <h2>Real Conversation Sample</h2>
            <p>See how AICE handles objections and builds rapport</p>
          </div>

          <div className="transcript-container">
            {[{ speaker: 'AICE', message: 'Hi Sarah...', emotion: 'Confident' },
            { speaker: 'Prospect', message: 'Thanks, but we\'re actually pretty happy...', emotion: 'Defensive' },
            { speaker: 'AICE', message: 'I completely understand, Sarah...', emotion: 'Empathetic' },
            { speaker: 'Prospect', message: 'Well... I mean, it works, but...', emotion: 'Curious' },
            { speaker: 'AICE', message: 'That\'s exactly what Jennifer...', emotion: 'Persuasive' }].map(({ speaker, message, emotion }, idx) => (
              <div key={idx} className={`transcript-line ${speaker === 'AICE' ? 'ai' : 'human'}`}>
                <div className="speaker">{speaker}</div>
                <div className="message">
                  {message} <span className="emotion-tag">{emotion}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <Link href="../index.html#demo" className="btn1 btn1-primary">
              Hear Full Conversation
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-stack">
        <div className="container1">
          <div className="section-title text-center">
            <h2>Powered by Best-in-Class Technology</h2>
            <p>Enterprise-grade AI stack with sub-1-second response times</p>
          </div>

          <div className="tech-grid">
                <div className="top-row">
                {[
                  { logo: 'Call Initiation.gif', title: 'Callgent', description: 'Conversation design and flow management.' },
                  { logo: 'happy.gif', title: 'ToneSpeak', description: 'Real-time emotion detection from voice patterns.' },
                  { logo: 'gpt.gif', title: 'OpenAI GPT', description: 'Advanced language understanding and generation.' },
                  { logo: 'backend.gif', title: 'FlowBackend', description: 'High-performance data processing and CRM integration.' }
                ].map(({ logo, title, description }, idx) => (
                  <div className="tech-card" key={idx}>
                    <div className="tech-logo">
                      <img src={logo} alt={title} className="w-15 h-15" />
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>

              <div className="bottom-row">
                {[
                  { logo: 'ai-microphone.gif', title: 'Advanced STT', description: 'Speech-to-text with 99.9% accuracy.' },
                  { logo: 'font.gif', title: 'Neural TTS', description: 'Human-like text-to-speech synthesis.' }
                ].map(({ logo, title, description }, idx) => (
                  <div className="tech-card" key={idx + 4}>
                    <div className="tech-logo">
                      <img src={logo} alt={title} className="w-15 h-15" />
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                ))}
              </div>

          </div>

          <div className="text-center mt-4">
            <div style={{ background: '#1A2D45', borderRadius: '15px', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ color: 'var(--gold-accent)', marginBottom: '1rem' }}>⚡ Performance Metrics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', color: 'white', fontWeight: '700' }}>&lt;1s</div>
                  <div style={{ color: 'var(--text-gray)' }}>Response Time</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', color: 'white', fontWeight: '700' }}>99.9%</div>
                  <div style={{ color: 'var(--text-gray)' }}>Uptime</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', color: 'white', fontWeight: '700' }}>∞</div>
                  <div style={{ color: 'var(--text-gray)' }}>Scalability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CallToAction />


    </>
  );
};

export default HowItWorks;
