export function CascadeWatermark() {
  return (
    <div
      aria-hidden="true"
      className="cascade-watermark pointer-events-none fixed inset-0 overflow-hidden text-amber-700"
    >
      <svg className="h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g stroke="currentColor" strokeWidth="1">
          <path d="M120 170H360L510 300H760L920 180H1260" />
          <path d="M250 650H470L650 500H930L1110 650H1320" />
          <path d="M360 170L470 650M760 300L930 500M920 180L1110 650" />
        </g>
        <g fill="var(--background)" stroke="currentColor" strokeWidth="1">
          <rect x="92" y="142" width="56" height="56" rx="8" />
          <rect x="332" y="142" width="56" height="56" rx="8" />
          <rect x="482" y="272" width="56" height="56" rx="8" />
          <rect x="732" y="272" width="56" height="56" rx="8" />
          <rect x="892" y="152" width="56" height="56" rx="8" />
          <rect x="1232" y="152" width="56" height="56" rx="8" />
          <rect x="222" y="622" width="56" height="56" rx="8" />
          <rect x="442" y="622" width="56" height="56" rx="8" />
          <rect x="622" y="472" width="56" height="56" rx="8" />
          <rect x="902" y="472" width="56" height="56" rx="8" />
          <rect x="1082" y="622" width="56" height="56" rx="8" />
          <rect x="1292" y="622" width="56" height="56" rx="8" />
        </g>
        <g fill="currentColor">
          <circle cx="120" cy="170" r="3" /><circle cx="360" cy="170" r="3" /><circle cx="510" cy="300" r="3" />
          <circle cx="760" cy="300" r="3" /><circle cx="920" cy="180" r="3" /><circle cx="1260" cy="180" r="3" />
          <circle cx="250" cy="650" r="3" /><circle cx="470" cy="650" r="3" /><circle cx="650" cy="500" r="3" />
          <circle cx="930" cy="500" r="3" /><circle cx="1110" cy="650" r="3" /><circle cx="1320" cy="650" r="3" />
        </g>
      </svg>
    </div>
  )
}
