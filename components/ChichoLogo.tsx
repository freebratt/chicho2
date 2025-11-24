'use client';

interface ChichoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ChichoLogo({ className = '', size = 'md' }: ChichoLogoProps) {
  const sizeClasses = {
    sm: 'w-40 h-40',
    md: 'w-40 h-40', 
    lg: 'w-40 h-40'
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <img 
        src="https://assets.macaly-user-data.dev/cdn-cgi/image/format=webp,width=2000,height=2000,fit=scale-down,quality=90,anim=true/jbuldz11rm382jinidkd81ad/kj34r1pvqkohnjr9zf3y8i94/mK-FLn6hbjtwTjmeeCSYb/logo.png" 
        alt="CHICHO Logo" 
        className={`${sizeClasses[size]} object-contain rounded-md shadow-lg`}
      />
    </div>
  );
}


