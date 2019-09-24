module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "meteor": true,
        "mocha": true,
    },
    "extends": [
        "@meteorjs/eslint-config-meteor",
        "plugin:import/react",
    ],
    "settings": {
        "import/resolver": [
            'meteor',
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
        "jsx-quotes": ["error", "prefer-single"],
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
        "import/prefer-default-export": "off",
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "react/forbid-prop-types": "off",
        "react/no-array-index-key": "off",
        "react/jsx-one-expression-per-line": "off"
    },
};