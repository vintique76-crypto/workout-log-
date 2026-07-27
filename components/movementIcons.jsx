function Svg({ width = 20, height = 20, children, ...props }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PressIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 15h16" />
      <path d="M4 12v6M7 13v4M17 13v4M20 12v6" />
      <path d="M12 9V4M9 7l3-3 3 3" />
    </Svg>
  );
}

export function PullIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 9h16" />
      <path d="M4 6v6M7 7v4M17 7v4M20 6v6" />
      <path d="M9 15l3 3 3-3" />
      <path d="M12 18v-5" />
    </Svg>
  );
}

export function SquatIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 4v6M7 5v4M17 5v4M20 4v6" />
      <path d="M9 13l3 3 3-3" />
      <path d="M9 20l3-3 3 3" />
    </Svg>
  );
}

export function HingeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 17h16" />
      <path d="M4 14v6M7 15v4M17 15v4M20 14v6" />
      <path d="M12 11c-3 0-5-2-5-5" />
      <path d="M12 11c3 0 5-2 5-5" />
    </Svg>
  );
}

export function CurlIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="16" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M8 15.5 16 8.5" />
      <path d="M13 6l3 2-1 3" />
    </Svg>
  );
}

export function RaiseIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="18" r="2" />
      <path d="M8 17 18 7" />
      <path d="M13 7h5v5" />
    </Svg>
  );
}

export function CoreIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="9" width="16" height="6" rx="2" />
      <path d="M9 9v6M15 9v6" />
    </Svg>
  );
}

export function CardioIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.65-9.5 9-9.5 9Z" />
      <path d="M3 12h4l2-3 2 5 2-4 2 2h4" />
    </Svg>
  );
}

export function DumbbellIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 9v6M4 10v4M2 11v2" />
      <path d="M18 9v6M20 10v4M22 11v2" />
      <path d="M8 12h8" />
    </Svg>
  );
}

export function MachineIcon(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="3" rx="1" />
      <rect x="4" y="9" width="16" height="3" rx="1" />
      <rect x="4" y="14" width="10" height="3" rx="1" />
      <path d="M18 15.5v4M16 17.5h4" />
    </Svg>
  );
}

export const MOVEMENT_ICONS = {
  press: PressIcon,
  pull: PullIcon,
  squat: SquatIcon,
  hinge: HingeIcon,
  curl: CurlIcon,
  raise: RaiseIcon,
  core: CoreIcon,
  cardio: CardioIcon,
  dumbbell: DumbbellIcon,
  machine: MachineIcon,
};
