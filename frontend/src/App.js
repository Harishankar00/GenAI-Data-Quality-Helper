import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './components/Auth';
import FileUpload from './components/FileUpload';
import { LogOut, Sparkles, LayoutDashboard, Database } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [viewVisible, setViewVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Trigger smooth entry animation
      setTimeout(() => setViewVisible(true), 100);
    });
    return () => unsubscribe();
  }, []);

  // Global CSS Injection for the Loader Animation
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  if (loading) return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p style={{fontWeight: '600', letterSpacing: '0.5px'}}>Initializing Secure Session...</p>
    </div>
  );

  if (!user) return <Auth />;

  return (
    <div style={styles.appContainer}>
      {/* --- Modern Navbar --- */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <div style={styles.logoIcon}>
            <Sparkles size={20} color="#fff" />
          </div>
          <h2 style={styles.brandText}>NeuroStack <span style={styles.brandSub}>AI</span></h2>
        </div>
        
        <div style={styles.navUser}>
          <div style={styles.userInfo}>
            <div style={styles.userDot}></div>
            <span style={styles.userEmail}>{user.email}</span>
          </div>
          <button onClick={() => signOut(auth)} style={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* --- Main Dashboard Content --- */}
      <main style={{
        ...styles.main, 
        opacity: viewVisible ? 1 : 0, 
        transform: viewVisible ? 'translateY(0)' : 'translateY(20px)'
      }}>
        <div style={styles.headerSection}>
          <div style={styles.badge}>Track 3: Data Quality</div>
          <h1 style={styles.mainTitle}>GenAI CSV <span style={styles.gradientText}>Copilot</span></h1>
          <p style={styles.subtitle}>
            Upload messy data to detect missing values, outliers, and formatting issues using 
            rule-based logic and LLM reasoning[cite: 101, 104].
          </p>
        </div>

        {!analysisData ? (
          <div style={{animation: 'fadeIn 0.8s ease-out'}}>
             <FileUpload onAnalysisComplete={(data) => setAnalysisData(data)} />
          </div>
        ) : (
          <div style={{...styles.resultsWrapper, animation: 'fadeIn 0.5s ease-out'}}>
            <div style={styles.resultsHeader}>
              <LayoutDashboard size={20} color="#6366f1" />
              <h3 style={{margin: 0}}>Audit Report: {analysisData.filename}</h3>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Total Rows processed </span>
                <span style={styles.statValue}>{analysisData.total_rows}</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>Issues Found [cite: 91]</span>
                <span style={{...styles.statValue, color: '#ef4444'}}>{analysisData.issues_detected.length}</span>
              </div>
            </div>

            <div style={styles.issueList}>
              {analysisData.issues_detected.length > 0 ? (
                analysisData.issues_detected.map((issue, index) => (
                  <div key={index} style={styles.issueItem}>
                    <div style={styles.issueMarker}></div>
                    <div style={{flex: 1}}>
                      <strong style={{color: '#4338ca', fontSize: '0.95rem'}}>{issue.column}</strong>
                      <div style={{color: '#1e293b', fontSize: '0.9rem'}}>{issue.issue}</div>
                      <div style={styles.countBadge}>{issue.count} occurrences detected [cite: 97]</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.cleanState}>
                  <Database size={32} color="#22c55e" />
                  <p>No issues detected! Your data quality looks solid.</p>
                </div>
              )}
            </div>

            <button onClick={() => setAnalysisData(null)} style={styles.resetBtn}>
              Upload Another CSV
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Dynamic UI Styles ---
const styles = {
  appContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', transition: 'all 0.5s ease' },
  loaderContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px', color: '#6366f1' },
  spinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 5%', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' },
  brandText: { margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' },
  brandSub: { color: '#6366f1' },
  navUser: { display: 'flex', alignItems: 'center', gap: '20px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' },
  userDot: { width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' },
  userEmail: { fontSize: '0.85rem', fontWeight: '500' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontWeight: '600', transition: 'color 0.2s' },
  main: { padding: '60px 5%', maxWidth: '900px', margin: '0 auto', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' },
  headerSection: { textAlign: 'center', marginBottom: '40px' },
  badge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#e0e7ff', color: '#4338ca', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' },
  mainTitle: { fontSize: '3rem', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-1.5px' },
  gradientText: { background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' },
  resultsWrapper: { backgroundColor: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' },
  resultsHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' },
  statCard: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #f1f5f9' },
  statLabel: { fontSize: '0.85rem', color: '#64748b', fontWeight: '600' },
  statValue: { fontSize: '1.75rem', fontWeight: '800' },
  issueList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' },
  issueItem: { display: 'flex', alignItems: 'start', gap: '16px', padding: '16px', backgroundColor: '#fdf2f2', borderRadius: '12px', border: '1px solid #fee2e2', transition: 'transform 0.2s' },
  issueMarker: { width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%', marginTop: '8px' },
  countBadge: { fontSize: '0.75rem', color: '#991b1b', marginTop: '6px', fontWeight: '600' },
  resetBtn: { width: '100%', padding: '14px', backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
  cleanState: { textAlign: 'center', padding: '40px', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }
};

export default App;