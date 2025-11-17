import 'monaco-editor/esm/vs/editor/browser/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/browser/findController.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

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

            // --- WHITESPACE ---
            { include: '@whitespace' },

            // --- DELIMITERS ---
            [/[;,.]/, 'delimiter'],

            // --- STRINGS ---
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

            // --- CHARACTER LITERALS ---
            // normal char: 'a'
            [/'[^\\']'/, 'string'],
            // escaped char: '\n'
            [/'(@escapes)'/, ['string', 'string.escape', 'string']],
            // everything else starting with '
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
		{ token: 'comment', foreground: '808080' } 
	],
    colors: {
        'editor.lineHighlightBackground': '#00000000',
        'editor.lineHighlightBorder': '#00000000',
        'editor.overviewRulerLanes': '#00000000'
    },
});

monaco.editor.setTheme('myTheme');


export { monaco }
