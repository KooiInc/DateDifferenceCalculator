export default dateDiffCalculatorFactory;

function dateDiffCalculatorFactory() {
  const [diffsStringifier, daysInMonth, sortAndFragmentize] = compositions();
  const pad0 = number => `${number}`.padStart(2, `0`);
  const time2Number = ({hours, minutes, seconds}) => +[hours, minutes, seconds].map(u => pad0(u)).join(``);
  const retrieveTime = dateFragments => time2Number(dateFragments);
  const retrieveRemainingMonths = (start, end, notFull) 
    => end.month === start.month
        ? 0 : end.month > start.month && end.date > start.date
        ? end.month - start.month : end.month > start.month && end.date < start.date
        ? end.month - start.month - 1 : end.month > start.month
        ? end.month - start.month : 12 - start.month + end.month + +notFull;
  const retrieveRemainingDays = (start, end, endTimeLess)
    => start.month > end.month && endTimeLess
        ? daysInMonth(start) - start.date + end.date + endTimeLess
        : Math.abs(start.date - end.date) + endTimeLess;
  const retrieveDate4RemainingTimeCalculation = (start, end, endTimeLess) 
    => new Date( end.year, end.month, end.date - +(endTimeLess),  start.hours, start.minutes, start.seconds );

  function compositions() {
    const pipe = (...functions) => initial => functions.reduce((y, func) => func(y), initial);
    const singleOrMultiple = (numberOf, term) => (numberOf === 1 ? term.slice(0, -1) : term);
    const date2Fragments = date => ( {
      year: date.getFullYear(), month: date.getMonth(), date: date.getDate(),
      hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds(), } );
    const aggregateDiffs = ({diffs, all}) => all 
      ? Object.entries(diffs) 
      : Object.entries(diffs).filter(([, value]) => all ? value : value > 0);
    const stringifyDiffs = diffsFiltered => diffsFiltered.reduce( (acc, [key, value]) 
      => [...acc, `${value} ${singleOrMultiple(value, key)}`], [] );
    const diffs2SingleString = diffStrings 
      => `${diffStrings.slice(0, -1).join(`, `)}${
            diffStrings.length > 1 ? ` and ` : ``}${diffStrings.slice(-1).shift()}`;
    const firstDayOfNextMonth = ({year, month}) => new Date(year, month + 1, 1)
    const daysInMonth = date => new Date(date.setDate(date.getDate() - 1)).getDate();
    const sortDates = ([d1, d2]) => [d1, d2].sort( (a, b) => +a - +b);
    const dates2Fragments = ([from, to]) => [date2Fragments(from), date2Fragments(to)];
    return [
      pipe(aggregateDiffs, stringifyDiffs, diffs2SingleString), 
      pipe(firstDayOfNextMonth, daysInMonth),
      pipe(sortDates, dates2Fragments), ];
  }  

  return function(from, to) {
    const [start, end] = sortAndFragmentize([from, to]);
    const lastYearNotFull = -( end.year !== start.year && end.month < start.month );
    const lastMonthNotFull = -( end.month < start.month && end.date < start.date );
    const lastDayNotFull = -( retrieveTime(end) < retrieveTime(start) );
    const remainingTimeCalculationDate = retrieveDate4RemainingTimeCalculation(start, end, -lastDayNotFull);
    const remainingYears = end.year - start.year + lastYearNotFull;
    const remainingMonths = retrieveRemainingMonths(start, end, lastMonthNotFull);
    const lastDiffs = Math.abs(remainingTimeCalculationDate - new Date(...Object.values(end)));
    const remainingDays = retrieveRemainingDays(start, end, lastDayNotFull);
    const remainingHours = Math.abs(Math.round(lastDiffs / 3_600_000));
    const diffs = {
      years: remainingYears, months: remainingMonths, days: remainingDays,
      hours: remainingHours >= 24 ? remainingHours - 24 : remainingHours,
      minutes: Math.round(lastDiffs / 60_000) % 60,
      seconds: Math.floor(lastDiffs / 1_000) % 60,
    };
    return { ...diffs, 
      toString: () => diffsStringifier({diffs}),
      fullString: () => diffsStringifier({diffs, all: true}) };
  };
}
