// ───────────────────────────────────────────────────────────────────────────
// Ali Imam Design System — Authentic SVG Icons
// 100% extracted from https://old.aliimam.in/icons
// Strict 0px geometry & hairline borders contract
// ───────────────────────────────────────────────────────────────────────────

import React, { forwardRef } from 'react';

export interface AliImamIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
}

/**
 * ArrowRightIcon — Ali Imam Authentic Icon (ArrowRight)
 */
export const ArrowRightIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
);
ArrowRightIcon.displayName = 'ArrowRightIcon';

/**
 * CheckIcon — Ali Imam Authentic Icon (Check)
 */
export const CheckIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
);
CheckIcon.displayName = 'CheckIcon';

/**
 * CloseIcon — Ali Imam Authentic Icon (X)
 */
export const CloseIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
);
CloseIcon.displayName = 'CloseIcon';

/**
 * MenuIcon — Ali Imam Authentic Icon (Menu)
 */
export const MenuIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  )
);
MenuIcon.displayName = 'MenuIcon';

/**
 * ChevronDownIcon — Ali Imam Authentic Icon (ChevronDown)
 */
export const ChevronDownIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
);
ChevronDownIcon.displayName = 'ChevronDownIcon';

/**
 * ChevronRightIcon — Ali Imam Authentic Icon (ChevronRight)
 */
export const ChevronRightIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
);
ChevronRightIcon.displayName = 'ChevronRightIcon';

/**
 * ChevronUpIcon — Ali Imam Authentic Icon (ChevronUp)
 */
export const ChevronUpIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
);
ChevronUpIcon.displayName = 'ChevronUpIcon';

/**
 * TerminalIcon — Ali Imam Authentic Icon (Terminal)
 */
export const TerminalIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 19h8" />
      <path d="m4 17 6-6-6-6" />
    </svg>
  )
);
TerminalIcon.displayName = 'TerminalIcon';

/**
 * CodeIcon — Ali Imam Authentic Icon (Code)
 */
export const CodeIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </svg>
  )
);
CodeIcon.displayName = 'CodeIcon';

/**
 * CopyIcon — Ali Imam Authentic Icon (Copy)
 */
export const CopyIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="8" y="8" width="14" height="14" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
);
CopyIcon.displayName = 'CopyIcon';

/**
 * SparklesIcon — Ali Imam Authentic Icon (Sparkles)
 */
export const SparklesIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
      <path d="M20 2v4" />
      <path d="M22 4h-4" />
      <circle cx="4" cy="20" r="2" />
    </svg>
  )
);
SparklesIcon.displayName = 'SparklesIcon';

/**
 * UserIcon — Ali Imam Authentic Icon (User)
 */
export const UserIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
);
UserIcon.displayName = 'UserIcon';

/**
 * LogoutIcon — Ali Imam Authentic Icon (LogOut)
 */
export const LogoutIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </svg>
  )
);
LogoutIcon.displayName = 'LogoutIcon';

/**
 * DashboardIcon — Ali Imam Authentic Icon (Grid2x2)
 */
export const DashboardIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
);
DashboardIcon.displayName = 'DashboardIcon';

/**
 * PlusIcon — Ali Imam Authentic Icon (Plus)
 */
export const PlusIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
);
PlusIcon.displayName = 'PlusIcon';

/**
 * MinusIcon — Ali Imam Authentic Icon (Minus)
 */
export const MinusIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 12h14" />
    </svg>
  )
);
MinusIcon.displayName = 'MinusIcon';

/**
 * SearchIcon — Ali Imam Authentic Icon (SearchNormal1Rounded)
 */
export const SearchIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 22L20 20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
);
SearchIcon.displayName = 'SearchIcon';

/**
 * PlayIcon — Ali Imam Authentic Icon (Play)
 */
export const PlayIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
    </svg>
  )
);
PlayIcon.displayName = 'PlayIcon';

/**
 * RotateCcwIcon — Ali Imam Authentic Icon (RotateCcw)
 */
export const RotateCcwIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
);
RotateCcwIcon.displayName = 'RotateCcwIcon';

/**
 * DownloadIcon — Ali Imam Authentic Icon (Download)
 */
export const DownloadIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 15V3" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
    </svg>
  )
);
DownloadIcon.displayName = 'DownloadIcon';

/**
 * ShareIcon — Ali Imam Authentic Icon (Share2)
 */
export const ShareIcon = forwardRef<SVGSVGElement, AliImamIconProps>(
  ({ size = 20, strokeWidth = 1.5, className = '', ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  )
);
ShareIcon.displayName = 'ShareIcon';

// Convenience alias exports matching common naming
export const ArrowRight = ArrowRightIcon;
export const Check = CheckIcon;
export const X = CloseIcon;
export const Close = CloseIcon;
export const Menu = MenuIcon;
export const ChevronDown = ChevronDownIcon;
export const ChevronRight = ChevronRightIcon;
export const ChevronUp = ChevronUpIcon;
export const Terminal = TerminalIcon;
export const Code = CodeIcon;
export const Copy = CopyIcon;
export const Sparkles = SparklesIcon;
export const User = UserIcon;
export const LogOut = LogoutIcon;
export const Dashboard = DashboardIcon;
export const Plus = PlusIcon;
export const Minus = MinusIcon;
export const Search = SearchIcon;
export const Play = PlayIcon;
export const RotateCcw = RotateCcwIcon;
export const Download = DownloadIcon;
export const Share = ShareIcon;
