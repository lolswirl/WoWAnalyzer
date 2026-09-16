import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellIcon from 'interface/SpellIcon';
import { getHeroTalentStatisticPosition } from '../../constants';
import { INNER_COMPASS_STAT_INCREASE } from '../constants';

interface Stance {
  spell: Spell;
  label: string;
}

const STANCES: Stance[] = [
  { spell: SPELLS.INNER_COMPASS_CRANE_STANCE, label: 'Haste' },
  { spell: SPELLS.INNER_COMPASS_TIGER_STANCE, label: 'Crit' },
  { spell: SPELLS.INNER_COMPASS_OX_STANCE, label: 'Vers' },
  { spell: SPELLS.INNER_COMPASS_SERPENT_STANCE, label: 'Mastery' },
];

class InnerCompass extends Analyzer {
  talent = TALENTS_MONK.INNER_COMPASS_TALENT;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
  }

  uptime(stance: Stance) {
    return this.selectedCombatant.getBuffUptime(stance.spell.id);
  }

  uptimePercent(stance: Stance) {
    return this.uptime(stance) / this.owner.fightDuration;
  }

  averageStat(stance: Stance) {
    return INNER_COMPASS_STAT_INCREASE * this.uptimePercent(stance);
  }

  statistic() {
    return (
      <Statistic
        position={getHeroTalentStatisticPosition(this.talent)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <ul>
            {STANCES.map((stance) => (
              <li key={stance.spell.id}>
                <SpellLink spell={stance.spell} />: {formatDuration(this.uptime(stance))} (
                {formatPercentage(this.uptimePercent(stance))}% uptime)
              </li>
            ))}
          </ul>
        }
      >
        <TalentSpellText talent={this.talent}>
          {STANCES.map((stance) => (
            <div key={stance.spell.id}>
              <SpellIcon spell={stance.spell} /> {formatPercentage(this.averageStat(stance))}%{' '}
              <small>average {stance.label}</small>
            </div>
          ))}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default InnerCompass;
