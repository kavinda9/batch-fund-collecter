import React, { useState } from 'react';

// Common Card Container for Charts
const ChartCard = ({ title, children }) => (
  <div className="glass-card active-border animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {title}
    </h3>
    <div style={{ flexGrow: 1, position: 'relative', minHeight: '220px' }}>
      {children}
    </div>
  </div>
);

// 1. Income vs Expense Bar Chart
<<<<<<< HEAD
export const IncomeExpenseBarChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const data = [
    { month: 'Jan', income: 15000, expense: 8000 },
    { month: 'Feb', income: 18000, expense: 12000 },
    { month: 'Mar', income: 24000, expense: 9500 },
    { month: 'Apr', income: 21000, expense: 15000 },
    { month: 'May', income: 32000, expense: 14000 },
    { month: 'Jun', income: 28000, expense: 19000 },
  ];

  const maxVal = 35000;
=======
export const IncomeExpenseBarChart = ({ slips = [], expenses = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  // Aggregate real backend data for January-December 2026
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Initialize sums
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  // Group approved slips by month
  slips.forEach(s => {
    if (s.status === 'approved' && s.createdAt) {
      try {
        const date = new Date(s.createdAt);
        if (date.getFullYear() === 2026) {
          const mIdx = date.getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            monthlyIncome[mIdx] += Number(s.amount) || 0;
          }
        }
      } catch (err) {}
    }
  });

  // Group expenses by month
  expenses.forEach(e => {
    if (e.date) {
      try {
        const date = new Date(e.date);
        if (date.getFullYear() === 2026) {
          const mIdx = date.getMonth();
          if (mIdx >= 0 && mIdx < 12) {
            monthlyExpense[mIdx] += Number(e.amount) || 0;
          }
        }
      } catch (err) {}
    }
  });

  // Create chart data array
  const data = months.map((m, idx) => ({
    month: m,
    income: monthlyIncome[idx],
    expense: monthlyExpense[idx]
  })).slice(0, 6); // Display first 6 months for clear visualization

  // Determine max value for chart scaling dynamically
  const maxVal = Math.max(
    10000, 
    ...data.map(d => Math.max(d.income, d.expense))
  );

>>>>>>> 14cdde4 (updated files)
  const height = 180;
  const width = 360;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 25;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const barWidth = 14;
  const groupGap = 32;

  return (
    <ChartCard title="Monthly Income vs Expenses">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>Income</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#7c3aed' }}></span>
            <span style={{ color: 'var(--text-muted)' }}>Expenses</span>
          </div>
        </div>
        
        <div style={{ position: 'relative', width: '100%' }}>
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingTop + chartHeight * (1 - ratio);
              const val = Math.round(maxVal * ratio);
              return (
                <g key={i}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="var(--border-color)" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 4} 
                    fill="var(--text-muted)" 
                    fontSize="9" 
                    textAnchor="end"
                  >
<<<<<<< HEAD
                    Rs. {(val/1000).toFixed(0)}k
=======
                    Rs. {(val/1000).toFixed(1)}k
>>>>>>> 14cdde4 (updated files)
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((d, idx) => {
              const xCenter = paddingLeft + (idx * (chartWidth / data.length)) + (chartWidth / (data.length * 2));
              
              const incomeHeight = (d.income / maxVal) * chartHeight;
              const expenseHeight = (d.expense / maxVal) * chartHeight;
              
              const incomeY = paddingTop + chartHeight - incomeHeight;
              const expenseY = paddingTop + chartHeight - expenseHeight;

              const xIncome = xCenter - barWidth - 2;
              const xExpense = xCenter + 2;

              const isHovered = hoveredIdx === idx;

              return (
                <g 
                  key={idx} 
                  onMouseEnter={() => setHoveredIdx(idx)} 
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Hover Highlight background */}
                  {isHovered && (
                    <rect
                      x={xCenter - (chartWidth / (data.length * 2))}
                      y={paddingTop}
                      width={chartWidth / data.length}
                      height={chartHeight + 4}
                      fill="rgba(124, 58, 237, 0.04)"
                      rx="4"
                    />
                  )}
                  
                  {/* Income Bar */}
                  <rect
                    x={xIncome}
                    y={incomeY}
                    width={barWidth}
<<<<<<< HEAD
                    height={incomeHeight}
=======
                    height={incomeHeight > 2 ? incomeHeight : 2}
>>>>>>> 14cdde4 (updated files)
                    fill="url(#income-grad)"
                    rx="4"
                    style={{ transition: 'all 0.3s' }}
                  />
                  
                  {/* Expense Bar */}
                  <rect
                    x={xExpense}
                    y={expenseY}
                    width={barWidth}
<<<<<<< HEAD
                    height={expenseHeight}
=======
                    height={expenseHeight > 2 ? expenseHeight : 2}
>>>>>>> 14cdde4 (updated files)
                    fill="url(#expense-grad)"
                    rx="4"
                    style={{ transition: 'all 0.3s' }}
                  />

                  {/* X Axis Labels */}
                  <text
                    x={xCenter}
                    y={height - paddingBottom + 16}
                    fill="var(--text-muted)"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}

            {/* Definitions for gradients */}
            <defs>
              <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>

          {/* Interactive Tooltip */}
          {hoveredIdx !== null && (
            <div 
              style={{
                position: 'absolute',
                bottom: `${height - (paddingTop + chartHeight - 20)}px`,
                left: `${paddingLeft + (hoveredIdx * (chartWidth / data.length)) + (chartWidth / (data.length * 2)) - 60}px`,
                background: 'var(--bg-sidebar)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 10,
                fontSize: '0.75rem',
                lineHeight: '1.4',
                animation: 'fadeIn 0.15s ease-out'
              }}
            >
              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{data[hoveredIdx].month} Financials</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Income:</span>
                <span style={{ color: '#2563eb', fontWeight: '600' }}>Rs. {data[hoveredIdx].income.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Expense:</span>
                <span style={{ color: '#7c3aed', fontWeight: '600' }}>Rs. {data[hoveredIdx].expense.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChartCard>
  );
};

// 2. Fund Distribution Donut Chart
<<<<<<< HEAD
export const FundDistributionPieChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const segments = [
    { label: 'Events & Cultural', amount: 45000, color: '#2563eb' },
    { label: 'Batch Trips', amount: 32000, color: '#7c3aed' },
    { label: 'Academic Supplies', amount: 15000, color: '#06b6d4' },
    { label: 'Charity & Socials', amount: 8000, color: '#10b981' },
    { label: 'Emergency Fund', amount: 12000, color: '#f59e0b' }
  ];
=======
export const FundDistributionPieChart = ({ expenses = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  // Aggregate expenses by category
  const categoriesMap = {};
  const colors = ['#2563eb', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
  
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    const amt = Number(e.amount) || 0;
    categoriesMap[cat] = (categoriesMap[cat] || 0) + amt;
  });

  let segments = Object.entries(categoriesMap).map(([label, amount], idx) => ({
    label,
    amount,
    color: colors[idx % colors.length]
  }));

  // Fallback to beautiful mock segments if no real expenses exist yet
  if (segments.length === 0) {
    segments = [
      { label: 'Events & Cultural', amount: 45000, color: '#2563eb' },
      { label: 'Batch Trips', amount: 32000, color: '#7c3aed' },
      { label: 'Academic Supplies', amount: 15000, color: '#06b6d4' },
      { label: 'Charity & Socials', amount: 8000, color: '#10b981' },
      { label: 'Emergency Fund', amount: 12000, color: '#f59e0b' }
    ];
  }
>>>>>>> 14cdde4 (updated files)

  const total = segments.reduce((sum, s) => sum + s.amount, 0);
  const size = 180;
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // 376.99
  const center = size / 2;

  let cumulativePercent = 0;

<<<<<<< HEAD
  return (
    <ChartCard title="Fund Distribution (Rs. 1,12,000)">
=======
  // Format dynamic short abbreviation (e.g. 1.12L or 45k)
  const formatCompact = (val) => {
    if (val >= 100000) return `${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  return (
    <ChartCard title={`Fund Distribution (Rs. ${total.toLocaleString()})`}>
>>>>>>> 14cdde4 (updated files)
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', height: '100%' }}>
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0, margin: '0 auto' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="var(--border-color)"
              strokeWidth="16"
            />
            {segments.map((seg, idx) => {
<<<<<<< HEAD
              const percent = seg.amount / total;
=======
              const percent = total > 0 ? seg.amount / total : 0;
>>>>>>> 14cdde4 (updated files)
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercent * circumference;
              
              cumulativePercent += percent;
              
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? 22 : 16}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                    opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Used
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
<<<<<<< HEAD
              Rs. 1.12L
=======
              Rs. {formatCompact(total)}
>>>>>>> 14cdde4 (updated files)
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1, minWidth: '160px' }}>
          {segments.map((seg, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  background: isHovered ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: seg.color, 
                  display: 'inline-block',
                  flexShrink: 0
                }}></span>
                <span style={{ 
                  color: isHovered ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isHovered ? '600' : '400',
                  flexGrow: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {seg.label}
                </span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
<<<<<<< HEAD
                  Rs. {(seg.amount / 1000).toFixed(0)}k
=======
                  Rs. {formatCompact(seg.amount)}
>>>>>>> 14cdde4 (updated files)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
};

