import themeModule from './modules/themeModule.mjs';
import 'monaco-editor/editor/browser/coreCommands.js';
import 'monaco-editor/editor/contrib/find/browser/findController.js';
// Shows the message of a syntax error when hovering it.
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution.js';
import * as monaco from 'monaco-editor/editor/editor.api.js';

monaco.languages.register({ id: 'tuprolog' })

monaco.languages.setMonarchTokensProvider('tuprolog', {
    // operators
    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    // escapes inside strings or chars
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4})/,

    tokenizer: {
        root: [
            // --- COMMENTS ---
            [/%.*/, 'comment'],          // Prolog-style line comment
            [/\/\/.*/, 'comment'],       // C-style single-line comment

            // --- FUNCTORS (identifier followed by '(') ---
            [/([a-z][a-zA-Z_0-9]*)\s*(?=\()/, 'type.identifier'],

			// atoms: lowercase identifiers, possibly with underscores or digits
			[/[a-z][a-zA-Z_0-9]*/, 'atom'],

            // variables: an uppercase letter or an underscore, then any identifier
            // characters. Without this rule `In` was split into an unstyled `I`
            // and an atom `n`.
            [/[A-Z_][a-zA-Z_0-9]*/, 'variable'],

            // --- WHITESPACE ---
            { include: '@whitespace' },

            // --- DELIMITERS ---
            [/[;,.]/, 'delimiter'],

            // --- STRINGS ---
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

            // --- QUOTED ATOMS ---
            // 'a', '::', 'hello world', with escapes such as '\n' or ''
            [/'([^'\\]|\\.|'')*'/, 'string'],
            // an unterminated quote
            [/'/, 'string.invalid'],

            // --- OPERATORS ---
            [/@symbols/, 'operator'],

            // --- NUMBERS ---
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/0[oO][0-7]+/, 'number.oct'],
            [/0[bB][0-1]+/, 'number.bin'],
            [/\d+/, 'number'],
        ],

        // --- STRING STATE ---
        string: [
            [/[^\\"]+/, 'string'],
            [/(@escapes)/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        // --- WHITESPACE STATE ---
        whitespace: [
            [/[ \t\r\n]+/, 'white']
        ],
    }
});


self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		return './editor.worker.bundle.js';
	}
}

// Remember to check out the CSS too!
var htmlCode = "<html><!--long linelong linelong linelong linelong linelong linelong linelong linelong linelong line-->\n<head>\n	<!-- HTML comment -->\n	<style type=\"text/css\">\n		/* CSS comment */\n	</style>\n	<script type=\"javascript\">\n		// JavaScript comment\n	</"+"script>\n</head>\n<body></body>\n</html>";

monaco.editor.defineTheme('myTheme', {
    base: 'vs',
    inherit: true,
    rules: [
		{ token: 'atom', foreground: '800000' },
		{ token: 'number', foreground: '800000' },
		{ background: 'EDF9FA' },
		{ token: 'comment', foreground: '808080' },
		{ token: 'variable', foreground: '000000' }
	],
    colors: {
        'editor.lineHighlightBackground': '#00000000',
        'editor.lineHighlightBorder': '#00000000',
        'editor.overviewRulerLanes': '#00000000'
    },
});

// The same colours, lightened to read on a dark background: atoms and
// numbers in a soft red, variables in the text colour.
monaco.editor.defineTheme('myThemeDark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
		{ token: 'atom', foreground: 'F08C7A' },
		{ token: 'number', foreground: 'F08C7A' },
		{ token: 'comment', foreground: '8B9096' },
		{ token: 'variable', foreground: 'E3E5E8' }
	],
    colors: {
        'editor.background': '#1F2125',
        'editor.lineHighlightBackground': '#00000000',
        'editor.lineHighlightBorder': '#00000000',
        'editor.overviewRulerLanes': '#00000000'
    },
});

const editorTheme = theme => theme === 'dark' ? 'myThemeDark' : 'myTheme';
monaco.editor.setTheme(editorTheme(themeModule.current()));
themeModule.onChange(theme => monaco.editor.setTheme(editorTheme(theme)));


export { monaco }
