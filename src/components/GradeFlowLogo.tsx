import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const GradeFlowLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
  iconOnly = false,
}) => {
  // Wordmark (g12) heights — width scales automatically to preserve aspect ratio
  const heightClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
    xl: 'h-14',
  };

  // Square icon (g5) sizes
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/g5.png"
          alt="GradeFlow icon"
          className={`${iconSizes[size]} object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-center select-none ${className}`}>
      {/* Full GradeFlow wordmark logo (g12) */}
      <img
        src="/g12.png"
        alt="GradeFlow"
        className={`${heightClasses[size]} w-auto object-contain shrink-0`}
      />
      {showSubtitle && (
        <p className="font-script text-sm sm:text-[15px] leading-none text-[#dd2987] mt-1">
          Your academic life, in flow.
        </p>
      )}
    </div>
  );
};
