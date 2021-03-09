// Use this file to compile a new parser for pypred

const { Parser } = require('jison');
const fs = require('fs');
const ebnfParser = require('ebnf-parser');

const grammar = fs.readFileSync('/Users/matthieu.joannon/code/dialogue/botfront/botfront/imports/api/graphql/project/pypredGrammar.jison', 'utf8');
// console.log(grammar);
let compiled = null;
try {
    compiled = JSON.parse(grammar);
} catch (e) {
    compiled = ebnfParser.parse(grammar);
}

const parserFile = new Parser(compiled).generate();

fs.writeFileSync('/Users/matthieu.joannon/code/dialogue/botfront/botfront/imports/api/graphql/project/pypred.parser.js', parserFile);
