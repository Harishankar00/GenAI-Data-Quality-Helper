import React from 'react';
import { CheckCircle2, AlertTriangle, Download, ArrowRight } from 'lucide-react';

const ResultTable = ({ data, onExport }) => {
  // Mock data structure based on the LLM's expected JSON output
  const suggestions = data.suggestions || [
    { id: 1, column: 'Email', original: 'user@@gmail.com', fix: 'user@gmail.com', confidence: 0.95, type: 'Format' },
    { id: 2, column: 'City', original: 'N.Y.', fix: 'New York', confidence: 0.88, type: 'Inconsistency' },
  ];

  const getConfidenceStyle = (score) => {
    if (score > 0.9) return { color: '#22c55e', bg: '#f0fdf4', label: 'High' };
    if (score > 0.7) return { color: '#eab308', bg: '#fefce8', label: 'Medium' };
    return { color: '#ef4444', bg: '#fef2f2', label: 'Low' };
  };

  return (
    <div style={styles.container}>
      <div style={styles.tableHeader}>
        <h3 style={{margin: 0}}>AI Suggested Corrections [cite: 102]</h3>
        <button onClick={onExport} style={styles.exportBtn}>
          <Download size={18} /> Export Cleaned CSV 
        </button>
      </div>

      <div style={styles.scrollArea}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Column [cite: 98]</th>
              <th style={styles.th}>Original Value [cite: 98]</th>
              <th style={styles.th}></th>
              <th style={styles.th}>Suggested Fix [cite: 99]</th>
              <th style={styles.th}>Confidence </th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((item, idx) => {
              const conf = getConfidenceStyle(item.confidence);
              return (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.td}><span style={styles.colBadge}>{item.column}</span></td>
                  <td style={{...styles.td, color: '#64748b'}}>{item.original}</td>
                  <td style={styles.td}><ArrowRight size={14} color="#94a3b8" /></td>
                  <td style={{...styles.td, fontWeight: '600', color: '#1e293b'}}>{item.fix}</td>
                  <td style={styles.td}>
                    <div style={{...styles.confBadge, color: conf.color, backgroundColor: conf.bg}}>
                      {item.confidence > 0.8 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {conf.label} ({(item.confidence * 100).toFixed(0)}%)
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { marginTop: '30px', animation: 'fadeIn 0.5s ease' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
  scrollArea: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '16px', fontSize: '0.85rem', color: '#64748b', fontWeight: '700' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '16px', fontSize: '0.9rem' },
  colBadge: { backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: '600', fontSize: '0.75rem' },
  confBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }
};

export default ResultTable;