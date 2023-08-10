const dayjs = require('dayjs');

exports.startDate = () => {
  const date_format = 'YYYY-MM-DD';
  const start_date = dayjs(Date.now()).startOf('month').format(date_format);
  return start_date;
};

exports.endDate = () => {
  const date_format = 'YYYY-MM-DD';
  const end_date = dayjs(Date.now()).endOf('month').format(date_format);
  return end_date;
};

exports.todayDate = () => {
  const today_date = dayjs(Date.now()).format('YYYY-MM-DD');
  return today_date;
};

exports.firstDay = () => {
  const start_date = dayjs(Date.now()).startOf('month');
  const first_day = start_date.day();
  return first_day;
}