module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['tsconfig.json'],
        sourceType: "module"
    },
    env: {
        node: true,
        jest: true,
    },
    plugins: [
        '@typescript-eslint',
        'jest',
        'unused-imports',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:jest/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    rules: {
        "@typescript-eslint/unbound-method": [
            "error",
            {
                "ignoreStatic": true
            }
        ],
        "@typescript-eslint/no-unused-vars": [
          "warn",
            {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_"
            }
        ],
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
            "warn",
            { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
        ]
    }
}
