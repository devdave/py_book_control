module.exports = {
    extends: [
        'mantine',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        project: './tsconfig.json'
    },
    rules: {
        // indent: ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        eqeqeq: ['error', 'smart'],
        '@typescript-eslint/semi': 'off',
        '@typescript-eslint/space-before-function-paren': 'off',
        'comma-dangle': 'off',
        'jsx-quotes': ['error', 'prefer-single'],
        'max-len': ['warn', 120],
        'no-console': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-tag-spacing': [
            'error',
            {
                closingSlash: 'never',
                beforeSelfClosing: 'always',
                afterOpening: 'never',
                beforeClosing: 'never'
            }
        ],
        semi: 'off'
    }
}
