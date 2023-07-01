const dayjs = require('dayjs');

const now = dayjs();

exports.startDate = () => {
  const date_format = 'YYYY-MM-DD';
  const start_date = now.startOf('month').format(date_format);
  return start_date;
};

exports.endDate = () => {
  const date_format = 'YYYY-MM-DD';
  const end_date = now.endOf('month').format(date_format);
  return end_date;
};

exports.todayDate = () => {
  const today_date = now.format('YYYY-MM-DD');
  return today_date;
};

exports.firstDay = () => {
  const start_date = now.startOf('month');
  const first_day = start_date.day();
  return first_day;
}
