const { print } = printFactory();
const xDFactory = (await import(`https://kooiinc.github.io/datefiddler/datefiddler.js`)).default;
const libLocation = location.host.startsWith(`dev.kooi`) ? "/ddcLib/index.js" : "../index.js";
const dateDiffCalculatorFactory = (await import(libLocation)).default;
const diffCalc = dateDiffCalculatorFactory();
printHeader();
runTests();

function runTests() {
  const stringify = mimicStringifier();
  const xDate = xDFactory();
  const tls = (d) => d.toLocaleString(`en-GB`);
  const compare = (diffs, y = 0, mo = 0, d = 0, h = 0, mi = 0, s = 0 ) => {
    return (
      diffs.years === y && diffs.months === mo &&
      diffs.days === d &&  diffs.hours === h &&
      diffs.minutes === mi && diffs.seconds === s );
  };

  const getExpected = (diffs, diffsTst, all) => {
    const diffsTstObj = Object.keys(diffs).reduce( (acc, k, i) =>
      !/string/i.test(k) && {...acc, [k]: diffsTst[i]} || acc, {} );
    return stringify({diffs: diffsTstObj, all});
  }

  const testFactory = function(start, end, testNr = 0, ...diffsTst) {
    const allZeros = diffsTst.length && diffsTst.reduce( (acc, v) => acc + v, 0) === 0;
    return {
      get result() {
        const diffs = diffCalc(start, end);
        const se = `<br>from: ${tls(end > start ? start : end)} to: ${tls(end > start ? end : start)}<br>`;
        const expRec = `&nbsp;&nbsp;=> Expected: ${getExpected(diffs, diffsTst, allZeros)}
            <br>&nbsp;&nbsp;=> Received:  ${allZeros ? diffs.fullString() : diffs}`;
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
      const start = xDate(new Date(1991, 7, 27, 12, 30), tls);
      const end = start.clone().set(new Date(2023, 0, 1));
      return testFactory(start.date, end.date, `10`, 31, 4, 4, 12, 30); },
    () => {
      const start = xDate(new Date(1994, 10, 5, 1, 30), (d) => d.toTimeString());
      const end = start.clone().set(new Date(2023, 0, 1));
      return testFactory(start.date, end.date, `11`, 28, 1, 25, 23, 30); },
    () => {
      const start = xDate(new Date(1997, 3, 27, 2), (d) => d.toTimeString());
      const end = start.clone().set(new Date(2023, 0, 1));
      return testFactory(start.date, end.date, `12`, 25, 8, 3, 22); },
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
    () => {
      const start = xDate(new Date());
      const end = start.clone();
      return testFactory(start.date, end.date, `16 (toString equal dates)`); },
    () => {
      const start = xDate(new Date());
      const end = start.clone();
      return testFactory(start.date, end.date, `17 (fullString equal dates)`, 0, 0, 0, 0, 0, 0); },
  ].forEach((test) => print(test().result));
}

function mimicStringifier() {
  const pipe = (...functions) => initial => functions.reduce((y, func) => func(y), initial);
  const single = (n, term) => (n === 1 ? term.slice(0, -1) : term);
  const aggregateDiffs = ({diffs, all}) => all
    ? Object.entries(diffs)
    : Object.entries(diffs).filter(([, value]) => all ? value : value > 0);
  const stringifyDiffs = diffsFiltered => diffsFiltered.reduce( (acc, [key, value])  =>
    [...acc, `${value} ${single(value, key)}`], [] );
  const diffs2SingleString = diffStrings  => diffStrings.length < 1
    ? `Dates are equal` : `${diffStrings.slice(0, -1).join(`, `)}${
      diffStrings.length > 1 ? ` and ` : ``}${diffStrings.slice(-1).shift()}`;
  return pipe(aggregateDiffs, stringifyDiffs, diffs2SingleString)
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
  const example = `<pre class="language-javascript line-numbers"><code class="js">// import & initialize
const ddFactory = (await import(\`//kooiinc.github.io/DateDifferenceCalculator/index.js\`)).default;
const diffCalc = ddFactory();

function displayTime2NewYear() {
  let to = 0;
  const newYear = new Date(2023, 11, 31);
  const nwYearElem = document.querySelector(\`#showNwYear\`);
  const run = () =>  {
      clearTimeout(to);
      nwYearElem.innerHTML = \`&lt;b>\${diffCalc(new Date(), newYear).fullString()}&lt;/b>\`;
      to = setTimeout(run, 1000);
  };
  run();
}</code></pre>`;
  print(
    `!!
    <div class="explain">
      <h2>Tests for time between two dates calculation</h2>
      <div class="first"><code>dateDiffCalculatorFactory</code> returns a function 
      to calculate the time between two dates. 
      <div>The function returns the time passed in years, months, days, hours etc. 
      for a date compared to a later or earlier date.</div>
      <div>For example, the time from now until next new year in a function:
        ${example}
        <div>
          <div>So, until new year (midnight of the last day of the current year):</div>
          <span id="showNwYear"></span>
        </div>
        </div>
      <div>In the following: tests for a number of date pairs.</div>
    </div>`);
  Prism.highlightElement(document.querySelector(`pre.language-javascript code`));
  displayTime2NewYear();

  function displayTime2NewYear() {
    let to = 0;
    const newYear = new Date(2023, 11, 31);
    const nwYearElem = document.querySelector(`#showNwYear`);
    const run = () =>  {
      clearTimeout(to);
      nwYearElem.innerHTML = `<b>${diffCalc(new Date(), newYear).fullString()}</b>`;
      to = setTimeout(run, 1000);
    };
    run();
  }
}
