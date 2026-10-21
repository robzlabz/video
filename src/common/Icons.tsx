import React from "react";

/** 24x24 line icons (feather-style). Use `name` in content JSON; unknown names fall back to "star". */
export const ICON_PATHS: Record<string, string[]> = {
  cloud: ["M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"],
  phone: ["M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M11 18h2"],
  lock: ["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"],
  bulb: ["M9 18h6", "M10 22h4", "M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"],
  clock: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"],
  heart: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"],
  star: ["M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"],
  check: ["M4 12l5 5L20 6"],
  x: ["M5 5l14 14", "M19 5L5 19"],
  wifi: ["M2 9a15 15 0 0 1 20 0", "M5 12.5a10 10 0 0 1 14 0", "M8.5 16a5 5 0 0 1 7 0", "M12 20h.01"],
  mail: ["M3 5h18v14H3z", "M3 6l9 7 9-7"],
  gear: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3", "M4.9 4.9L7 7", "M17 17l2.1 2.1", "M4.9 19.1L7 17", "M17 7l2.1-2.1"],
  server: ["M3 4h18v6H3z", "M3 14h18v6H3z", "M7 7h.01", "M7 17h.01"],
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  coffee: ["M4 8h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z", "M17 10h2a3 3 0 0 1 0 6h-2", "M7 2v3", "M11 2v3", "M15 2v3"],
  leaf: ["M5 19C5 9 11 4 20 4c0 9-5 15-15 15z", "M5 19l8-8"],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"],
  sun: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 1v3", "M12 20v3", "M1 12h3", "M20 12h3", "M4.2 4.2l2.1 2.1", "M17.7 17.7l2.1 2.1", "M4.2 19.8l2.1-2.1", "M17.7 6.3l2.1-2.1"],
  drop: ["M12 2.7s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"],
  book: ["M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z", "M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"],
  chart: ["M4 20V10", "M10 20V4", "M16 20v-8", "M22 20H2"],
  search: ["M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z", "M21 21l-4.3-4.3"],
  globe: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M2 12h20", "M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"],
  send: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4z"],
  bolt: ["M13 2L3 14h9l-1 8 10-12h-9z"],
  trophy: ["M8 21h8", "M12 17v4", "M7 4h10v5a5 5 0 0 1-10 0z", "M17 5h3v2a3 3 0 0 1-3 3", "M7 5H4v2a3 3 0 0 0 3 3"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  flag: ["M4 22V4", "M4 4h13l-2 4 2 4H4"],
  home: ["M3 11l9-8 9 8", "M5 10v11h14V10", "M10 21v-6h4v6"],
  money: ["M3 6h18v12H3z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  clipboard: ["M9 3h6v3H9z", "M7 5H5v16h14V5h-2", "M9 12h6", "M9 16h6"],
};

export const Icon: React.FC<{ name?: string; size?: number; color?: string; stroke?: number; draw?: number; fill?: string; style?: React.CSSProperties }> = ({ name = "star", size = 100, color = "#111", stroke = 1.6, draw = 1, fill, style }) => {
  const paths = ICON_PATHS[name] || ICON_PATHS.star;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ?? "none"} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      ))}
    </svg>
  );
};
