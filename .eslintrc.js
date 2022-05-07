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
        'jest'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:jest/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    "rules": {
        "@typescript-eslint/unbound-method": [
            "error",
            {
                "ignoreStatic": true
            }
        ]
    }
}
