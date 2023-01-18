export const rangeCheck = (field: string, value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) {
    throw RangeError(`The value of '${field}' is out of range. It must be >= ${min}. Received ${value}`);
  }

  if (max !== undefined && value > max) {
    throw RangeError(`The value of '${field}' is out of range. It must be <= ${max}. Received ${value}`);
  }
};
