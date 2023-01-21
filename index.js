export default dateDiffCalculatorFactory;

function dateDiffCalculatorFactory(forTest = false) {
  const {frags2Nr, toISO, timeValues, timeDiff} = helpers();
  const {orderAndFragmentize, stringifier, daysOfPreviousMonth} = compositions();

  return function (date1, date2) {
    const {d1, d2} = orderAndFragmentize({d1: date1, d2: date2});
    const fullYears = new Date(d1.year, d2.month, d2.date) >= new Date(d1.year, d1.month, d1.date);
    const fullMonths = d2.date >= d1.date;
    const fullDays = frags2Nr(...timeValues(d2)) - frags2Nr(...timeValues(d1)) >= 0;
    const timeDiffs = timeDiff(d1, d2);
    const diffs = {
      from: toISO(new Date(...Object.values(d1))),
      to: toISO(new Date(...Object.values(d2))),
      years: d2.year - d1.year + (fullYears ? 0 : -1),
      months: !fullYears ? (11 - d1.month) + d2.month + +(fullMonths) : d2.month - d1.month,
      days: !fullMonths
        ? (daysOfPreviousMonth(d2) - d1.date) + (fullDays ? d2.date : d2.date - 1)
        : d2.date - (fullDays ? d1.date : d1.date + 1),
      ...timeDiffs,
    };

    if (forTest) { diffs.stringify = stringifier; }

    return {
      ...diffs, toString: () => stringifier({values: diffs}),
      result: stringifier({values: diffs}),
      resultFull: stringifier({values: diffs, full: true}), };
  };
}
function helpers() {
  const pad0 = (number = 0) => `${number}`.padStart(2, `0`);
  const timeValues = frags => [frags.hours, frags.minutes, frags.seconds];
  const frags2Nr = (...frags) => +(frags.reduce( (acc, frag) => acc + pad0(frag), ``));
  const toISO = date => date.toISOString();
  const timeDiff = (d1, d2) => {
    const from = new Date(2000, 0, d2.date - 1, ...timeValues(d1));
    const to = new Date(2000, 0, d2.date, ...timeValues(d2));
    const MS = Math.abs(from - to);
    return {
      hours: Math.floor(MS/3_600_000) % 24,
      minutes: Math.floor(MS/60_000) % 60,
      seconds: Math.floor(MS/1000) % 60 }; };

  return { timeValues, timeDiff, frags2Nr, toISO, };
}

function compositions() {
  const pipe = (...functions) => initial => functions.reduce((param, func) => func(param), initial);
  const singleOrMultiple = (numberOf, term) => (numberOf === 1 ? term.slice(0, -1) : term);
  const orderDates = ({d1, d2}) => [d1, d2].sort( (a, b) => +a - +b);
  const date2Fragments = date => ( {
    year: date.getFullYear(), month: date.getMonth(), date: date.getDate(), hours: date.getHours(),
    minutes: date.getMinutes(), seconds: date.getSeconds(), milliseconds: date.getMilliseconds()} );
  const toFragments = ([start, end]) => ({d1: date2Fragments(start), d2: date2Fragments(end)});
  const filterRelevant = ({values, full}) =>
    [Object.entries(values).filter( ([key, ]) => /^(years|month|days|hours|minutes|seconds)/i.test(key)), full];
  const aggregateDiffs = ([diffs, full]) =>
    full ? diffs : diffs.filter(([, value]) => full ? +value : value > 0);
  const stringifyDiffs = diffsFiltered => diffsFiltered.reduce( (acc, [key, value])  =>
    [...acc, `${value} ${singleOrMultiple(value, key)}`], [] );
  const diffs2SingleString = diffStrings  => diffStrings.length < 1
    ? `Dates are equal` : `${diffStrings.slice(0, -1).join(`, `)}${
      diffStrings.length > 1 ? ` and ` : ``}${diffStrings.slice(-1).shift()}`;
  const firstDayOfMonth = ({month, year}) => new Date(year, month, 1);
  const nDaysOfPreviousMonth = date => new Date(date.setDate(date.getDate() - 1)).getDate();
  return {
    orderAndFragmentize: pipe(orderDates, toFragments),
    stringifier: pipe(filterRelevant, aggregateDiffs, stringifyDiffs, diffs2SingleString),
    daysOfPreviousMonth: pipe(firstDayOfMonth, nDaysOfPreviousMonth)};
}
