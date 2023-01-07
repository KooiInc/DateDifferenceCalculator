const { print } = printFactory();
const xDFactory = (await import(`https://kooiinc.github.io/datefiddler/datefiddler.js`)).default;
import dateDiffCalculatorFactory from "../index.js";
const diffCalc = dateDiffCalculatorFactory();
printHeader();
runTests();

function runTests() {
  const xDate = xDFactory();
  const tls = (d) => d.toLocaleString(`en-GB`);
  const compare = (diffs, y = 0, mo = 0, d = 0, h = 0, mi = 0, s = 0 ) => {
    return (
      diffs.years === y && diffs.months === mo &&
      diffs.days === d &&  diffs.hours === h &&
      diffs.minutes === mi && diffs.seconds === s );
  };
  const single = (n, term) => (n === 1 ? term.slice(0, -1) : term);
  const stringify = (diffs) => {
    const filtered = Object.entries(diffs).reduce( (acc, [key, value]) => (value > 0 ? { ...acc, [key]: value } : acc), {} );
    const strings = Object.entries(filtered).reduce( (acc, [key, value]) => [...acc, `${value} ${single(value, key)}`], [] );
    return `${strings.slice(0, -1).join(`, `)}${strings.length > 1 ? ` and ` : ``}${strings.slice(-1).shift()}`;
  };
  const getExpected = (diffs, diffsTst) =>
    stringify( Object.keys(diffs)
        .slice(0, -1) .reduce((acc, k, i) => ({ ...acc, [k]: diffsTst[i] || 0 }), {} ) );

  const testFactory = function (start, end, testNr = 0, ...diffsTst) {
    return {
      get result() {
        const diffs = diffCalc(start, end);
        const se = `<br>from: ${tls(end > start ? start : end)} to: ${tls(end > start ? end : start)}<br>`;
        const expRec = `&nbsp;&nbsp;=> Expected: ${getExpected(diffs, diffsTst)}<br>&nbsp;&nbsp;=> Received:  ${stringify(diffs)}`;
        const compared = compare(diffs, ...diffsTst);
        return compared
          ? `<span class="ok">${testNr ? ` <b>Test #${testNr}</b>` : `` } OK</span>${se}${expRec}`
          : `<span class="NOTok">${testNr ? ` <b>Test #${testNr}</b>` : `` } NOT OK!</span>${se}${expRec}`;
      },
    };
  };

  [
    () => {
      const start = xDate(new Date());
      const end = start.clone().add(`1 year`);
      return testFactory(...[start.date, end.date, `1`, 1]); },
    () => {
      const start = xDate();
      const end =  start.clone().add("1 year, 1 month");
      return testFactory(...[start.date, end.date, `2`, 1, 1]); },
    () => {
      const start = xDate(new Date());
      const end = start.clone().add("1 year, 1 month, 1 day");
      return testFactory(start.date, end.date, `3`, 1, 1, 1); },
    () => {
      const start = xDate(new Date());
      const end = start.clone().add("1 year, -1 month, 1 day, 5 hours");
      return testFactory(start.date, end.date, `4`, 0, 11, 1, 5); },
    () => {
      const start = xDate(new Date());
      const end = start.clone().add("4 years, -4 month, -23 days, -4 hours");
      return testFactory(start.date, end.date, `5`, 3, 7, 7, 20); },
    () => {
      const start = xDate(new Date());
      const end = start.clone().add("4 years, -4 month, -23 days, -4 hours, -25 minutes");
      return testFactory(start.date, end.date, `6`, 3, 7, 7, 20, 35); },
    () => {
      const start = xDate(new Date());
      const end = start.clone().add("4 years, -4 month, -23 days, -4 hours, -25 minutes, 130 seconds");
      return testFactory(start.date, end.date, `7`, 3, 7, 7, 20, 37, 10); },
    () => {
      const start = xDate(new Date(1957, 2, 18, 13, 0, 0));
      const end = start.clone().add(`65 years, 9 months, 13 days, 22 hours, 14 minutes, 12 seconds`);
      return testFactory(start.date, end.date, `8`, 65, 9, 13, 22, 14, 12); },
    () => {
      const start = xDate(new Date(1957, 2, 18, 13, 0, 0), (d) => d.toLocaleString(`nl`) );
      const end = start.clone().set(new Date(2023, 1, 19, 15, 0, 0));
      return testFactory(start.date, end.date, `9`, 65, 11, 1, 2); },
    () => {
      const start = xDate(new Date(1933, 1, 5), tls);
      const end = start.clone().set(new Date(2023, 0, 3));
      return testFactory(start.date, end.date, `10`, 89, 10, 2); },
    () => {
      const start = xDate(new Date(2023, 2, 1), (d) => d.toTimeString());
      const end = start.clone().set(new Date(2023, 3, 20));
      return testFactory(start.date, end.date, `11`, 0, 1, 19); },
    () => {
      const start = xDate(new Date(2023, 2, 20), (d) => d.toTimeString());
      const end = start.clone().set(new Date(2023, 8, 5));
      return testFactory(start.date, end.date, `12`, 0, 5, 15); },
    () => {
        const start = xDate(new Date(2023, 0, 3));
        const end = start.clone().add("11 months", "28 days", "-5 hours");
        return testFactory(start.date, end.date, 13, 0, 11, 27, 19); },
    () => {
      const start = xDate(new Date());
      const end = start.clone().add("5 hours");
      return testFactory(start.date, end.date, 14, 0, 0, 0, 5); },
    () => {
      const start = xDate(new Date());
      const end = start.clone().add("-13 hours");
      return testFactory(start.date, end.date, 15, 0, 0, 0, 13); },
  ].forEach((test) => print(test().result));
}

function printFactory() {
  const ul = document.body.insertAdjacentElement( `beforeend`, document.createElement(`ul`) );
  const maybeHead = t => `${t}`.startsWith(`!!`) ? ` class="head"` : ``;
  const logItem = function (top) {
    return function (line) {
      line = line instanceof Object ? `<pre>${JSON.stringify(line, null, 2)}</pre>` : line;
      ul.insertAdjacentHTML( top ? `afterbegin` : `beforeend`, `<li${maybeHead(line)}>${`${line}`.replace(/^!!/, ``)}</li>` );
    };
  };

  return { print: (...txt) => txt.forEach(logItem()), };
}

function printHeader() {
  let to;
  const code = `
    <pre>
      const diffCalc = dateDiffCalculatorFactory();
      const now = new Date();
      const newYear = new Date(2023, 11, 31);
      const TimeToNewYear = diffCalc(now, newYear);
    </pre>`.replace(/\n\s+/g, `\n`);

    print(
      `!!
      <div class="explain">
        <h2>Tests for time between two dates calculation</h2>
        <div class="first"><code>dateDiffCalculatorFactory</code> returns a function 
        to calculate the time between two dates. 
        <div>The function returns the time passed in years, months, days, hours etc. 
        for a date compared to a later or earlier date.</div>
        <div>For example, the time from now until next new year:
          ${code}
          <span class="comment">&nbsp;&nbsp;&nbsp;&nbsp;// Note: parameter order is not relevant ;)</span>
          <div>
            <div>So, until new year (midnight of the last day of the current year):</div>
            <span id="showNwYear"></span>
          </div>
          </div>
        <div>In the following: tests for a number of date pairs.</div>
      </div>`);

  showTime2NewYear();

  function showTime2NewYear() {
    clearTimeout(to);
    showTime2NewYear.el = showTime2NewYear.el || document.querySelector(`#showNwYear`);
    const now = new Date();
    const newYear = new Date(2023, 11, 31);
    showTime2NewYear.el.innerHTML = `<b>${diffCalc(now, newYear).fullString()}</b>`;
    to = setTimeout(showTime2NewYear, 1000);
  }
}
