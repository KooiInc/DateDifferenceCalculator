# DateDifferenceCalculator
Calculate the time passed in years, months, days, hours etc. for a date compared to a later or earlier date.

The exported `dateDiffCalculatorFactory` (from `index.js`) returns a function to calculate the time between two dates.

The function returns the time passed in years, months, days, hours etc. for a date compared to another date.
For example, the time from now until next new year:

```js
/*
 * import dateDiffCalculatorFactory from [location of index.js];
 * location @github: "https://kooiinc.github.io/DateDifferenceCalculator/index.js"
 */
const diffCalc = dateDiffCalculatorFactory();
const now = new Date();
const newYear = new Date(now.getFullYear(), 11, 31);
const TimeToNewYear = diffCalc(now, newYear);
```

**Note**: the `diffCalc` parameter order is not relevant.

The return value is an `Object` with the calculated difference values (`{years, months, days, hours, minutes, seconds}`).

To display the difference as a string, the default `toString` of the returned object displays all values > 0

```js
const now = new Date();
const then = new Date(new Date(now).setFullYear(now.getFullYear() + 1));
const diff = diffCalc(now, then);
console.log(`${diff}`) //=> "1 year";
```

To include zero values from the difference in a string, use `[returned value].fullString()`

```js
const now = new Date();
const then = new Date(new Date(now).setFullYear(now.getFullYear() + 1));
const diff = diffCalc(now, then);
console.log(`${diff.fullString()}`) //=> "1 year, 0 months, 0 days, 0 hours, 0 minutes and 0 seconds";
```

Tests and example can be found [here](https://kooiinc.github.io/DateDifferenceCalculator/ExamplesAndTests/).
