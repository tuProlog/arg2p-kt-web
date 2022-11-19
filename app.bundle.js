(()=>{var e,n={3874:e=>{function n(e){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}n.keys=()=>[],n.resolve=n,n.id=3874,e.exports=n},6555:(e,n,r)=>{var t=r(8931).it.unibo.tuprolog.core,o=r(5751).it.unibo.tuprolog.solve,i=r(7428).it.unibo.tuprolog.solve.classic,a=r(4135).it.unibo.tuprolog.theory;t.parsing=r(8879).it.unibo.tuprolog.core.parsing,a.parsing=r(441).it.unibo.tuprolog.theory.parsing;var u=r(4889).it.unibo.tuprolog.argumentation.core,l={core:t,theory:a,solve:o,classic:i,arg2p:u.Arg2pSolver.Companion,mining:u.mining.mineGraph};e.exports={tuprolog:l}},1129:(e,n,r)=>{"use strict";r.d(n,{Z:()=>u});var t=r(8081),o=r.n(t),i=r(3645),a=r.n(i)()(o());a.push([e.id,"html {\n  height: 100vh;\n  padding: 0;\n}\n\nbody {\n  font-family: Roboto;\n  overflow: hidden;\n  height: 100vh;\n  padding: 5vh;\n}\n\n#theory, #query {\n  width : 100%;\n  border-radius: 10px;\n  white-space: pre-wrap;\n  flex-grow: 1;\n}\n\n#inputFile {\n  margin: 10px 0;\n}\n\n/***************\n* SOLUTION TAB\n***************/\n.solutionResultWrapper{\n  border: 1px solid #EEE;\n  border-radius: 5px;\n  padding: 5px;\n  flex: 1 0 33%;\n}\n\n.solutionResultWrapper button {\n  margin: 10px;\n}\n\n#solutions .solutionResultWrapper li.halt{\n  background-color: rgba(255, 0, 0, 0.2);\n}\n\n#solutions .solutionResultWrapper li.no{\n  background-color: rgba(255, 255, 0, 0.2);\n}\n\n#solutions li:nth-child(odd){\n  background-color: #EEE;\n}\n\n.output{\n  display: flex;\n  flex-direction: column-reverse;\n  font-size: 14px;\n}\n\n/***************\n* GRAPH TAB\n***************/\n\n.graph-container {\n  height:100%;\n  width: 100%;\n  position: relative;\n}\n\n.graph-drawing, .graph-text {\n  height:100%;\n  width: 100%;\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n\n.graph-text {\n  z-index: 10;\n  pointer-events: none;\n  justify-content: flex-start; \n  padding: 10px;\n}\n\n.overlay {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(134, 136, 138, 0.3);\n  z-index: 2000;\n}\n\na {\n  color: black;\n}\n",""]);const u=a},3654:()=>{},649:(e,n,r)=>{"use strict";var t=r(3379),o=r.n(t),i=r(7795),a=r.n(i),u=r(569),l=r.n(u),s=r(3565),c=r.n(s),d=r(9216),p=r.n(d),g=r(4589),f=r.n(g),v=r(1129),m={};m.styleTagTransform=f(),m.setAttributes=c(),m.insert=l().bind(null,"head"),m.domAPI=a(),m.insertStyleElement=p(),o()(v.Z,m),v.Z&&v.Z.locals&&v.Z.locals,r(3923),r(9166);var h=r(5852);h.Mj.register({id:"tuprolog"}),h.Mj.setMonarchTokensProvider("tuprolog",{symbols:/[=><!~?:&|+\-*\/\^%]+/,escapes:/\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,tokenizer:{root:[[/([a-z][a-zA-Z_0-9]*)\s*(?=\()/,"type.identifier"],{include:"@whitespace"},[/[;,.]/,"delimiter"],[/"([^"\\]|\\.)*$/,"string.invalid"],[/"/,{token:"string.quote",bracket:"@open",next:"@string"}],[/'[^\\']'/,"string"],[/(')(@escapes)(')/,["string","string.escape","string"]],[/'/,"string.invalid"]],comment:[[/[^\/*]+/,"comment"],[/[\/*]/,"comment"],[/\/\/.*$/,"comment"],[/%.*$/,"comment"]],string:[[/[^\\"]+/,"string"],[/@escapes/,"string.escape"],[/\\./,"string.escape.invalid"],[/"/,{token:"string.quote",bracket:"@close",next:"@pop"}]],whitespace:[[/[ \t\r\n]+/,"white"]]}}),self.MonacoEnvironment={getWorkerUrl:function(e,n){return"./editor.worker.bundle.js"}},h.j6.defineTheme("myTheme",{base:"vs",inherit:!0,rules:[{background:"EDF9FA"}],colors:{"editor.lineHighlightBackground":"#00000000","editor.lineHighlightBorder":"#00000000","editor.overviewRulerLanes":"#00000000"}}),h.j6.setTheme("myTheme");var y=r(6555);const b=function(){var e=y.tuprolog.arg2p.default_gdqvf0$(),n=y.tuprolog.classic.ClassicSolverFactory,r=y.tuprolog.solve.channel.OutputChannel;function t(e,n){try{return e()}catch(e){throw{name:n,message:o(e)}}}function o(e){var n="";return n+=e.name?"".concat(e.name,"\n"):"",(n+=e.message?"".concat(e.message,"\n"):"")+(e.line?"at line ".concat(e.line):"")}return{solve:function(o,i,a,u){if(/^\s*$/.test(i))throw{name:"Query error",message:"Query is a mandatory field."};var l=function(t,o){var i=y.tuprolog.theory.parsing.parseTheory("?",o),a=y.tuprolog.solve.library.Library.Companion.of("argumentation.flags",void 0,i);return n.mutableSolverWithDefaultBuiltinsAnd(n.defaultRuntime.plusRuntime(e.to2pLibraries().plusLibrary(a)),n.defaultFlags,y.tuprolog.theory.Theory.Companion.empty(),n.defaultDynamicKb,n.defaultInputChannel,r.Companion.of(t),r.Companion.of((function(e){})),r.Companion.of((function(e){})))}(u,a),s=t((function(){return y.tuprolog.core.parsing.parseStringAsStructWithOperators(i,l.operators)}),"Query Error"),c=t((function(){return y.tuprolog.theory.parsing.parseTheoryWithOperators("?",o,l.operators)}),"Theory Error");return l.loadStaticKb(c),{i:t((function(){return l.solve(s)}),"Solve Error").iterator(),query:s,solver:l}}}}(),x=function(){var e,n=y.tuprolog.core.TermFormatter.Companion,r=function(){return n.prettyExpressionsPrettyVariablesDefaultOperators()},t=1;function o(n,o,a,u){var l=document.createElement("div");l.className="solutionResultWrapper";var s=document.createElement("ul"),c=document.createElement("button");c.innerText="Next",c.addEventListener("click",(function(){return i(n,s,c,a,u)}));var d=document.createElement("button");d.innerText="X",d.addEventListener("click",(function(){return l.remove()}));var p=document.createElement("span");return p.innerText="".concat(t," - ").concat(r().format(o)),l.appendChild(p),l.appendChild(c),l.appendChild(d),l.appendChild(s),e.appendChild(l),t++,i(n,s,c,a,u),s}function i(e,n,t,o,i){e.hasNext()&&(o(),new Promise((function(t,o){setTimeout((function(){var o,i,a;o=e.next(),i=n,a=document.createElement("li"),o.isYes?a=function(e){var n=document.createElement("li");if(n.innerText=r().format(e.solvedQuery),!e.substitution.isEmpty()){var t=document.createElement("ul"),o=e.substitution.entries.toJSON().reduce((function(e,n){var t=document.createElement("li");return t.innerText="".concat(r().format(n.key)," : ").concat(r().format(n.value)),e.appendChild(t),e}),t);n.appendChild(o)}return n}(o):o.isNo?a.innerText="No":a.innerText="Halt : "+o.exception.toString(),i.appendChild(a),t()}),0)})).finally((function(){return i()}))),t.disabled=!e.hasNext()}return{init:function(n){var r=document.createElement("div");return r.classList.add("output"),n.appendChild(r),e=r,{printSolution:o}}}}(),w=function(){var e;function n(){return function(n){var r=n.replace(/\n/g,"<br/>");e.innerHTML=e.innerHTML+r}}function r(){e.innerHTML=""}return{init:function(t){return e=t,{outputConsumer:n,clear:r}}}}();var T=r(5601);const S=function(){function e(e,n){!function(e){var n,r=y.tuprolog.core.parsing.parseStringAsStructWithOperators("context_active(X)",e.operators),t=y.tuprolog.core.TermFormatter.Companion.prettyExpressionsPrettyVariablesDefaultOperators(),o=parseInt(t.format(e.solve(r).iterator().next().substitution.entries.toJSON()[0].value)),i=y.tuprolog.mining(e,o),a=E(i.labellings.iterator());n=a,document.querySelector("#graph-theory").innerHTML=n.reduce((function(e,n){return e+'<div style="font-weight:bold; overflow:hidden;">'+n.argument.descriptor+"</div>"}),""),function(e,n){function r(e){return parseInt(e.substring(1))}function t(e){switch(e){case"in":return"#00ff00";case"out":return"#ff0000";case"und":return"#808080"}}new T.Zc(document.querySelector("#graph-visual"),{nodes:new T.qg(e.map((function(e){return{id:r(e.argument.identifier),label:e.argument.identifier,color:t(e.label)}}))),edges:new T.qg(n.map((function(e){return{from:r(e.attacker.identifier),to:r(e.target.identifier),arrows:"to"}})))},{}).fit()}(a,E(i.attacks.iterator()))}(n)}function n(){document.querySelector("#graph-theory").innerHTML="",document.querySelector("#graph-visual").innerHTML=""}return{init:function(r){return function(e){e.innerHTML='\n            <div class="graph-container">\n                <div id="graph-theory" class="graph-text"></div>\n                <div id="graph-visual" class="graph-drawing"></div>\n            </div>\n        '}(r),{printGraph:e,clear:n}}}}();function E(e){for(var n=[];e.hasNext();)n.push(e.next());return n}const C=function(){var e;function n(){return e.getValue()}return{init:function(r){return function(n){e=h.j6.create(n,{value:["graphBuildMode(standard_af).","statementLabellingMode(statement).","argumentLabellingMode(grounded_hash).","orderingPrinciple(last).","orderingComparator(elitist).","graphExtension(standardPref).","queryMode."].join("\n"),language:"tuprolog",scrollbar:{vertical:"hidden",horizontal:"hidden"},minimap:{enabled:!1},overviewRulerBorder:!1,overviewRulerLanes:0,hideCursorInOverviewRuler:!0,automaticLayout:!0})}(r),{flags:n}}}}();var O,k,L=document.querySelector("#theory"),q=document.querySelector("#query"),R=document.querySelector("#solutions"),j=document.querySelector("#console"),M=document.querySelector("#graph"),_=document.querySelector("#flags"),A=h.j6.create(L,{value:["d1 : bird(X) => flies(X).","d2 : penguin(X) => bird(X).","s1 : penguin(X) -> -flies(X).","a1 :-> penguin(tweety)."].join("\n"),language:"tuprolog",scrollbar:{vertical:"hidden",horizontal:"hidden"},minimap:{enabled:!1},overviewRulerBorder:!1,overviewRulerLanes:0,hideCursorInOverviewRuler:!0}),F=h.j6.create(q,{value:"buildLabelSets",language:"tuprolog",mscrollbar:{vertical:"hidden",horizontal:"hidden"},minimap:{enabled:!1},overviewRulerBorder:!1,overviewRulerLanes:0,hideCursorInOverviewRuler:!0,lineNumbers:!1,automaticLayout:!0});k=C.init(_),O=function(e){var n=x.init(R),r=w.init(j),t=S.init(M);r.clear(),t.clear();var o=b.solve(A.getValue(),F.getValue(),k.flags(),r.outputConsumer()),i=o.i,a=o.query,u=o.solver;n.printSolution(i,a,(function(){document.querySelector(".overlay").style.display="block"}),(function(){document.querySelector(".overlay").style.display="none",t.printGraph(F.getValue(),u)}))},document.querySelector("button.solve").addEventListener("click",(function(){try{O()}catch(e){alert("".concat(e.name.toUpperCase()," \n").concat(e.message))}})),document.querySelector("#inputFile").addEventListener("change",(function(e){return n=e.target.files[0],r=function(e){return A.setValue(e)},(t=new FileReader).onload=function(e){return function(){return r(e.result)}}(t),void t.readAsText(n);var n,r,t}))}},r={};function t(e){var o=r[e];if(void 0!==o)return o.exports;var i=r[e]={id:e,exports:{}};return n[e].call(i.exports,i,i.exports,t),i.exports}t.m=n,t.amdO={},e=[],t.O=(n,r,o,i)=>{if(!r){var a=1/0;for(c=0;c<e.length;c++){for(var[r,o,i]=e[c],u=!0,l=0;l<r.length;l++)(!1&i||a>=i)&&Object.keys(t.O).every((e=>t.O[e](r[l])))?r.splice(l--,1):(u=!1,i<a&&(a=i));if(u){e.splice(c--,1);var s=o();void 0!==s&&(n=s)}}return n}i=i||0;for(var c=e.length;c>0&&e[c-1][2]>i;c--)e[c]=e[c-1];e[c]=[r,o,i]},t.n=e=>{var n=e&&e.__esModule?()=>e.default:()=>e;return t.d(n,{a:n}),n},t.d=(e,n)=>{for(var r in n)t.o(n,r)&&!t.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),t.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),t.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.p="/arg2p-kt-web/",(()=>{t.b=document.baseURI||self.location.href;var e={143:0,617:0};t.O.j=n=>0===e[n];var n=(n,r)=>{var o,i,[a,u,l]=r,s=0;if(a.some((n=>0!==e[n]))){for(o in u)t.o(u,o)&&(t.m[o]=u[o]);if(l)var c=l(t)}for(n&&n(r);s<a.length;s++)i=a[s],t.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return t.O(c)},r=self.webpackChunk_tuprolog_arg2p_playground=self.webpackChunk_tuprolog_arg2p_playground||[];r.forEach(n.bind(null,0)),r.push=n.bind(null,r.push.bind(r))})(),t.nc=void 0;var o=t.O(void 0,[539,889,685,992],(()=>t(649)));o=t.O(o)})();