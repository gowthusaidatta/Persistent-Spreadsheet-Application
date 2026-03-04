function evaluateArithmeticFormula(expression) {
  if (typeof expression !== "string") {
    throw new Error("Formula must be a string");
  }

  const sanitized = expression.trim();
  if (!sanitized) {
    throw new Error("Empty formula");
  }

  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
    throw new Error("Unsupported formula");
  }

  const result = Function(`\"use strict\"; return (${sanitized});`)();
  if (typeof result !== "number" || Number.isNaN(result)) {
    throw new Error("Invalid formula result");
  }

  return result;
}

module.exports = {
  evaluateArithmeticFormula,
};
