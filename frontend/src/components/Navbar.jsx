import { BookOpen } from 'lucide-react';

const Navbar = () => {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
      background: 'rgba(3,7,18,0.6)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.04)',
      padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(217,70,239,0.2))',
          borderRadius: '10px', padding: '6px', display: 'flex', border: '1px solid rgba(139,92,246,0.3)',
        }}>
          <BookOpen size={18} color="#a78bfa" />
        </div>
        <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#c4b5fd' }}>Semantic</span>
          <span style={{ color: '#64748b' }}> Book Recommender</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, padding: '4px 12px', borderRadius: '9999px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
          ✨ AI-Powered
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
