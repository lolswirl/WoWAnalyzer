import { Talent } from 'common/TALENTS/types';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { CONDUIT_TALENT_ORDER } from './ConduitOfTheCelestials/constants';
import { HARMONY_TALENT_ORDER } from './MasterOfHarmony/constants';

// position 0 is reserved for the hero talent summary
export function getHeroTalentStatisticPosition(talent: Talent): number {
  const order = CONDUIT_TALENT_ORDER.includes(talent) ? CONDUIT_TALENT_ORDER : HARMONY_TALENT_ORDER;
  return STATISTIC_ORDER.CORE(order.indexOf(talent) + 1);
}
