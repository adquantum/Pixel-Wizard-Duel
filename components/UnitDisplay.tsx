
import React, { useEffect, useState } from 'react';
import { Unit, School, Language } from '../types';
import { SCHOOL_ICONS, SCHOOL_COLORS, getFallbackSchoolIcon } from '../constants';

interface UnitDisplayProps {
  unit: Unit;
  isPlayer: boolean;
  animating: boolean;
  floatingText: { text: string; color: string } | null;
  language: Language;
}

export const UnitDisplay: React.FC<UnitDisplayProps> = ({ unit, isPlayer, animating, floatingText, language }) => {
  const [shake, setShake] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [iconError, setIconError] = useState<Record<string, boolean>>({});

  // DiceBear fallback for Avatars if local file is missing
  const getFallbackAvatar = () => {
      const seed = isPlayer ? `Wiz${unit.school}` : unit.name.replace(' ', '');
      return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;
  };

  useEffect(() => {
    if (floatingText && floatingText.color.includes('#ef4444')) { 
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [floatingText]);

  const handleIconError = (id: string) => {
      setIconError(prev => ({ ...prev, [id]: true }));
  };

  const renderPips = () => {
    const pips = [];
    const totalPips = unit.powerPips + unit.pips;
    for (let i = 0; i < unit.powerPips; i++) {
      pips.push(
        <div key={`pp-${i}`} className="relative w-5 h-5 mx-0.5">
           <div className="absolute inset-0 rounded-full bg-yellow-400 border-2 border-yellow-700 shadow-[0_0_5px_rgba(250,204,21,0.8)] animate-pulse"></div>
        </div>
      );
    }
    for (let i = 0; i < unit.pips; i++) {
      pips.push(
        <div key={`p-${i}`} className="relative w-5 h-5 mx-0.5">
           <div className="absolute inset-0 rounded-full bg-white border-2 border-gray-500"></div>
        </div>
      );
    }
    for (let i = totalPips; i < 7; i++) {
      pips.push(
        <div key={`e-${i}`} className="w-5 h-5 mx-0.5 rounded-full bg-black/40 border-2 border-gray-800"></div>
      );
    }
    return pips;
  };

  return (
    <div className={`relative flex flex-col items-center w-80 transition-transform duration-300 ${shake ? 'translate-x-2' : ''}`}>
      
      {/* --- BUFF GRID --- */}
      <div className="absolute -top-28 w-64 flex flex-wrap justify-center gap-2 z-20">
        {unit.buffs.slice(0, 6).map((buff, idx) => {
             const color = buff.school === 'UNIVERSAL' ? '#fbbf24' : SCHOOL_COLORS[buff.school as School];
             const isDebuff = buff.value < 0 || buff.type === 'TRAP';
             const schoolKey = buff.school === 'UNIVERSAL' ? 'BALANCE' : buff.school;
             const iconSrc = iconError[`buff-${buff.id}`] ? getFallbackSchoolIcon(schoolKey as School) : SCHOOL_ICONS[schoolKey as School];
             
             return (
              <div 
                key={`${buff.id}-${idx}`} 
                className="relative w-12 h-12 bg-gray-900 border-2 border-white shadow-lg flex flex-col items-center justify-center group"
                style={{ borderColor: color, imageRendering: 'pixelated', boxShadow: `0 0 0 2px #000, 0 0 10px ${color}` }}
              >
                <img 
                    src={iconSrc} 
                    className="w-6 h-6 opacity-80" 
                    alt="buff" 
                    onError={() => handleIconError(`buff-${buff.id}`)}
                />
                <div className={`font-bold text-[10px] font-mono bg-black/80 px-1 rounded-sm mt-1 ${isDebuff ? 'text-red-400' : 'text-green-400'}`}>
                  {buff.value > 0 ? '+' : ''}{Math.round(buff.value * 100)}%
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-32 bg-black text-white text-xs p-2 rounded z-50 border border-gray-700">
                    {language === 'CN' && buff.nameCN ? buff.nameCN : buff.name}
                </div>
              </div>
             );
        })}
      </div>

      {/* Floating Combat Text */}
      {floatingText && (
        <div className="absolute top-10 z-50 animate-float-up pointer-events-none w-full text-center">
          <span className="text-5xl font-[VT323] font-black tracking-widest" style={{ color: floatingText.color, textShadow: '4px 4px 0px #000' }}>
            {floatingText.text}
          </span>
        </div>
      )}

      {/* Avatar */}
      <div className={`relative w-48 h-48 mb-4 transition-all duration-300 ${animating ? 'scale-110 brightness-125' : ''}`}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-16 bg-indigo-900/50 border-4 border-indigo-500/30 rounded-[100%] animate-pulse"></div>
        <img 
          src={imgError ? getFallbackAvatar() : unit.avatarUrl} 
          alt={unit.name}
          onError={() => setImgError(true)}
          className={`w-full h-full object-contain rendering-pixelated filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${isPlayer ? 'scale-x-100' : '-scale-x-100'} ${unit.currentHp <= 0 ? 'grayscale opacity-50 blur-sm' : ''}`}
        />
        {animating && <div className="absolute inset-0 border-4 border-white/50 rounded-full animate-ping"></div>}
      </div>

      {/* Stats Box */}
      <div className="w-full bg-[#1a1b26] border-4 border-[#414868] p-2 rounded-sm shadow-[0_0_0_2px_#000]">
        <div className="flex justify-between items-end mb-1 pb-1 border-b-2 border-[#414868]">
          <span className="pixel-font text-xs text-yellow-400 uppercase tracking-wide drop-shadow-md">{unit.name}</span>
          <img 
            src={iconError['main'] ? getFallbackSchoolIcon(unit.school) : SCHOOL_ICONS[unit.school]} 
            className="w-6 h-6" 
            alt="school"
            onError={() => handleIconError('main')}
          />
        </div>
        <div className="relative h-6 bg-gray-800 border-2 border-black my-2">
           <div className="absolute inset-0 bg-red-900/50"></div>
           <div className="h-full bg-red-600 transition-all duration-500 ease-out relative" style={{ width: `${Math.max(0, Math.min(100, (unit.currentHp / unit.maxHp) * 100))}%` }}>
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/20"></div>
           </div>
           <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white drop-shadow-[1px_1px_0_#000]">
             {unit.currentHp} / {unit.maxHp}
           </span>
        </div>
        <div className="flex justify-center items-center gap-1 mt-2 h-8 bg-black/30 rounded border border-gray-700/50">
          {renderPips()}
        </div>
      </div>
    </div>
  );
};
