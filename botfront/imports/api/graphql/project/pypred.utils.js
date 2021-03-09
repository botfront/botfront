const { parser } = require('./pypred.parser');

const compiledParser = parser;
// const result = compiledParser.parse('matthieu is not test and philippe is fds');
// console.log({ result });

export const parsePypred = predicate => compiledParser.parse(predicate);
