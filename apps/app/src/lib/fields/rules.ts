import type { Rule } from './Rule.js';

export const numeric = <T>(message = 'invalid'): Rule<T> => {
  return (value) => {
    const sValue = `${value}`;

    const matches = /^\d+$/.exec(sValue);
    if (!matches) {
      return message;
    }
  };
};

export const phone = <T>(message = 'invalid'): Rule<T> => {
  return (value) => {
    if (typeof value !== 'string') {
      return message;
    }

    const matches = /^[0|+]\d+$/.exec(value);
    if (!matches) {
      return message;
    }
  };
};

export const email = <T>(message = 'invalid'): Rule<T> => {
  return (value) => {
    if (typeof value !== 'string') {
      return message;
    }

    const matches = /^[\w.]+@[\w.-]+$/.exec(value);
    if (!matches) {
      return message;
    }
  };
};
