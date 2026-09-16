import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { getHeroTalentStatisticPosition } from 'analysis/retail/monk/shared/hero/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SPECS from 'game/SPECS';

// coalescence heals for mistweaver and damages for brewmaster
class Coalesence extends Analyzer {
  talent = TALENTS_MONK.COALESCENCE_TALENT;
  healing = 0;
  damage = 0;
  isMistweaver = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.isMistweaver = this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.COALESCENCE_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.COALESCENCE_DAMAGE),
      this.onDamage,
    );
  }

  private onHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  private onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={getHeroTalentStatisticPosition(this.talent)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={this.talent}>
          {this.isMistweaver ? (
            <ItemHealingDone amount={this.healing} />
          ) : (
            <ItemDamageDone amount={this.damage} />
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Coalesence;
