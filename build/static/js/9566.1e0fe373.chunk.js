(self.webpackChunkweb=self.webpackChunkweb||[]).push([[9566],{9566:function(r,n,t){!function(r){"use strict";r.defineMode("http",(function(){function r(r,n){return r.skipToEnd(),n.cur=c,"error"}function n(n,e){return n.match(/^HTTP\/\d\.\d/)?(e.cur=t,"keyword"):n.match(/^[A-Z]+/)&&/[ \t]/.test(n.peek())?(e.cur=u,"keyword"):r(n,e)}function t(n,t){var u=n.match(/^\d+/);if(!u)return r(n,t);t.cur=e;var i=Number(u[0]);return i>=100&&i<200?"positive informational":i>=200&&i<300?"positive success":i>=300&&i<400?"positive redirect":i>=400&&i<500?"negative client-error":i>=500&&i<600?"negative server-error":"error"}function e(r,n){return r.skipToEnd(),n.cur=c,null}function u(r,n){return r.eatWhile(/\S/),n.cur=i,"string-2"}function i(n,t){return n.match(/^HTTP\/\d\.\d$/)?(t.cur=c,"keyword"):r(n,t)}function c(r){return r.sol()&&!r.eat(/[ \t]/)?r.match(/^.*?:/)?"atom":(r.skipToEnd(),"error"):(r.skipToEnd(),"string")}function o(r){return r.skipToEnd(),null}return{token:function(r,n){var t=n.cur;return t!=c&&t!=o&&r.eatSpace()?null:t(r,n)},blankLine:function(r){r.cur=o},startState:function(){return{cur:n}}}})),r.defineMIME("message/http","http")}(t(3668))}}]);
//# sourceMappingURL=9566.1e0fe373.chunk.js.map