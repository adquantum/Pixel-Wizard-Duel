import { Card, Unit, School } from '../types';

/**
 * W101 Pip Logic:
 * - Power Pip (Yellow) counts as 2 mana if the Spell School matches the Caster's School (or is Balance in some versions, but strictly: Same School).
 * - Power Pip counts as 1 mana for off-school spells.
 * - Regular Pip (White) always counts as 1 mana.
 */
export const calculatePipCost = (unit: Unit, cardPips: number, cardSchool: School): { canAfford: boolean, powerPipsToUse: number, regularPipsToUse: number } | null => {
  if (cardPips === 0) return { canAfford: true, powerPipsToUse: 0, regularPipsToUse: 0 };

  const isSchoolMatch = unit.school === cardSchool || unit.school === 'BALANCE'; // Giving Balance masters universal power pip access for proto
  
  // Calculate total mana available based on school match
  // If match: Total = (Power * 2) + Regular
  // If no match: Total = (Power * 1) + Regular
  
  let needed = cardPips;
  let ppUsed = 0;
  let pUsed = 0;
  
  let availablePP = unit.powerPips;
  let availableP = unit.pips;

  if (isSchoolMatch) {
      // Use Power Pips optimally (worth 2)
      // Logic: If needed >= 2 and have PP, use PP. 
      // If needed == 1 and have P, use P.
      // If needed == 1 and only PP, use PP (waste 1 mana).
      
      while (needed > 0) {
        if (needed >= 2 && availablePP > 0) {
            needed -= 2;
            availablePP--;
            ppUsed++;
        } else if (availableP > 0) {
            needed -= 1;
            availableP--;
            pUsed++;
        } else if (availablePP > 0) {
            // Forced to burn a power pip for 1 mana cost
            needed -= 2; 
            availablePP--;
            ppUsed++;
        } else {
            return null; // Broke
        }
      }
  } else {
      // Power Pips are worth 1. Treat all as simple pool.
      const totalAvailable = availableP + availablePP;
      if (totalAvailable < needed) return null;
      
      // Logic: Usually burn white pips first to save Power Pips for main school? 
      // W101 logic: Uses whatever. Let's use white first to be strategic.
      while (needed > 0) {
          if (availableP > 0) {
              availableP--;
              pUsed++;
              needed--;
          } else {
              availablePP--;
              ppUsed++;
              needed--;
          }
      }
  }

  return { canAfford: true, powerPipsToUse: ppUsed, regularPipsToUse: pUsed };
};

export const calculateDamage = (baseDamage: number, attacker: Unit, defender: Unit, cardSchool: School) => {
  let multiplier = 1.0;

  // 1. Blades (Attacker Outgoing) & Global Buffs
  const blades = attacker.buffs.filter(b => b.type === 'BLADE' && (b.school === 'UNIVERSAL' || b.school === cardSchool));
  blades.forEach(b => multiplier *= (1 + b.value));

  // 2. Weakness (Attacker Outgoing Debuff) - usually subtractive in W101 UI but math is mul for simplicity in this proto? 
  // W101 Weakness is -25%, meaning * 0.75.
  const weaknesses = attacker.buffs.filter(b => b.type === 'WEAKNESS');
  weaknesses.forEach(b => multiplier *= (1 + b.value)); // b.value is negative (-0.25)

  // 3. Traps (Defender Incoming)
  const traps = defender.buffs.filter(b => b.type === 'TRAP' && (b.school === 'UNIVERSAL' || b.school === cardSchool));
  traps.forEach(t => multiplier *= (1 + t.value));

  // 4. Shields (Defender Incoming Buff)
  const shields = defender.buffs.filter(b => b.type === 'SHIELD' && (b.school === 'UNIVERSAL' || b.school === cardSchool));
  shields.forEach(s => multiplier *= (1 - s.value)); 

  return Math.floor(baseDamage * multiplier);
};

export const getUsedBuffIds = (attacker: Unit, defender: Unit, cardSchool: School, isDamage: boolean): string[] => {
    if (!isDamage) return [];
    
    const ids: string[] = [];
    // Trigger Blades
    attacker.buffs.forEach(b => {
        if (b.type === 'BLADE' && (b.school === 'UNIVERSAL' || b.school === cardSchool)) ids.push(b.id);
        if (b.type === 'WEAKNESS') ids.push(b.id);
    });
    // Trigger Traps/Shields
    defender.buffs.forEach(b => {
        if (b.type === 'TRAP' && (b.school === 'UNIVERSAL' || b.school === cardSchool)) ids.push(b.id);
        if (b.type === 'SHIELD' && (b.school === 'UNIVERSAL' || b.school === cardSchool)) ids.push(b.id);
    });
    return ids;
};