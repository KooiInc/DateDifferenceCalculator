# DateDifferenceCalculator
Calculate the time passed in years, months, days, hours etc. for a date compared to a later or earlier date.

`dateDiffCalculatorFactory` returns a function to calculate the time between two dates.

The function returns the time passed in years, months, days, hours etc. for a date compared to a later or earlier date.
For example, the time from now until next new year:

```js
// import dateDiffCalculatorFactory from [location of index.js]
const diffCalc = dateDiffCalculatorFactory();
const now = new Date();
const newYear = new Date(now.getFullYear(), 11, 31);
const TimeToNewYear = diffCalc(now, newYear);
// Note: parameter order is not relevant ;)
```    
