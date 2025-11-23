
import React, { useState } from 'react';
import { Card, Language } from '../types';
import { SCHOOL_COLORS, TYPE_ICONS, SCHOOL_ICONS, getFallbackSchoolIcon } from '../constants';

interface CardItemProps {
  card: Card;
  canAfford: boolean;
  onClick: () => void;
  disabled: boolean;
  language: Language;
}

export const CardItem: React.FC<CardItemProps> = ({ card, canAfford, onClick, disabled, language }) => {
  const schoolColor = SCHOOL_COLORS[card.school];
  const name = language === 'CN' ? card.nameCN : card.name;
  const desc = language === 'CN' ? card.descriptionCN : card.description;
  
  const [artError, setArtError] = useState(false);
  
  const typeIconSrc = TYPE_ICONS[card.type] || TYPE_ICONS.ATTACK;
  const schoolIconSrc = SCHOOL_ICONS[card.school];

  return (
    <div 
      onClick={() => !disabled && canAfford && onClick()}
      className={`
        group relative w-36 h-56 cursor-pointer transition-all duration-150 ease-in-out select-none flex-shrink-0
        ${disabled ? 'opacity-60 cursor-not-allowed grayscale-[0.8]' : 'hover:-translate-y-2 hover:z-50'}
        ${!canAfford && !disabled ? 'opacity-80' : ''}
      `}
      style={{ 
          fontFamily: '"VT323", monospace',
          imageRendering: 'pixelated'
      }}
    >
      {/* --- CARD FRAME (MULTI-LAYER PIXEL BORDER) --- */}
      <div className="w-full h-full flex flex-col bg-[#18181b] relative overflow-hidden"
           style={{
             boxShadow: `
               0 0 0 2px #000,
               0 0 0 4px ${schoolColor}, 
               0 0 0 6px #000
             `
           }}>
           
        {/* HEADER (Title) */}
        <div className="h-8 mt-1 mx-1 flex items-center justify-center bg-[#27272a] border-b-2 border-black relative z-10">
            {/* Subtle Background Tint */}
            <div className="absolute inset-0 opacity-40" style={{ backgroundColor: schoolColor }}></div>
            <span className={`text-white drop-shadow-[1px_1px_0_#000] z-10 truncate px-8 ${language === 'CN' ? 'text-sm font-bold' : 'text-lg'}`}>
               {name.toUpperCase()}
            </span>
        </div>

        {/* ART CONTAINER */}
        <div className="flex-1 relative bg-gray-900 mx-1 border-x-2 border-black overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '4px 4px' }}>
            </div>

            {!artError ? (
                 <img 
                    src={card.assetUrl} 
                    alt="spell" 
                    className="w-full h-full object-cover"
                    onError={() => setArtError(true)}
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundColor: schoolColor }}></div>
                    <img 
                        src={typeIconSrc} 
                        className="w-16 h-16 object-contain drop-shadow-[4px_4px_0_#000]" 
                        alt="type fallback" 
                    />
                 </div>
             )}
        </div>

        {/* DESCRIPTION BOX */}
        <div className="h-16 mx-1 mb-1 bg-[#e7e5e4] border-t-2 border-black p-1 text-center flex items-center justify-center relative z-10">
            <p className={`leading-3 text-black font-bold drop-shadow-sm ${language === 'CN' ? 'text-[10px]' : 'text-[12px]'}`}>
                {desc}
            </p>
        </div>

        {/* --- INTEGRATED CORNER STATS --- */}
        
        {/* TOP-LEFT: PIPS (Golden Corner Triangle) */}
        <div className="absolute top-0 left-0 w-14 h-14 z-20 pointer-events-none">
            {/* Triangle Shape via Gradient */}
            <div className="absolute top-0 left-0 w-full h-full"
                 style={{
                   background: `linear-gradient(135deg, #fbbf24 45%, #b45309 50%, transparent 50%)`,
                   filter: 'drop-shadow(2px 2px 0 #000)'
                 }}>
            </div>
            {/* Pip Number */}
            <span className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center font-[Press Start 2P] text-white text-[12px] font-bold drop-shadow-[1px_1px_0_#000] z-30">
                {card.pips}
            </span>
        </div>

        {/* TOP-RIGHT: SCHOOL ICON (Embedded Box) */}
        <div className="absolute top-0 right-0 w-9 h-9 z-20 pointer-events-none bg-[#18181b] border-l-2 border-b-2 border-[#a1a1aa] flex items-center justify-center shadow-[-2px_2px_0_#000]">
             <img 
               src={schoolIconSrc} 
               alt={card.school} 
               className="w-7 h-7 object-contain" 
               onError={(e) => { e.currentTarget.src = getFallbackSchoolIcon(card.school); }}
             />
        </div>

        {/* BOTTOM-LEFT: ACCURACY (Socketed Circle) */}
        <div className="absolute bottom-[60px] left-2 w-8 h-8 z-20 translate-y-4">
            <div className="w-full h-full rounded-full bg-[#064e3b] border-2 border-[#34d399] flex items-center justify-center shadow-[0_2px_0_#000] group-hover:scale-110 transition-transform">
                <span className="text-white font-[VT323] text-sm font-bold drop-shadow-md">
                    {Math.floor(card.accuracy * 100)}%
                </span>
            </div>
        </div>

        {/* BOTTOM-RIGHT: TYPE ICON (Socketed Square) */}
        <div className="absolute bottom-[60px] right-2 w-8 h-8 z-20 translate-y-4">
             <div className="w-full h-full bg-[#27272a] border-2 border-gray-400 flex items-center justify-center p-0.5 shadow-[0_2px_0_#000] group-hover:scale-110 transition-transform">
                 <img src={typeIconSrc} alt={card.type} className="w-full h-full object-contain" />
             </div>
        </div>

      </div>
      
      {/* HOVER GLOW (Outer Ring) */}
      {!disabled && canAfford && (
        <div className="absolute -inset-2 border-2 border-white opacity-0 group-hover:opacity-100 pointer-events-none z-50 rounded-sm" 
             style={{ animation: 'pulse 1s infinite' }}>
        </div>
      )}
    </div>
  );
};
