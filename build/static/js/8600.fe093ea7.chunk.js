(self.webpackChunkweb=self.webpackChunkweb||[]).push([[8600],{8600:function(e,r,t){!function(e){"use strict";e.defineMode("tcl",(function(){function e(e){for(var r={},t=e.split(" "),n=0;n<t.length;++n)r[t[n]]=!0;return r}var r=e("Tcl safe after append array auto_execok auto_import auto_load auto_mkindex auto_mkindex_old auto_qualify auto_reset bgerror binary break catch cd close concat continue dde eof encoding error eval exec exit expr fblocked fconfigure fcopy file fileevent filename filename flush for foreach format gets glob global history http if incr info interp join lappend lindex linsert list llength load lrange lreplace lsearch lset lsort memory msgcat namespace open package parray pid pkg::create pkg_mkIndex proc puts pwd re_syntax read regex regexp registry regsub rename resource return scan seek set socket source split string subst switch tcl_endOfWord tcl_findLibrary tcl_startOfNextWord tcl_wordBreakAfter tcl_startOfPreviousWord tcl_wordBreakBefore tcltest tclvars tell time trace unknown unset update uplevel upvar variable vwait"),t=e("if elseif else and not or eq ne in ni for foreach while switch"),n=/[+\-*&%=<>!?^\/\|]/;function a(e,r,t){return r.tokenize=t,t(e,r)}function o(e,o){var u=o.beforeParams;o.beforeParams=!1;var c=e.next();if('"'!=c&&"'"!=c||!o.inParams){if(/[\[\]{}\(\),;\.]/.test(c))return"("==c&&u?o.inParams=!0:")"==c&&(o.inParams=!1),null;if(/\d/.test(c))return e.eatWhile(/[\w\.]/),"number";if("#"==c)return e.eat("*")?a(e,o,l):"#"==c&&e.match(/ *\[ *\[/)?a(e,o,f):(e.skipToEnd(),"comment");if('"'==c)return e.skipTo(/"/),"comment";if("$"==c)return e.eatWhile(/[$_a-z0-9A-Z\.{:]/),e.eatWhile(/}/),o.beforeParams=!0,"builtin";if(n.test(c))return e.eatWhile(n),"comment";e.eatWhile(/[\w\$_{}\xa1-\uffff]/);var s=e.current().toLowerCase();return r&&r.propertyIsEnumerable(s)?"keyword":t&&t.propertyIsEnumerable(s)?(o.beforeParams=!0,"keyword"):null}return a(e,o,i(c))}function i(e){return function(r,t){for(var n,a=!1,i=!1;null!=(n=r.next());){if(n==e&&!a){i=!0;break}a=!a&&"\\"==n}return i&&(t.tokenize=o),"string"}}function l(e,r){for(var t,n=!1;t=e.next();){if("#"==t&&n){r.tokenize=o;break}n="*"==t}return"comment"}function f(e,r){for(var t,n=0;t=e.next();){if("#"==t&&2==n){r.tokenize=o;break}"]"==t?n++:" "!=t&&(n=0)}return"meta"}return{startState:function(){return{tokenize:o,beforeParams:!1,inParams:!1}},token:function(e,r){return e.eatSpace()?null:r.tokenize(e,r)},lineComment:"#"}})),e.defineMIME("text/x-tcl","tcl")}(t(3668))}}]);
//# sourceMappingURL=8600.fe093ea7.chunk.js.map