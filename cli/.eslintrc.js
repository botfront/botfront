module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "extends": [
        "eslint:recommended"
    ],
    "settings": {
        "import/resolver": [
            {
                "node": {
                    "extensions": [".js",".jsx"]
                }
            },
        ]
    },
    "parser": "babel-eslint",
    "rules": {
        "quotes": ["error", "single"],
        "comma-dangle": ["error", {
            "objects": "always-multiline",
            "arrays": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "always-multiline",
        }],
        "indent": ["error", 4],
        "max-len": ["error", 200],
        "no-trailing-spaces": ["error", {"skipBlankLines": true}],
        "no-extra-boolean-cast": "off",
        "no-nested-ternary": "off",
        "import/prefer-default-export": "off"
    },
};