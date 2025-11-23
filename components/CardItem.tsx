

import React, { useState } from 'react';
import { Card, Language } from '../types';
import { SCHOOL_COLORS, TYPE_ICONS, SCHOOL_ICONS, getFallbackSchoolIcon, TRANSLATIONS } from '../constants';

interface CardItemProps {
  card: Card;
  canAfford: boolean;
  onClick: () => void;
  onDiscard?: () => void;
  disabled: boolean;
  language: Language;
}

export const CardItem: React.FC<CardItemProps> = ({ card, canAfford, onClick, onDiscard, disabled, language }) => {
  const schoolColor = SCHOOL_COLORS[card.school];
  const name = language === 'CN' ? card.nameCN : card.name;
  const desc = language === 'CN' ? card.descriptionCN : card.description;
  const t = TRANSLATIONS[language];
  
  const [artError, setArtError] = useState(false);
  
  const typeIconSrc = TYPE_ICONS[card.type] || TYPE_ICONS.ATTACK;
  const schoolIconSrc = SCHOOL_ICONS[card.school];

  return (
    <div 
      onClick={() => !disabled && canAfford && onClick()}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!disabled && onDiscard) onDiscard();
      }}
      title={!disabled ? t.DISCARD_HINT : ""}
      className={`
        group relative w-44 h-64 cursor-pointer transition-all duration-150 ease-in-out select-none flex-shrink-0
        ${disabled ? 'opacity-60 cursor-not-allowed grayscale-[0.8]' : 'hover:-translate-y-2 hover:z-50'}
        ${!canAfford && !disabled ? 'opacity-80' : ''}
      `}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* --- OUTER FRAME --- */}
      <div 
        className="w-full h-full flex flex-col bg-[#111] p-1.5 relative overflow-hidden"
        style={{
            boxShadow: `0 0 0 2px #000, 0 0 0 4px ${schoolColor}, 0 0 0 6px #000`,
            borderRadius: '4px'
        }}
      >

        {/* --- 1. HEADER BAR --- */}
        <div className="relative h-8 flex items-center bg-[#222] border-2 border-black mb-1">
             {/* Background Tint */}
             <div className="absolute inset-0 opacity-40 z-0" style={{ backgroundColor: schoolColor }}></div>
             
             {/* Pip Cost (Absolute Left) */}
             <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 z-20">
                <div className="w-full h-full rounded-full bg-yellow-400 border-[3px] border-black flex items-center justify-center shadow-[1px_1px_0_#000]">
                    <span className="font-['Press_Start_2P'] text-black text-sm pt-1">{card.pips}</span>
                </div>
             </div>

             {/* Name (Centered/Right) */}
             <div className="w-full pl-8 pr-8 text-center z-10">
                 <span className={`text-white drop-shadow-[1px_1px_0_#000] tracking-wide ${language === 'CN' ? 'font-bold font-[VT323] text-lg' : 'font-[VT323] text-xl uppercase'}`}>
                    {name}
                 </span>
             </div>
             
             {/* School Icon (Absolute Right) */}
             <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-6 h-6">
                 <img 
                   src={schoolIconSrc} 
                   alt={card.school} 
                   className="w-full h-full object-contain drop-shadow-md"
                   onError={(e) => { e.currentTarget.src = getFallbackSchoolIcon(card.school); }}
                 />
             </div>
        </div>

        {/* --- 2. ART AREA --- */}
        <div className="flex-1 relative bg-black border-2 border-gray-700 overflow-hidden mb-1">
            {!artError ? (
                 <img 
                    src={card.assetUrl} 
                    alt="spell" 
                    className="w-full h-full object-cover"
                    onError={() => setArtError(true)}
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <img 
                        src={typeIconSrc} 
                        className="w-16 h-16 object-contain opacity-40" 
                        alt="fallback" 
                    />
                 </div>
             )}
        </div>

        {/* --- 3. INFO STRIP (Acc | Type) --- */}
        <div className="h-6 flex justify-between items-center bg-[#1a1a1a] border-x-2 border-black px-2 mb-1">
            {/* Accuracy */}
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-300 font-['VT323'] text-lg">{Math.floor(card.accuracy * 100)}%</span>
            </div>
            
            {/* Type Icon */}
            <div className="w-5 h-5">
                <img src={typeIconSrc} alt={card.type} className="w-full h-full object-contain" />
            </div>
        </div>

        {/* --- 4. DESCRIPTION BOX --- */}
        <div className="h-16 bg-[#e5e5e5] border-2 border-black p-1 flex items-center justify-center text-center relative">
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)`, backgroundSize: '4px 4px' }}>
            </div>
            <p className={`text-black leading-none drop-shadow-none z-10 ${language === 'CN' ? 'text-xs font-bold' : 'text-sm font-[VT323]'}`}>
                {desc}
            </p>
        </div>

      </div>
      
      {/* HOVER GLOW */}
      {!disabled && canAfford && (
        <div className="absolute -inset-2 border-[4px] border-white/80 opacity-0 group-hover:opacity-100 pointer-events-none z-50 rounded-lg animate-pulse"></div>
      )}
    </div>
  );
};