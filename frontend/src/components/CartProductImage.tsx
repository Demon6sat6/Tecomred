import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export default function CartProductImage({ src, alt, className = '' }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (failedSrc === src || !src) {
    return (
      <div className={`flex items-center justify-center bg-blue-50 text-[#0052cc] ${className}`} role="img" aria-label={alt}>
        <ShoppingBag className="w-7 h-7" aria-hidden="true" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailedSrc(src)} />;
}
