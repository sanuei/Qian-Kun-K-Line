import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getStoredRating, saveRating } from '../services/storageService';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface Props {
  lang: Language;
}

const RatingSystem: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    const stored = getStoredRating();
    if (stored > 0) {
      setRating(stored);
      setHasRated(true);
    }
  }, []);

  const handleRate = (score: number) => {
    setRating(score);
    setHasRated(true);
    saveRating(score);
  };

  return (
    <div className="mt-8 bg-[#FDFBF7] border border-[#D7CCC8] rounded-sm p-6 text-center shadow-sm">
      <h4 className="text-[#8B7E74] text-sm font-bold tracking-widest uppercase mb-2">
        {t.rateTitle}
      </h4>
      
      {!hasRated && <p className="text-xs text-[#5D4037] mb-4">{t.rateDesc}</p>}

      <div className="flex justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-transform hover:scale-110 focus:outline-none"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={hasRated}
          >
            <Star
              size={28}
              fill={star <= (hover || rating) ? '#D4AF37' : 'none'}
              color={star <= (hover || rating) ? '#D4AF37' : '#D7CCC8'}
              className="transition-colors duration-200"
            />
          </button>
        ))}
      </div>

      {hasRated && (
        <div className="animate-fade-in-up">
           <p className="text-[#A93226] font-serif font-bold text-sm mt-2">{t.thanksRate}</p>
           <p className="text-[10px] text-[#8B7E74] mt-1">
             当前评分: {rating}.0 / 5.0
           </p>
        </div>
      )}
    </div>
  );
};

export default RatingSystem;
