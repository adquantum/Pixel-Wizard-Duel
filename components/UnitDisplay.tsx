
import React, { useEffect, useState } from 'react';
import { Unit, School, Language, Buff } from '../types';
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
        <div key={`pp-${i}`} className="relative w-6 h-6 mx-0.5">
           <div className="absolute inset-0 rounded-full bg-yellow-400 border-[3px] border-yellow-700 shadow-[inset_2px_2px_0_rgba(255,255,255,0.5)] animate-pulse"></div>
        </div>
      );
    }
    for (let i = 0; i < unit.pips; i++) {
      pips.push(
        <div key={`p-${i}`} className="relative w-6 h-6 mx-0.5">
           <div className="absolute inset-0 rounded-full bg-white border-[3px] border-gray-500 shadow-[inset_2px_2px_0_rgba(255,255,255,0.8)]"></div>
        </div>
      );
    }
    for (let i = totalPips; i < 7; i++) {
      pips.push(
        <div key={`e-${i}`} className="w-6 h-6 mx-0.5 rounded-full bg-black/40 border-[3px] border-gray-800"></div>
      );
    }
    return pips;
  };

  const renderBuffSquare = (buff: Buff, idx: number) => {
      const color = buff.school === 'UNIVERSAL' ? '#fbbf24' : SCHOOL_COLORS[buff.school as School];
      const isDebuff = buff.value < 0 || buff.type === 'TRAP' || buff.type === 'WEAKNESS';
      const schoolKey = buff.school === 'UNIVERSAL' ? 'BALANCE' : buff.school;
      const iconSrc = iconError[`buff-${buff.id}`] ? getFallbackSchoolIcon(schoolKey as School) : SCHOOL_ICONS[schoolKey as School];

      return (
        <div 
          key={`${buff.id}-${idx}`} 
          className="relative w-10 h-10 bg-gray-900 flex flex-col items-center justify-center group mb-2"
          style={{ 
              imageRendering: 'pixelated', 
              boxShadow: `0 0 0 2px #000, 0 0 0 4px ${color}`
          }}
        >
          {/* Buff Icon */}
          <img 
              src={iconSrc} 
              className="w-6 h-6 object-contain drop-shadow-[1px_1px_0_#000]" 
              alt="buff" 
              onError={() => handleIconError(`buff-${buff.id}`)}
          />
          
          {/* Value Text (Overlay) */}
          <div className={`absolute -bottom-2 -right-2 font-['VT323'] text-lg font-bold leading-none drop-shadow-[2px_2px_0_#000] z-10 ${isDebuff ? 'text-red-400' : 'text-green-400'}`}
               style={{ textShadow: '2px 2px 0 #000' }}>
            {buff.value > 0 ? '+' : ''}{Math.round(buff.value * 100)}%
          </div>
          
          {/* Tooltip */}
          <div className={`absolute top-0 w-32 bg-black text-white text-xs p-2 z-50 border-2 border-white font-['Press_Start_2P'] pointer-events-none text-center leading-relaxed hidden group-hover:block ${isPlayer ? 'left-full ml-2' : 'right-full mr-2'}`}>
              {language === 'CN' && buff.nameCN ? buff.nameCN : buff.name}
          </div>
        </div>
       );
  };

  const charms = unit.buffs.filter(b => ['BLADE', 'WEAKNESS', 'REGEN'].includes(b.type));
  const wards = unit.buffs.filter(b => ['SHIELD', 'TRAP', 'DOT', 'AURA'].includes(b.type));

  return (
    <div className={`relative flex flex-col items-center w-80 transition-transform duration-300 ${shake ? 'translate-x-2' : ''}`}>
      
      {/* --- BUFF COLUMNS (SIDEBAR) --- */}
      <div className={`absolute top-0 bottom-20 flex gap-2 ${isPlayer ? 'left-[105%]' : 'right-[105%] flex-row-reverse'}`}>
          {/* Column 1: Charms/Blades (Inner) */}
          <div className="flex flex-col justify-end pb-2 w-12 items-center">
              {charms.map(renderBuffSquare)}
          </div>
          {/* Column 2: Wards/Traps (Outer) */}
          <div className="flex flex-col justify-end pb-2 w-12 items-center">
              {wards.map(renderBuffSquare)}
          </div>
      </div>

      {/* Floating Combat Text */}
      {floatingText && (
        <div className="absolute top-10 z-50 animate-float-up pointer-events-none w-full text-center">
          <span className="text-6xl font-['VT323'] font-black tracking-widest" style={{ color: floatingText.color, textShadow: '4px 4px 0px #000, -2px -2px 0 #000' }}>
            {floatingText.text}
          </span>
        </div>
      )}

      {/* Avatar */}
      <div className={`relative w-56 h-56 mb-4 transition-all duration-300 ${animating ? 'scale-110 brightness-125' : ''}`}>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-16 bg-black/40 blur-md rounded-[100%]"></div>
        <img 
          src={imgError ? getFallbackAvatar() : unit.avatarUrl} 
          alt={unit.name}
          onError={() => setImgError(true)}
          className={`w-full h-full object-contain rendering-pixelated filter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)] ${isPlayer ? 'scale-x-100' : '-scale-x-100'} ${unit.currentHp <= 0 ? 'grayscale opacity-50 blur-sm' : ''}`}
        />
        {animating && <div className="absolute inset-0 border-4 border-white/50 rounded-full animate-ping"></div>}
      </div>

      {/* Stats Box */}
      <div className="w-full bg-[#1a1b26] p-2 shadow-[0_0_0_4px_#000] relative">
        <div className="flex justify-between items-end mb-1 pb-1 border-b-4 border-black">
          <span className="font-['Press_Start_2P'] text-[10px] text-yellow-400 uppercase tracking-wider drop-shadow-md">{unit.name}</span>
          <img 
            src={iconError['main'] ? getFallbackSchoolIcon(unit.school) : SCHOOL_ICONS[unit.school]} 
            className="w-6 h-6 drop-shadow-md" 
            alt="school"
            onError={() => handleIconError('main')}
          />
        </div>
        
        {/* HP Bar */}
        <div className="relative h-8 bg-gray-900 border-[3px] border-black my-2 shadow-[inset_0_0_10px_#000]">
           <div className="absolute inset-0 bg-red-900/40"></div>
           <div className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500 ease-out relative" style={{ width: `${Math.max(0, Math.min(100, (unit.currentHp / unit.maxHp) * 100))}%` }}>
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30"></div>
           </div>
           <span className="absolute inset-0 flex items-center justify-center text-lg font-['VT323'] text-white drop-shadow-[2px_2px_0_#000] tracking-widest">
             {unit.currentHp} / {unit.maxHp}
           </span>
        </div>
        
        {/* Pips */}
        <div className="flex justify-center items-center gap-1 mt-3 h-10 bg-black/40 rounded border-2 border-gray-700/50">
          {renderPips()}
        </div>
      </div>
    </div>
  );
};
