(self.webpackChunkweb=self.webpackChunkweb||[]).push([[6523],{6523:function(e,t,n){!function(e){"use strict";e.defineMode("tiki",(function(e){function t(e,t,n){return function(i,u){for(;!i.eol();){if(i.match(t)){u.tokenize=r;break}i.next()}return n&&(u.tokenize=n),e}}function n(e){return function(t,n){for(;!t.eol();)t.next();return n.tokenize=r,e}}function r(e,i){function u(t){return i.tokenize=t,t(e,i)}var a=e.sol(),o=e.next();switch(o){case"{":return e.eat("/"),e.eatSpace(),e.eatWhile(/[^\s\u00a0=\"\'\/?(}]/),i.tokenize=f,"tag";case"_":if(e.eat("_"))return u(t("strong","__",r));break;case"'":if(e.eat("'"))return u(t("em","''",r));break;case"(":if(e.eat("("))return u(t("variable-2","))",r));break;case"[":return u(t("variable-3","]",r));case"|":if(e.eat("|"))return u(t("comment","||"));break;case"-":if(e.eat("="))return u(t("header string","=-",r));if(e.eat("-"))return u(t("error tw-deleted","--",r));break;case"=":if(e.match("=="))return u(t("tw-underline","===",r));break;case":":if(e.eat(":"))return u(t("comment","::"));break;case"^":return u(t("tw-box","^"));case"~":if(e.match("np~"))return u(t("meta","~/np~"))}if(a)switch(o){case"!":return e.match("!!!!!")||e.match("!!!!")||e.match("!!!")||e.match("!!"),u(n("header string"));case"*":case"#":case"+":return u(n("tw-listitem bracket"))}return null}var i,u,a,o,c=e.indentUnit;function f(e,t){var n=e.next(),i=e.peek();return"}"==n?(t.tokenize=r,"tag"):"("==n||")"==n?"bracket":"="==n?(u="equals",">"==i&&(e.next(),i=e.peek()),/[\'\"]/.test(i)||(t.tokenize=l()),"operator"):/[\'\"]/.test(n)?(t.tokenize=s(n),t.tokenize(e,t)):(e.eatWhile(/[^\s\u00a0=\"\'\/?]/),"keyword")}function s(e){return function(t,n){for(;!t.eol();)if(t.next()==e){n.tokenize=f;break}return"string"}}function l(){return function(e,t){for(;!e.eol();){var n=e.next(),r=e.peek();if(" "==n||","==n||/[ )}]/.test(r)){t.tokenize=f;break}}return"string"}}function k(){for(var e=arguments.length-1;e>=0;e--)a.cc.push(arguments[e])}function d(){return k.apply(null,arguments),!0}function p(e,t){var n=a.context&&a.context.noIndent;a.context={prev:a.context,pluginName:e,indent:a.indented,startOfLine:t,noIndent:n}}function g(){a.context&&(a.context=a.context.prev)}function m(e){if("openPlugin"==e)return a.pluginName=i,d(h,x(a.startOfLine));if("closePlugin"==e){var t=!1;return a.context?(t=a.context.pluginName!=i,g()):t=!0,t&&(o="error"),d(b(t))}return"string"==e?(a.context&&"!cdata"==a.context.name||p("!cdata"),a.tokenize==r&&g(),d()):d()}function x(e){return function(t){return"selfclosePlugin"==t||"endPlugin"==t?d():"endPlugin"==t?(p(a.pluginName,e),d()):d()}}function b(e){return function(t){return e&&(o="error"),"endPlugin"==t?d():k()}}function h(e){return"keyword"==e?(o="attribute",d(h)):"equals"==e?d(v,h):k()}function v(e){return"keyword"==e?(o="string",d()):"string"==e?d(z):k()}function z(e){return"string"==e?d(z):k()}return{startState:function(){return{tokenize:r,cc:[],indented:0,startOfLine:!0,pluginName:null,context:null}},token:function(e,t){if(e.sol()&&(t.startOfLine=!0,t.indented=e.indentation()),e.eatSpace())return null;o=u=i=null;var n=t.tokenize(e,t);if((n||u)&&"comment"!=n)for(a=t;!(t.cc.pop()||m)(u||n););return t.startOfLine=!1,o||n},indent:function(e,t){var n=e.context;if(n&&n.noIndent)return 0;for(n&&/^{\//.test(t)&&(n=n.prev);n&&!n.startOfLine;)n=n.prev;return n?n.indent+c:0},electricChars:"/"}})),e.defineMIME("text/tiki","tiki")}(n(3668))}}]);
//# sourceMappingURL=6523.7c465e1d.chunk.js.map