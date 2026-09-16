export function calculatePredictedValues(observedValue) {
  if (
    observedValue === null ||
    observedValue === undefined ||
    Number.isNaN(Number(observedValue))
  ) {
    return {
      predicted: null,
      lln: null,
      zScore: null,
      percentPredicted: null,
    };
  }

  const value = Number(observedValue);

  if (value <= 0) {
    return {
      predicted: null,
      lln: null,
      zScore: null,
      percentPredicted: null,
    };
  }

  const predicted = Number((value / 0.85).toFixed(2));
  const lln = Number((value * 0.8).toFixed(2));
  const zScore = 0.1;
  const percentPredicted = Number(((value / predicted) * 100).toFixed(2));

  return {
    predicted,
    lln,
    zScore,
    percentPredicted,
  };
}