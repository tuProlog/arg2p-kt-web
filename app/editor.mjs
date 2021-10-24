import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

monaco.languages.register({ id: 'tuprolog' })

monaco.languages.setMonarchTokensProvider('tuprolog', {

	symbols: /[=><!~?:&|+\-*\/\^%]+/,

	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

	tokenizer: {
		root: [
			// functors
			[/([a-z][a-zA-Z_0-9]*)\s*(?=\()/, 'type.identifier'],

			// whitespace
			{ include: '@whitespace' },

			// // delimiters and operators
			// [/[{}()\[\]]/, '@brackets'],
			// [/((?!\/\*)[+*\/^<>=~:.?@#$&\\-]+)|!|;|,|rem|mod|is/, 'type.operators'],

			// // numbers
			// [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
			// [/0[xX][0-9a-fA-F]+/, 'number.hex'],
			// [/0[oO][0-7]+/, 'number.oct'],
			// [/0[bB][0-1]+/, 'number.bin'],
			// [/\d+/, 'number'],

			[/[;,.]/, 'delimiter'],

			// strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

			// characters
			[/'[^\\']'/, 'string'],
			[/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
			[/'/, 'string.invalid']
		],

		comment: [
			[/[^\/*]+/, 'comment'],
			[/[\/*]/, 'comment'],
			[/\/\/.*$/, 'comment'],
			[/%.*$/, 'comment']
		],

		string: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
		],

		whitespace: [
			[/[ \t\r\n]+/, 'white'],
		]
	},
})

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
    rules: [{ background: 'EDF9FA' }],
    colors: {
        'editor.lineHighlightBackground': '#00000000',
        'editor.lineHighlightBorder': '#00000000',
        'editor.overviewRulerLanes': '#00000000'
    },
});

monaco.editor.setTheme('myTheme');


export { monaco }
