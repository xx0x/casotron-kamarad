module.exports = {
    root: true,                 // Make sure eslint picks up the config at the root of the directory
    parserOptions: {
        ecmaVersion: 2020,      // Use the latest ecmascript standard
        sourceType: 'module',   // Allows using import/export statements
        ecmaFeatures: {
            jsx: true           // Enable JSX since we're using React
        }
    },
    settings: {
        react: {
            version: 'detect'   // Automatically detect the react version
        }
    },
    env: {
        browser: true,          // Enables browser globals like window and document
        amd: true,              // Enables require() and define() as global variables as per the amd spec.
        node: true              // Enables Node.js global variables and Node.js scoping.
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'airbnb',
        'airbnb/hooks'
    ],
    rules: {
        'no-irregular-whitespace': 0,
        'prefer-destructuring': 0,
        'react/destructuring-assignment': 0,
        'padded-blocks': 0,
        'linebreak-style': 0,
        'react/no-unused-state': [1],
        'no-multi-spaces': 0,
        'indent': 0,
        'comma-dangle': 0,
        'max-len': 0,
        'no-trailing-spaces': 0,
        'react/jsx-indent': 0,
        'import/prefer-default-export': 0,
        'react/jsx-props-no-spreading': 0,
        'quote-props': ['error', 'consistent-as-needed'],
        'react/prop-types': [1, { skipUndeclared: true }],
        'no-unused-vars': [
            'warn'
        ],
        'operator-linebreak': [0],
        'react/jsx-wrap-multilines': [0],
        'react/jsx-curly-newline': [0],
        'react/jsx-one-expression-per-line': [0],
        'react/no-array-index-key': [0],
        'react/react-in-jsx-scope': 'off',
        'jsx-a11y/media-has-caption': [0],
        'jsx-a11y/anchor-is-valid': [
            'error',
            {
                components: ['Link'],
                specialLink: ['hrefLeft', 'hrefRight'],
                aspects: ['invalidHref', 'preferButton']
            }
        ],
        'react/jsx-indent-props': [
            'error',
            4
        ],
        'react/jsx-filename-extension': [
            1,
            {
                extensions: [
                    '.js',
                    '.jsx'
                ]
            }
        ],
        'eol-last': 0
    }
};