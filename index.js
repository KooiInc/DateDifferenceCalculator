export default dateDiffCalculatorFactory;

function dateDiffCalculatorFactory(forTest = false) {
  let calcDiff = diffsFactory(forTest);

  return function(date, compare2Date) {
    const diffs = calcDiff({d1: date, d2: compare2Date});
    return {...diffs, toString: () => diffs.result};
  };
}

function diffsFactory(forTest = false) {
  const pipe = (...functions) => initial => functions.reduce((param, func) => func(param), initial);
  const singleOrMultiple = (numberOf, term) => (numberOf === 1 ? term.slice(0, -1) : term);
  const pad0 = (number = 0) => `${number}`.padStart(2, `0`);
  const date2Fragments = date => ( {
    year: date.getFullYear(), month: date.getMonth(), date: date.getDate(), hours: date.getHours(),
    minutes: date.getMinutes(), seconds: date.getSeconds(), milliseconds: date.getMilliseconds()} );
  const time2Number = ({hours = 0, minutes = 0, seconds = 0} = {}) =>
    +([hours, minutes, seconds].map( u => pad0(u)).join(``));
  const retrieveTime = frags => time2Number(frags);
  const lastYear = (d1, d2) => d2.year !== d1.year && d2.month < d1.month ? -1 : 0;
  const lastMonth = ({d1, d2}) => d2.month < d1.month && d2.date < d1.date ? -1 : 0;
  const lastDay = ({d1, d2}) => retrieveTime(d2) < retrieveTime(d1) ? -1 : 0;
  const getYears = ({d1, d2}) => (d2.year - d1.year) + (lastYear(d1, d2));
  const retrieveRemainingMonths = ({d1, d2}, notFull) => {
    return d2.month === d1.month
      ? 0 : d2.month > d1.month && d2.date > d1.date
        ? d2.month - d1.month : d2.month > d1.month && d2.date < d1.date
          ? d2.month - d1.month - 1 : d2.month > d1.month
            ? d2.month - d1.month : 12 - d1.month + d2.month + notFull;
  };
  const firstDayOfNextMonth = ({year, month}) => new Date(year, month + 1, 1);
  const daysInMonth = date => new Date(date.setDate(date.getDate() - 1)).getDate();
  const daysOfMonth = pipe(firstDayOfNextMonth, daysInMonth);
  const retrieveRemainingDays = (aggr, minusLastDay) =>
    aggr.d2.date < aggr.d1.date && aggr.d2.month !== aggr.d1.month
      ? daysOfMonth(aggr.d1) - aggr.d1.date + aggr.d2.date + minusLastDay
      : Math.abs(aggr.d2.date - aggr.d1.date + minusLastDay);
  const retrieveRemainingHours = (aggr, lastDay) =>
    Math.abs(aggr.d2.hours - aggr.d1.hours) + (lastDay * 24) + -(aggr.d2.minutes > aggr.d1.minutes);
  const filterRelevant = ({values, full}) =>
    [ Object.entries(values).filter( ([key, ]) => /^(years|month|days|hours|minutes|seconds)/i.test(key)), full ];
  const aggregateDiffs = ([diffs, full]) =>
    full ? diffs : diffs.filter(([, value]) => full ? +value : value > 0);
  const stringifyDiffs = diffsFiltered => diffsFiltered.reduce( (acc, [key, value])  =>
    [...acc, `${value} ${singleOrMultiple(value, key)}`], [] );
  const diffs2SingleString = diffStrings  => diffStrings.length < 1
    ? `Dates are equal` : `${diffStrings.slice(0, -1).join(`, `)}${
      diffStrings.length > 1 ? ` and ` : ``}${diffStrings.slice(-1).shift()}`;
  const stringifier = pipe(filterRelevant, aggregateDiffs, stringifyDiffs, diffs2SingleString);
  const sortDates = ({d1, d2}) => [d1, d2].sort( (a, b) => +a - +b);
  const dates2Fragments = ([start, end]) => ({d1: date2Fragments(start), d2: date2Fragments(end)});
  const diffMs = aggr => ({ ...aggr, diff: new Date(...Object.values(aggr.d2)) - new Date(...Object.values(aggr.d1)) });
  const years = aggr => ( {...aggr, years: getYears(aggr) } );
  const months = aggr => ({...aggr, months: retrieveRemainingMonths(aggr, lastMonth(aggr)) });
  const days = aggr => ({...aggr, days: retrieveRemainingDays(aggr, lastDay(aggr)) });
  const seconds = aggr => ({...aggr, seconds: Math.floor(aggr.diff / 1000) % 60});
  const minutes = aggr => ({...aggr, minutes: Math.floor(aggr.diff/(60_000)) % 60});
  const hours = aggr => ({...aggr, hours: Math.abs(retrieveRemainingHours(aggr, lastDay(aggr)))});
  const milliseconds = aggr => ({...aggr, milliseconds: Math.abs(aggr.d1.milliseconds - aggr.d2.milliseconds)});
  const diffsResult = aggr => ({...aggr, result: stringifier({values: aggr, full: false}) } );
  const diffsFullResult = aggr => ({...aggr, resultFull: stringifier({values: aggr, full: true}) } );
  const includeStringifierForTests = aggr => ({...aggr, stringify: stringifier});
  const functions2Pipe = [pipe(sortDates, dates2Fragments), diffMs, years, months, days, hours, minutes, seconds,
    milliseconds, diffsResult, diffsFullResult];
  forTest && functions2Pipe.push(includeStringifierForTests);

  return pipe( ...functions2Pipe );
}