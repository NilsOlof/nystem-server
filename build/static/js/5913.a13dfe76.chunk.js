(self.webpackChunkweb=self.webpackChunkweb||[]).push([[5913],{5913:function(e,t,n){!function(e){"use strict";e.defineMode("sas",(function(){var e={},t={eq:"operator",lt:"operator",le:"operator",gt:"operator",ge:"operator",in:"operator",ne:"operator",or:"operator"},n=/(<=|>=|!=|<>)/,r=/[=\(:\),{}.*<>+\-\/^\[\]]/;function s(t,n,r){if(r)for(var s=n.split(" "),o=0;o<s.length;o++)e[s[o]]={style:t,state:r}}function o(s,o){var a=s.next();if("/"===a&&s.eat("*"))return o.continueComment=!0,"comment";if(!0===o.continueComment)return"*"===a&&"/"===s.peek()?(s.next(),o.continueComment=!1):s.skipTo("*")?(s.skipTo("*"),s.next(),s.eat("/")&&(o.continueComment=!1)):s.skipToEnd(),"comment";if("*"==a&&s.column()==s.indentation())return s.skipToEnd(),"comment";var i,l=a+s.peek();if(!('"'!==a&&"'"!==a||o.continueString))return o.continueString=a,"string";if(o.continueString)return o.continueString==a?o.continueString=null:s.skipTo(o.continueString)?(s.next(),o.continueString=null):s.skipToEnd(),"string";if(null!==o.continueString&&s.eol())return s.skipTo(o.continueString)||s.skipToEnd(),"string";if(/[\d\.]/.test(a))return"."===a?s.match(/^[0-9]+([eE][\-+]?[0-9]+)?/):"0"===a?s.match(/^[xX][0-9a-fA-F]+/)||s.match(/^0[0-7]+/):s.match(/^[0-9]*\.?[0-9]*([eE][\-+]?[0-9]+)?/),"number";if(n.test(a+s.peek()))return s.next(),"operator";if(t.hasOwnProperty(l)){if(s.next()," "===s.peek())return t[l.toLowerCase()]}else if(r.test(a))return"operator";if(null!=s.match(/[%&;\w]+/,!1)){if(i=a+s.match(/[%&;\w]+/,!0),/&/.test(i))return"variable"}else i=a;if(o.nextword)return s.match(/[\w]+/),"."===s.peek()&&s.skipTo(" "),o.nextword=!1,"variable-2";if(i=i.toLowerCase(),o.inDataStep){if("run;"===i||s.match(/run\s;/))return o.inDataStep=!1,"builtin";if(i&&"."===s.next())return/\w/.test(s.peek())?"variable-2":"variable";if(i&&e.hasOwnProperty(i)&&(-1!==e[i].state.indexOf("inDataStep")||-1!==e[i].state.indexOf("ALL"))){s.start<s.pos&&s.backUp(s.pos-s.start);for(var c=0;c<i.length;++c)s.next();return e[i].style}}if(o.inProc){if("run;"===i||"quit;"===i)return o.inProc=!1,"builtin";if(i&&e.hasOwnProperty(i)&&(-1!==e[i].state.indexOf("inProc")||-1!==e[i].state.indexOf("ALL")))return s.match(/[\w]+/),e[i].style}return o.inMacro?"%mend"===i?(";"===s.peek()&&s.next(),o.inMacro=!1,"builtin"):i&&e.hasOwnProperty(i)&&(-1!==e[i].state.indexOf("inMacro")||-1!==e[i].state.indexOf("ALL"))?(s.match(/[\w]+/),e[i].style):"atom":i&&e.hasOwnProperty(i)?(s.backUp(1),s.match(/[\w]+/),"data"===i&&!1===/=/.test(s.peek())?(o.inDataStep=!0,o.nextword=!0,"builtin"):"proc"===i?(o.inProc=!0,o.nextword=!0,"builtin"):"%macro"===i?(o.inMacro=!0,o.nextword=!0,"builtin"):/title[1-9]/.test(i)?"def":"footnote"===i?(s.eat(/[1-9]/),"def"):!0===o.inDataStep&&-1!==e[i].state.indexOf("inDataStep")||!0===o.inProc&&-1!==e[i].state.indexOf("inProc")||!0===o.inMacro&&-1!==e[i].state.indexOf("inMacro")||-1!==e[i].state.indexOf("ALL")?e[i].style:null):null}return s("def","stack pgm view source debug nesting nolist",["inDataStep"]),s("def","if while until for do do; end end; then else cancel",["inDataStep"]),s("def","label format _n_ _error_",["inDataStep"]),s("def","ALTER BUFNO BUFSIZE CNTLLEV COMPRESS DLDMGACTION ENCRYPT ENCRYPTKEY EXTENDOBSCOUNTER GENMAX GENNUM INDEX LABEL OBSBUF OUTREP PW PWREQ READ REPEMPTY REPLACE REUSE ROLE SORTEDBY SPILL TOBSNO TYPE WRITE FILECLOSE FIRSTOBS IN OBS POINTOBS WHERE WHEREUP IDXNAME IDXWHERE DROP KEEP RENAME",["inDataStep"]),s("def","filevar finfo finv fipname fipnamel fipstate first firstobs floor",["inDataStep"]),s("def","varfmt varinfmt varlabel varlen varname varnum varray varrayx vartype verify vformat vformatd vformatdx vformatn vformatnx vformatw vformatwx vformatx vinarray vinarrayx vinformat vinformatd vinformatdx vinformatn vinformatnx vinformatw vinformatwx vinformatx vlabel vlabelx vlength vlengthx vname vnamex vnferr vtype vtypex weekday",["inDataStep"]),s("def","zipfips zipname zipnamel zipstate",["inDataStep"]),s("def","put putc putn",["inDataStep"]),s("builtin","data run",["inDataStep"]),s("def","data",["inProc"]),s("def","%if %end %end; %else %else; %do %do; %then",["inMacro"]),s("builtin","proc run; quit; libname filename %macro %mend option options",["ALL"]),s("def","footnote title libname ods",["ALL"]),s("def","%let %put %global %sysfunc %eval ",["ALL"]),s("variable","&sysbuffr &syscc &syscharwidth &syscmd &sysdate &sysdate9 &sysday &sysdevic &sysdmg &sysdsn &sysencoding &sysenv &syserr &syserrortext &sysfilrc &syshostname &sysindex &sysinfo &sysjobid &syslast &syslckrc &syslibrc &syslogapplname &sysmacroname &sysmenv &sysmsg &sysncpu &sysodspath &sysparm &syspbuff &sysprocessid &sysprocessname &sysprocname &sysrc &sysscp &sysscpl &sysscpl &syssite &sysstartid &sysstartname &systcpiphostname &systime &sysuserid &sysver &sysvlong &sysvlong4 &syswarningtext",["ALL"]),s("def","source2 nosource2 page pageno pagesize",["ALL"]),s("def","_all_ _character_ _cmd_ _freq_ _i_ _infile_ _last_ _msg_ _null_ _numeric_ _temporary_ _type_ abort abs addr adjrsq airy alpha alter altlog altprint and arcos array arsin as atan attrc attrib attrn authserver autoexec awscontrol awsdef awsmenu awsmenumerge awstitle backward band base betainv between blocksize blshift bnot bor brshift bufno bufsize bxor by byerr byline byte calculated call cards cards4 catcache cbufno cdf ceil center cexist change chisq cinv class cleanup close cnonct cntllev coalesce codegen col collate collin column comamid comaux1 comaux2 comdef compbl compound compress config continue convert cos cosh cpuid create cross crosstab css curobs cv daccdb daccdbsl daccsl daccsyd dacctab dairy datalines datalines4 datejul datepart datetime day dbcslang dbcstype dclose ddfm ddm delete delimiter depdb depdbsl depsl depsyd deptab dequote descending descript design= device dflang dhms dif digamma dim dinfo display distinct dkricond dkrocond dlm dnum do dopen doptname doptnum dread drop dropnote dsname dsnferr echo else emaildlg emailid emailpw emailserver emailsys encrypt end endsas engine eof eov erf erfc error errorcheck errors exist exp fappend fclose fcol fdelete feedback fetch fetchobs fexist fget file fileclose fileexist filefmt filename fileref  fmterr fmtsearch fnonct fnote font fontalias  fopen foptname foptnum force formatted formchar formdelim formdlim forward fpoint fpos fput fread frewind frlen from fsep fuzz fwrite gaminv gamma getoption getvarc getvarn go goto group gwindow hbar hbound helpenv helploc hms honorappearance hosthelp hostprint hour hpct html hvar ibessel ibr id if index indexc indexw initcmd initstmt inner input inputc inputn inr insert int intck intnx into intrr invaliddata irr is jbessel join juldate keep kentb kurtosis label lag last lbound leave left length levels lgamma lib  library libref line linesize link list log log10 log2 logpdf logpmf logsdf lostcard lowcase lrecl ls macro macrogen maps mautosource max maxdec maxr mdy mean measures median memtype merge merror min minute missing missover mlogic mod mode model modify month mopen mort mprint mrecall msglevel msymtabmax mvarsize myy n nest netpv new news nmiss no nobatch nobs nocaps nocardimage nocenter nocharcode nocmdmac nocol nocum nodate nodbcs nodetails nodmr nodms nodmsbatch nodup nodupkey noduplicates noechoauto noequals noerrorabend noexitwindows nofullstimer noicon noimplmac noint nolist noloadlist nomiss nomlogic nomprint nomrecall nomsgcase nomstored nomultenvappl nonotes nonumber noobs noovp nopad nopercent noprint noprintinit normal norow norsasuser nosetinit  nosplash nosymbolgen note notes notitle notitles notsorted noverbose noxsync noxwait npv null number numkeys nummousekeys nway obs  on open     order ordinal otherwise out outer outp= output over ovp p(1 5 10 25 50 75 90 95 99) pad pad2  paired parm parmcards path pathdll pathname pdf peek peekc pfkey pmf point poisson poke position printer probbeta probbnml probchi probf probgam probhypr probit probnegb probnorm probsig probt procleave prt ps  pw pwreq qtr quote r ranbin rancau random ranexp rangam range ranks rannor ranpoi rantbl rantri ranuni rcorr read recfm register regr remote remove rename repeat repeated replace resolve retain return reuse reverse rewind right round rsquare rtf rtrace rtraceloc s s2 samploc sasautos sascontrol sasfrscr sasmsg sasmstore sasscript sasuser saving scan sdf second select selection separated seq serror set setcomm setot sign simple sin sinh siteinfo skewness skip sle sls sortedby sortpgm sortseq sortsize soundex  spedis splashlocation split spool sqrt start std stderr stdin stfips stimer stname stnamel stop stopover sub subgroup subpopn substr sum sumwgt symbol symbolgen symget symput sysget sysin sysleave sysmsg sysparm sysprint sysprintfont sysprod sysrc system t table tables tan tanh tapeclose tbufsize terminal test then timepart tinv  tnonct to today tol tooldef totper transformout translate trantab tranwrd trigamma trim trimn trunc truncover type unformatted uniform union until upcase update user usericon uss validate value var  weight when where while wincharset window work workinit workterm write wsum xsync xwait yearcutoff yes yyq  min max",["inDataStep","inProc"]),s("operator","and not ",["inDataStep","inProc"]),{startState:function(){return{inDataStep:!1,inProc:!1,inMacro:!1,nextword:!1,continueString:null,continueComment:!1}},token:function(e,t){return e.eatSpace()?null:o(e,t)},blockCommentStart:"/*",blockCommentEnd:"*/"}})),e.defineMIME("text/x-sas","sas")}(n(3668))}}]);
//# sourceMappingURL=5913.a13dfe76.chunk.js.map