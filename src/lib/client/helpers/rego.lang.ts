import type {MountFN} from "$lib/client/components/form/inputs/MonacoEditor.svelte";

export default (({Monaco}) => {
    Monaco.languages.register({ id: 'rego' });

    Monaco.languages.setMonarchTokensProvider('rego', {
        // Define Rego keywords
        keywords: [
            'package', 'import', 'default', 'else', 'with', 'as',
            'not', 'some', 'in', 'true', 'false', 'null', 'if', 'allow'
        ],

        // Rego built-in functions (non-exhaustive, for highlighting)
        builtinFunctions: [
            'abs', 'ceil', 'floor', 'round', 'sqrt', 'pow',
            'count', 'sum', 'max', 'min', 'sort', 'concat',
            'sprintf', 'regex.match', 'net.cidr_contains'
            // Add more as needed
        ],

        // Operators
        operators: [
            '+', '-', '*', '/', '%',
            '<', '<=', '>', '>=', '==', '!=',
            'and', 'or'
        ],

        // Symbols
        symbols: /[=><!~?:&|+\-*\/\^%]+/,

        // Tokenizer
        tokenizer: {
            root: [
                // Whitespace
                [/[ \t\r\n]+/, ''],

                // Comments
                [/\/\/.*$/, 'comment'],
                [/\/\*[\s\S]*?\*\//, 'comment'],

                // Strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'], // Unclosed string
                [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

                // Numbers
                [/[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/, 'number'],

                // Keywords & built-ins
                [
                    /[a-zA-Z_][\w]*/,
                    {
                        cases: {
                            '@keywords': 'keyword',
                            '@builtinFunctions': 'predefined',
                            '@default': 'identifier'
                        }
                    }
                ],

                // Operators
                [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],

                // Brackets
                [/[\{\[\(\)\]\}]/, '@brackets']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
                [/\\./, 'string.escape']
            ]
        }
    });

// Optional: Set default theme colors (if needed)
    Monaco.editor.defineTheme('rego-theme', {
        colors: {},
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: '0000FF' },
            { token: 'predefined', foreground: '008080' },
            { token: 'string', foreground: 'A31515' },
            { token: 'comment', foreground: '008000', fontStyle: 'italic' },
            { token: 'number', foreground: '098658' }
        ]
    });

// Optional: Disable diagnostics/linting
    Monaco.languages.register({ id: 'rego' });
}) as MountFN
