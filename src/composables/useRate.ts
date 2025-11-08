import { RateDetail } from "@/models/rates.model";
import { useI18n } from 'vue-i18n';

export default function(i18n: ReturnType<typeof useI18n>) {
  const { t, n, d } = i18n;

  function formatRateForSelect(rate: RateDetail) {
    return {
      value: rate.id,
      title: n(rate.value, { key: 'currency', currency: rate.currency.id }) + ' ' + t(`rates.types.${rate.type}.per`),
      subtitle: d(rate.dateFrom) + ' - ' + (rate.dateTo ? d(rate.dateTo) : '...'),
    };
  }

  return { formatRateForSelect };
}