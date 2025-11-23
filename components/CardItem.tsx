
import React, { useState } from 'react';
import { Card, Language } from '../types';
import { SCHOOL_COLORS, TYPE_ICONS, getFallbackSchoolIcon } from '../constants';

interface CardItemProps {
  card: Card;
  canAfford: boolean;
  onClick: () => void;
  disabled: boolean;
  language: Language;
}

export const CardItem: React.FC<CardItemProps> = ({ card, canAfford, onClick, disabled, language }) => {
  const color = SCHOOL_COLORS[card.school];
  const name = language === 'CN' ? card.nameCN : card.name;
  const desc = language === 'CN' ? card.descriptionCN : card.description;
  
  const [artError, setArtError] = useState(false);
  
  // Use the Type Icon (Fist, Shield, etc.) as the fallback image center
  const typeIconSrc = TYPE_ICONS[card.type] || TYPE_ICONS.ATTACK;
  const schoolIconFallback = getFallbackSchoolIcon(card.school);

  return (
    <div 
      onClick={() => !disabled && canAfford && onClick()}
      className={`
        group relative w-32 h-52 cursor-pointer transition-all duration-300 ease-out select-none flex-shrink-0
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-8 hover:scale-110 hover:z-50 hover:rotate-1'}
        ${!canAfford && !disabled ? 'opacity-60 saturate-50' : ''}
      `}
      style={{ imageRendering: 'pixelated', transformOrigin: 'center bottom' }}
    >
      <div className="absolute inset-0 rounded-lg border-[4px] bg-[#18181b] flex flex-col shadow-xl overflow-hidden" style={{ borderColor: '#d4b483' }}>
        
        {/* Header */}
        <div className="h-7 flex items-center justify-between px-2 text-[10px] font-bold text-white border-b-2 border-[#d4b483]" style={{ backgroundColor: color }}>
          <span className={`truncate font-[VT323] text-lg tracking-tight ${language === 'CN' ? 'font-sans text-xs pt-1' : ''}`}>{name}</span>
        </div>

        {/* Art Area */}
        <div className="h-28 bg-[#09090b] relative flex items-center justify-center overflow-hidden group-hover:brightness-110">
             {!artError ? (
                 <img 
                    src={card.assetUrl} 
                    alt="spell" 
                    className="w-20 h-20 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]"
                    onError={() => setArtError(true)}
                 />
             ) : (
                 // FALLBACK LAYOUT: Show Type Icon in center if main art is missing
                 <div className="relative w-full h-full flex items-center justify-center">
                    {/* Faint School Icon in background */}
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center scale-150">
                        <img src={schoolIconFallback} className="w-24 h-24 grayscale" alt="bg" />
                    </div>
                    {/* Type Icon (e.g. Damage Fist) in center */}
                    <img 
                        src={typeIconSrc} 
                        className="w-16 h-16 object-contain drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]" 
                        alt="type fallback" 
                    />
                 </div>
             )}

             {/* Watermark (Bottom Right) */}
             <img 
                src={schoolIconFallback} 
                className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 pointer-events-none" 
                alt="wm" 
             />
        </div>

        {/* Stats Bar */}
        <div className="h-5 bg-black/50 flex justify-between items-center px-1 border-t-2 border-b-2 border-[#d4b483]">
             <div className="text-yellow-400 font-bold text-xs font-[Press Start 2P] pl-1">
                {card.pips}<span className="text-[8px]">p</span>
             </div>
             <div className="text-green-400 font-mono text-xs">
                {Math.floor(card.accuracy * 100)}%
             </div>
             <div className="flex items-center justify-center w-4 h-4">
                <img src={typeIconSrc} alt={card.type} className="w-4 h-4 object-contain" />
             </div>
        </div>

        {/* Description */}
        <div className="flex-1 bg-[#e7e5e4] p-1 text-center flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)`, backgroundSize: '4px 4px' }}></div>
            <p className={`text-[10px] leading-3 font-serif font-bold text-gray-900 z-10 px-1 ${language === 'CN' ? 'font-sans text-[9px]' : ''}`}>
                {desc}
            </p>
        </div>
      </div>
      
      {!disabled && canAfford && (
        <div className="absolute -inset-2 rounded-xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-md"></div>
      )}
    </div>
  );
};
