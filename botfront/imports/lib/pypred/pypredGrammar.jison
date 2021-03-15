/* Sentential logic grammar in Jison-flavored Bison grammar file */

/* lexical grammar */
%lex

%%
// to do: list support (square brackets), quotes (""), floats
" and "|" AND "                  { return 'and';      }
" or "|" OR "                    { return 'or';       }
" not "|" NOT "|"not "|"NOT "    { return 'NEG';      }
" is anyof "                     { return 'anyof';    }
" != "|" is not "                { return 'NEQ'       }
" == "|" is "|" = "              { return 'EQ';       }
" contains anyof "               { return 'ctanyof';  }
" contains allof "               { return 'ctallof';  }
" contains "                     { return 'ct';       }
" >= "                           { return 'GTEQ';     }
" <= "                           { return 'LTEQ';     }
" < "                            { return 'LT';       }
" > "                            { return 'GT';       }
" matches "                      { return 'matches';  }
" \#.* "                         { return 'COMMENT';  }
// No need for these three as they will be displayed as is in Botfront.
// "null "|"null"                   { return 'NULL';     }
// "true "|"true"                   { return 'TRUE';     }
// "false "|"false"                 { return 'FALSE';    }
[0-9]+("."[0-9]+)?\b             { return 'NUMBER';   }
[\"][\S]+[\"]                    { return 'FACTOR';   }
[\']?[^\s\'{}()]+[\']?           { return 'FACTOR';   }
[{][^}]+[}]?                     { return 'COLLECTN'; }
// Botfront will take care of differentiating strings from quotes
"("                              { return '(';        }
")"                              { return ')';        }
// "{"                              { return 'LBRACKET'; }
// "}"                              { return 'RBRACKET'; }
<<EOF>>                          { return 'EOF';      }

/lex

/* operator associations and precedence */

%right 'and', 'or'
%right '!'

%% /* language grammar */

sentence
    : outerwff EOF { return $1; }
    ;

outerwff
    : wff
    ;

wff
    : atomicprop
        { $$ = $1; }
    | '(' wff ')'
        { $$ = $2; }
    | wff binaryconnector wff { $$ = {[$2]: [$1, $3]}; }
    | unaryconnector wff
        { $$ = {[$1]: $2}; }
    | '(' wff binaryconnector wff ')'
        { $$ = {[$3]: [$2, $4]}; }
    // | wff binaryconnector wff { $$ = {[$2]: [$1, Array.isArray($3) ? [].concat.apply([], $3) : $3]}; }
    ;

binaryconnector
    : and { $$ = 'and'; }
    | or { $$ = 'or'; }
    ;

unaryconnector
    : NEG    { $$ = '!'; }
    ;

atomicprop
    : factor comparator factor { $$ = {[$2]: [{'var': $1}, $3]}; }
    | factor { $$ = {'truthy': [{'var': $1}, 'truthy']}; }
    ;

// THe order matters
factor
    : COLLECTN { $$ = $1; }
    | NUMBER { $$ = $1; }
    | FACTOR { $$ = $1; }
    ;

comparator
    : EQ { $$ = '=='; }
    | GTEQ { $$ = '>='; }
    | LTEQ { $$ = '<='; }
    | NEQ { $$ = '!='; }
    | LT { $$ = '<'; }
    | GT { $$ = '>'; }
    | anyof { $$ = 'anyof'; }
    | ctanyof { $$ = 'ctanyof'; }
    | ctallof { $$ = 'ctallof'; }
    | ct { $$ = 'ct'; }
    | matches { $$ = 'matches'; }
    ;
