import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
  linkTo?: string;
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '',
  linkTo = '/',
  showTagline = false
}) => {
  const sizes = {
    sm: {
      container: 'h-8',
      icon: 'w-8 h-8',
      text: 'text-xl',
      tagline: 'text-xs',
      logoText: 'text-lg'
    },
    md: {
      container: 'h-12',
      icon: 'w-12 h-12',
      text: 'text-2xl',
      tagline: 'text-sm',
      logoText: 'text-xl'
    },
    lg: {
      container: 'h-16',
      icon: 'w-16 h-16',
      text: 'text-3xl',
      tagline: 'text-base',
      logoText: 'text-2xl'
    },
    xl: {
      container: 'h-20',
      icon: 'w-20 h-20',
      text: 'text-4xl',
      tagline: 'text-lg',
      logoText: 'text-3xl'
    }
  };

  const currentSize = sizes[size];

  const GlossyTurquoiseLogo = () => (
    <div className={`${currentSize.icon} relative rounded-2xl overflow-hidden shadow-2xl`}
         style={{
           background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
           boxShadow: '0 10px 30px rgba(6, 182, 212, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
         }}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={`${currentSize.logoText} font-black text-white drop-shadow-lg`}
              style={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
          BambÃ©
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );

  if (variant === 'icon') {
    return (
      <Link to={linkTo} className={`flex items-center transition-transform hover:scale-105 ${className}`}>
        <GlossyTurquoiseLogo />
      </Link>
    );
  }

  if (variant === 'text') {
    return (
      <Link to={linkTo} className={`flex flex-col ${className}`}>
        <span className={`${currentSize.text} font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent`}
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          BambÃ©
        </span>
        {showTagline && (
          <span className={`${currentSize.tagline} text-gray-600 dark:text-gray-400 -mt-1`}>
            Marketplace & Services
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link to={linkTo} className={`flex items-center gap-3 transition-transform hover:scale-105 ${className}`}>
      <GlossyTurquoiseLogo />
      <div className="flex flex-col">
        <span className={`${currentSize.text} font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent leading-tight`}
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          BambÃ©
        </span>
        {showTagline && (
          <span className={`${currentSize.tagline} text-gray-600 dark:text-gray-400 -mt-0.5`}>
            Marketplace & Services
          </span>
        )}
      </div>
    </Link>
  );

}

export default Logo;
