import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { MISTWEAVER_HEART_SPELLS, WINDWALKER_HEART_SPELLS } from '../constants';

const HEART_COOLDOWN_RATE = 0.75;

export const HEART_BUFFS = [
  SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF,
  SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY,
  SPELLS.HEART_OF_THE_JADE_SERPENT_AVATAR,
];

class HeartOfTheJadeSerpent extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  isMW = true;
  private activeBuffs = new Set<number>();
  private appliedRate: number | null = null;

  constructor(options: Options) {
    super(options);

    this.isMW = this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id;
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onRemoveBuff,
    );
  }

  protected rateChange(abilityId: number): number {
    const unity = abilityId === SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id;
    return (unity ? 2 : 1) * HEART_COOLDOWN_RATE;
  }

  private get heartSpells(): number[] {
    return this.isMW
      ? MISTWEAVER_HEART_SPELLS(
          this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT),
        )
      : WINDWALKER_HEART_SPELLS;
  }

  private syncRateChange(timestamp: number) {
    const rate =
      this.activeBuffs.size === 0
        ? null
        : 1 +
          this.rateChange(
            this.activeBuffs.has(SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id)
              ? SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id
              : SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF.id,
          );

    if (rate === this.appliedRate) {
      return;
    }
    if (this.appliedRate !== null) {
      this.spellUsable.removeCooldownRateChange(this.heartSpells, this.appliedRate, timestamp);
    }
    if (rate !== null) {
      this.spellUsable.applyCooldownRateChange(this.heartSpells, rate, timestamp);
    }
    this.appliedRate = rate;
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    this.activeBuffs.add(event.ability.guid);
    this.syncRateChange(event.timestamp);
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    this.activeBuffs.delete(event.ability.guid);
    this.syncRateChange(event.timestamp);
  }
}

export default HeartOfTheJadeSerpent;
