function parseTimeToMinutes(value) {
  const [hh, mm] = String(value || '').split(':');
  const h = Number(hh);
  const m = Number(mm);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function isHappyHourActive(nowMinutes, start, end) {
  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);
  if (startMin === null || endMin === null) return false;

  if (startMin === endMin) return true;
  if (startMin < endMin) {
    return nowMinutes >= startMin && nowMinutes <= endMin;
  }

  return nowMinutes >= startMin || nowMinutes <= endMin;
}

function computeEffectiveDiscount(product, nowMinutes) {
  const baseDiscount = Number(product.discount_percent || 0);
  const happyDiscount = Number(product.happy_hour_discount_percent || 0);
  const happyEnabled = Number(product.happy_hour_enabled || 0) === 1;
  const active =
    happyEnabled && isHappyHourActive(nowMinutes, product.happy_hour_start, product.happy_hour_end);

  if (active) {
    return { active, discountPercent: happyDiscount };
  }

  return { active, discountPercent: baseDiscount };
}

module.exports = {
  parseTimeToMinutes,
  isHappyHourActive,
  computeEffectiveDiscount
};

