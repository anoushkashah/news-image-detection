export default function VerifyMark({ size = 280, bgColor }) {
  const bg = bgColor || "#0e0e0e";
  const isDark = bg === "#0e0e0e";
  const cornerColor = isDark ? "#888884" : "#1a1916";
  const vColor = isDark ? "#e8e8e4" : "#1a1916";

  return (
    <svg width={size} height={size} viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
      <rect width="280" height="280" fill={bg}/>
      <polygon points="50,70 80,70 140,210 110,210" fill={vColor}/>
      <polygon points="170,70 200,70 140,210 110,210" fill={vColor}/>
      <circle cx="140" cy="185" r="22" fill={bg} stroke="#c0392b" stroke-width="1.5"/>
      <line x1="140" y1="168" x2="140" y2="174" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="140" y1="196" x2="140" y2="202" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="123" y1="185" x2="129" y2="185" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="151" y1="185" x2="157" y2="185" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="140" cy="185" r="3" fill="#c0392b"/>
      <line x1="16" y1="16" x2="30" y2="16" stroke={cornerColor} stroke-width="1"/>
      <line x1="16" y1="16" x2="16" y2="30" stroke={cornerColor} stroke-width="1"/>
      <line x1="250" y1="16" x2="264" y2="16" stroke={cornerColor} stroke-width="1"/>
      <line x1="264" y1="16" x2="264" y2="30" stroke={cornerColor} stroke-width="1"/>
      <line x1="16" y1="264" x2="16" y2="250" stroke={cornerColor} stroke-width="1"/>
      <line x1="16" y1="264" x2="30" y2="264" stroke={cornerColor} stroke-width="1"/>
      <line x1="264" y1="264" x2="264" y2="250" stroke={cornerColor} stroke-width="1"/>
      <line x1="250" y1="264" x2="264" y2="264" stroke={cornerColor} stroke-width="1"/>
    </svg>
  );
}
