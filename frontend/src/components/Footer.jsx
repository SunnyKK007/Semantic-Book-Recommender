import { BookOpen, Brain } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.04)', padding: '32px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} color="#475569" />
        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
          Semantic Book Recommender
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '12px', color: '#334155' }}>
          Built with <span style={{ color: '#a78bfa' }}>AI</span> by Sunny Kant Kumar
        </span>
        <span style={{ fontSize: '11px', color: '#1e293b' }}>•</span>
        <span style={{ fontSize: '11px', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Brain size={12} /> DistilRoBERTa + ChromaDB
        </span>
      </div>
    </footer>
  );
};

export default Footer;
