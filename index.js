export default dateDiffCalculatorFactory;

function dateDiffCalculatorFactory(forTest = false) {
  const { toISO, remainingTimeCalculator, stringifier } = helpers();

  return function (date1, date2, debug) {
    const diffs = {...remainingTimeCalculator(date1, date2, debug),
      from: toISO(new Date(date1)),
      to: toISO(new Date(date2))
    };

    if (forTest) { diffs.stringify = stringifier; }

    return {
      ...diffs,
      toString: () => stringifier({values: diffs}),
      result: stringifier({values: diffs}),
      resultFull: stringifier({values: diffs, full: true}),
    };
  };
}
function helpers() {
  const pad0 = (number = 0) => `${number}`.padStart(2, `0`);
  const timeValues = frags => [frags.hours, frags.minutes, frags.seconds];
  const frags2Nr = (...frags) => +(frags.reduce( (acc, frag) => acc + pad0(frag), ``)) || -1;
  const toISO = date => date.toISOString();
  const timeDiff = (d1, d2) => dateDiffCalc(d1 - d2);
  const dProx = dateProxyFactory();

  function dateDiffCalc(milliseconds) {
    milliseconds = Math.abs(milliseconds);
    const secsdf = Math.floor(((milliseconds / 1000) % (3600)) % 60);
    const mindf = Math.floor((milliseconds / 60_000) % 60);
    const hourdf = Math.floor(milliseconds / 3_600_000 % 24);
    const daydf = Math.floor((milliseconds / 3_600_000) / 24);
    return {
      days: daydf,
      hours: hourdf,
      minutes: mindf,
      seconds: secsdf
    };
  }

  function remainingTimeCalculator(start, end, debug) {
    const isSameDate = (d1, d2) =>
      d1.year === d2.year &&
      d1.month === d2.month &&
      d1.date === d2.date;
    [start, end] = start > end ? [dProx(end), dProx(start)] : [dProx(start), dProx(end)];
    let subtractYear = end.month < start.month || end.month === start.month && end.date < start.date;
    let years = isSameDate(start, end) ? 0 : end.year - start.year - +(subtractYear);
    let months = years !== end.year - start.year ? 12 - start.month + end.month : end.month - start.month;
    months -= +(end.date < start.date);
    subtractYear = subtractYear && years > 0 && months < 11;
    const subtractMonth = !isSameDate(start, end) && end.month <= start.month && end.date < start.date;
    const endMonth =  subtractMonth ? end.month === 1 ? 12 : end.month - 1 : end.month;
    const remainingValues = [ end.year - +subtractYear, endMonth - 1, ...start.all.slice(2)];
    let remainingStart = dProx(new Date(...remainingValues));
    debug && console.log([`---`, start.local, end.local, remainingStart.local, start.all.slice(2), `---`].join(`\n`));
    return { years, months, ...dateDiffCalc(remainingStart.dt - end.dt) };
  }

  function dateProxyFactory() {
    const props = {
      year: (d, v) => v && d.setFullYear(v) || d.getFullYear(),
      month: (d, v) => v && d.setMonth(v - 1) || d.getMonth() + 1,
      date: (d, v) => v && d.setDate(v) || d.getDate(),
      hours: (d, v) => v && d.setHours(v) || d.getHours(),
      minutes: (d, v) => v && d.setMinutes(v) || d.getMinutes(),
      seconds: (d, v) => v && d.setSeconds(v) || d.getSeconds(),
      ms: (d, v) => v && d.setMilliseconds(v) || d.getMilliseconds(),
      all: d => [
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        d.getHours(),
        d.getMinutes(),
        d.getSeconds(),
        d.getMilliseconds()],
      dt: d => d,
      local: d => d.toLocaleString()
    };
    return date => {
      const dProxy = {
        get: (obj, name) => props[name]?.(obj) ?? obj[name],
        set: ( obj, name, value) => props[name]?.(obj, value),
      };
      return new Proxy(date, dProxy);
    };
  }

  return { timeValues, timeDiff, frags2Nr, toISO, remainingTimeCalculator, stringifier: stringifyComposed()};
}

function stringifyComposed() {
  const pipe = (...functions) => initial => functions.reduce((param, func) => func(param), initial);
  const singleOrMultiple = (numberOf, term) => (numberOf === 1 ? term.slice(0, -1) : term);
  const date2Fragments = date => ( {
    year: date.getFullYear(), month: date.getMonth(), date: date.getDate(), hours: date.getHours(),
    minutes: date.getMinutes(), seconds: date.getSeconds(), milliseconds: date.getMilliseconds()} );
  const filterRelevant = ({values, full}) =>
    [Object.entries(values).filter( ([key, ]) => /^(years|month|days|hours|minutes|seconds)/i.test(key)), full];
  const aggregateDiffs = ([diffs, full]) =>
    full ? diffs : diffs.filter(([, value]) => full ? +value : value > 0);
  const stringifyDiffs = diffsFiltered => diffsFiltered.reduce( (acc, [key, value])  =>
    [...acc, `${value} ${singleOrMultiple(value, key)}`], [] );
  const diffs2SingleString = diffStrings  => diffStrings.length < 1
    ? `Dates are equal` : `${diffStrings.slice(0, -1).join(`, `)}${
      diffStrings.length > 1 ? ` and ` : ``}${diffStrings.slice(-1).shift()}`;
  return pipe(filterRelevant, aggregateDiffs, stringifyDiffs, diffs2SingleString);
}