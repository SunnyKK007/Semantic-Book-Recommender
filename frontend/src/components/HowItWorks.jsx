import { Search, Brain, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      style={{ paddingBottom: '80px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#e2e8f0', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          How it works
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Three steps to your perfect book</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="feature-card" style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Search size={22} color="#a78bfa" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Describe your vibe</h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>Tell us what mood, atmosphere, or story you're craving. Use natural language — no keywords needed.</p>
        </div>
        <div className="feature-card" style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Brain size={22} color="#67e8f9" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>AI analyzes emotions</h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>Our DistilRoBERTa model scores each book on 7 emotions: joy, sadness, fear, anger, surprise, disgust, and neutral.</p>
        </div>
        <div className="feature-card" style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(217,70,239,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Zap size={22} color="#d946ef" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Get matched results</h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>Books are ranked by emotional resonance to your query, not just keyword overlap. Find exactly what you feel like reading.</p>
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
