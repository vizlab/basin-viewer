const zeroPadding = s => {
  return `000${s}`.slice(-2);
};

const currentDate = d => {
  const year = d.getUTCFullYear();
  const month = zeroPadding(d.getUTCMonth() + 1);
  const day = zeroPadding(d.getUTCDate());
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
};

const nextDate = d => {
  return new Date(currentDate(d).getTime() + 86400000);
};

const currentMonth = d => {
  return new Date(`${d.getUTCFullYear()}-${zeroPadding(d.getUTCMonth() + 1)}-01T00:00:00.000Z`);
};

const nextMonth = d => {
  const month = d.getUTCMonth();
  if (month === 11) {
    return new Date(`${d.getUTCFullYear() + 1}-${zeroPadding(month + 1)}-01T00:00:00.000Z`);
  }
  return new Date(`${d.getUTCFullYear()}-${zeroPadding(month + 2)}-01T00:00:00.000Z`);
};

const ensureUTC = d => {
  const year = d.getFullYear();
  const month = zeroPadding(d.getMonth() + 1);
  const day = zeroPadding(d.getDate());
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
};

exports.currentDate = currentDate;
exports.nextDate = nextDate;
exports.currentMonth = currentMonth;
exports.nextMonth = nextMonth;
exports.ensureUTC = ensureUTC;
