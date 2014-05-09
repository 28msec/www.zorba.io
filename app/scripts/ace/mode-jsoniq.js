/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */
define('ace/mode/jsoniq', ['require', 'exports', 'module' , 'ace/worker/worker_client', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/xquery/JSONiqLexer', 'ace/range', 'ace/mode/behaviour/xquery', 'ace/mode/folding/cstyle', 'ace/anchor', 'ace/snippets', 'ace/editor'], function(require, exports, module) {


var WorkerClient = require("../worker/worker_client").WorkerClient;
var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var JSONiqLexer = require("./xquery/JSONiqLexer").JSONiqLexer;
var Range = require("../range").Range;
var XQueryBehaviour = require("./behaviour/xquery").XQueryBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Anchor = require("../anchor").Anchor;
var SnippetManager = require("../snippets").snippetManager;
var Editor = require("../editor").Editor;

var Mode = function(parent) {
    this.$tokenizer   = new JSONiqLexer();
    this.$behaviour   = new XQueryBehaviour();
    this.foldingRules = new CStyleFoldMode();

    SnippetManager.register({ 
        content: 'import module namespace ${1:ns} = "${2:http://www.example.com/}";',
        tabTrigger: "import",
        name: "ImportModule"
    });

    SnippetManager.register({ 
        content: 'some $${1:var} in ${2:expr} satisfies ${3:expr}',
        tabTrigger: "some",
        name: "SomeQuantifiedExpr"
    });

    SnippetManager.register({ 
        content: 'every $${1:var} in ${2:expr} satisfies ${3:expr}',
        tabTrigger: "every",
        name: "EveryQuantifiedExpr"
    });

    SnippetManager.register({ 
        content: 'if(${1:true}) then ${2:expr} else ${3:true}',
        tabTrigger: "if",
        name: "IfExpr"
    });

    SnippetManager.register({ 
        content: 'switch(${1:"foo"})\n  case ${2:"foo"}\n  return ${3:true}\ndefault return ${4:false}',
        tabTrigger: "switch",
        name: "SwitchExpr"
    });

    SnippetManager.register({ 
      content: 'try { ${1:expr} } catch ${2:*} { ${3:expr} }',
        tabTrigger: "try",
        name: "TryExpr"
    });

    SnippetManager.register({ 
      content: 'for $${1:var} in ${2:expr}\nreturn ${3:expr}',
      tabTrigger: "for",
      name: "ForClause"
    });

    SnippetManager.register({ 
      content: 'for tumbling window $${1:var} in ${2:expr}\nstart at $${3:start} when ${4:expr}\nend at $${5:end} when ${6:expr}\nreturn ${7:expr}',
      tabTrigger: "tumbling",
      name: "TumblingWindow"
    });

    SnippetManager.register({ 
      content: 'for sliding window $${1:var} in ${2:expr}\nstart at $${3:start} when ${4:expr}\nend at $${5:end} when ${6:expr}\nreturn ${7:expr}',
      tabTrigger: "sliding",
      name: "SlidingWindow"
    });

    SnippetManager.register({ 
      content: 'let $${1:var} := ${2:expr}',
      tabTrigger: "let",
      name: "LetClause"
    });

    SnippetManager.register({ 
      content: 'group by $${1:var} := ${2:expr}',
      tabTrigger: "group",
      name: "GroupByClause"
    });

    SnippetManager.register({ 
      content: 'order by ${1:expr} ${2:descending}',
      tabTrigger: "order",
      name: "OrderByClause"
    });

    SnippetManager.register({ 
      content: 'stable order by ${1:expr}',
      tabTrigger: "stable",
      name: "StableOrderByClause"
    });

    SnippetManager.register({ 
      content: 'count $${1:var}',
      tabTrigger: "count",
      name: "CountByClause"
    });
     
    SnippetManager.register({ 
      content: 'ordered { ${1:expr} }',
      tabTrigger: "ordered",
      name: "OrderedExpr"
    });
     
    SnippetManager.register({ 
      content: 'unordered { ${1:expr} }',
      tabTrigger: "unordered",
      name: "UnorderedExpr"
    });
     
    SnippetManager.register({ 
      content: 'treat as ${1:expr}',
      tabTrigger: "treat",
      name: "TreatAs"
    });

    SnippetManager.register({ 
      content: 'castable as ${1:atomicType}',
      tabTrigger: "castable",
      name: "CastableAs"
    });

    SnippetManager.register({ 
      content: 'cast as ${1:atomicType}',
      tabTrigger: "cast",
      name: "CastAs"
    });

    SnippetManager.register({ 
      content: 'typeswitch(${1:expr})\ncase ${2:type}\n  return ${3:expr}\ndefault return ${4:expr}',
        tabTrigger: "typeswitch",
        name: "SwitchExpr"
    });

    SnippetManager.register({ 
      content: 'declare variable $${1:varname} := ${2:expr};',
      tabTrigger: "var",
      name: "VariableDecl"
    });

    SnippetManager.register({ 
      content: 'declare function ${1:ns}:${2:name}(){\n  ${3:expr}\n};',
      tabTrigger: "fn",
      name: "FunctionDecl"
    });

    SnippetManager.register({ 
      content: 'module namespace ${1:ns} = "${2:http://www.example.com}";',
      tabTrigger: "module",
      name: "ModuleDecl"
    });
};

oop.inherits(Mode, TextMode);

(function() {

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);
        var match = line.match(/\s*(?:then|else|return|[{\(]|<\w+>)\s*$/);
        if (match)
            indent += tab;
        return indent;
    };
    
    this.checkOutdent = function(state, line, input) {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*[\}\)]/.test(input);
    };
    
    this.autoOutdent = function(state, doc, row) {
        var line = doc.getLine(row);
        var match = line.match(/^(\s*[\}\)])/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket({row: row, column: column});

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
    };

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var i, line;
        var outdent = true;
        var re = /^\s*\(:(.*):\)/;

        for (i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        var range = new Range(0, 0, 0, 0);
        for (i=startRow; i<= endRow; i++) {
            line = doc.getLine(i);
            range.start.row  = i;
            range.end.row    = i;
            range.end.column = line.length;

            doc.replace(range, outdent ? line.match(re)[1] : "(:" + line + ":)");
        }
    };
    
    this.createWorker = function(session) {
        
      var worker = new WorkerClient(["ace"], "ace/mode/jsoniq_worker", "JSONiqWorker");
        var that = this;

        worker.attachToDocument(session.getDocument());
        
        worker.on("markers", function(e) {
          session.clearAnnotations();
          that.addMarkers(e.data, session);
        });
        
        worker.on("highlight", function(tokens) {
          that.$tokenizer.tokens = tokens.data.tokens;
          that.$tokenizer.lines  = session.getDocument().getAllLines();
          
          var rows = Object.keys(that.$tokenizer.tokens);
          for(var i=0; i < rows.length; i++) {
            var row = parseInt(rows[i]);
            delete session.bgTokenizer.lines[row];
            delete session.bgTokenizer.states[row];
            session.bgTokenizer.fireUpdateEvent(row, row);
          }
        });
        
        return worker;
    };

    this.removeMarkers = function(session) {
        var markers = session.getMarkers(false);
        for (var id in markers) {
            if (markers[id].clazz.indexOf('language_highlight_') === 0) {
                session.removeMarker(id);
            }
        }
        for (var i = 0; i < session.markerAnchors.length; i++) {
            session.markerAnchors[i].detach();
        }
        session.markerAnchors = [];
    };

    this.addMarkers = function(annos, mySession) {
        var _self = this;
        
        if (!mySession.markerAnchors) mySession.markerAnchors = [];
        this.removeMarkers(mySession);
        mySession.languageAnnos = [];
        annos.forEach(function(anno) {
            var anchor = new Anchor(mySession.getDocument(), anno.pos.sl, anno.pos.sc || 0);
            mySession.markerAnchors.push(anchor);
            var markerId;
            var colDiff = anno.pos.ec - anno.pos.sc;
            var rowDiff = anno.pos.el - anno.pos.sl;
            var gutterAnno = {
                guttertext: anno.message,
                type: anno.level || "warning",
                text: anno.message
            };

            function updateFloat(single) {
                if (markerId)
                    mySession.removeMarker(markerId);
                gutterAnno.row = anchor.row;
                if (anno.pos.sc !== undefined && anno.pos.ec !== undefined) {
                    var range = new Range(anno.pos.sl, anno.pos.sc, anno.pos.el, anno.pos.ec);
                    markerId = mySession.addMarker(range, "language_highlight_" + (anno.type ? anno.type : "default"));
                }
                if (single) mySession.setAnnotations(mySession.languageAnnos);
            }
            updateFloat();
            anchor.on("change", function() {
                updateFloat(true);
            });
            if (anno.message) mySession.languageAnnos.push(gutterAnno);
        });
        mySession.setAnnotations(mySession.languageAnnos);
    };
 
}).call(Mode.prototype);

exports.Mode = Mode;
});
 
define('ace/mode/xquery/JSONiqLexer', ['require', 'exports', 'module' , 'ace/mode/xquery/JSONiqTokenizer'], function(require, exports, module) {
  
  var JSONiqTokenizer = require("./JSONiqTokenizer").JSONiqTokenizer;
  
  var TokenHandler = function(code) {
      
    var input = code;
    
    this.tokens = [];
 
    this.reset = function(code) {
      input = input;
      this.tokens = [];
    };
    
    this.startNonterminal = function(name, begin) {};

    this.endNonterminal = function(name, end) {};

    this.terminal = function(name, begin, end) {
      this.tokens.push({
        name: name,
        value: input.substring(begin, end)
      });
    };

    this.whitespace = function(begin, end) {
      this.tokens.push({
        name: "WS",
        value: input.substring(begin, end)
      });
    };
  };
    var keys = "NaN|after|allowing|ancestor|ancestor-or-self|and|append|array|as|ascending|at|attribute|base-uri|before|boundary-space|break|by|case|cast|castable|catch|child|collation|comment|constraint|construction|contains|context|continue|copy|copy-namespaces|count|decimal-format|decimal-separator|declare|default|delete|descendant|descendant-or-self|descending|digit|div|document|document-node|element|else|empty|empty-sequence|encoding|end|eq|every|except|exit|external|false|first|following|following-sibling|for|from|ft-option|function|ge|greatest|group|grouping-separator|gt|idiv|if|import|in|index|infinity|insert|instance|integrity|intersect|into|is|item|json|json-item|jsoniq|last|lax|le|least|let|loop|lt|minus-sign|mod|modify|module|namespace|namespace-node|ne|next|node|nodes|not|null|object|of|only|option|or|order|ordered|ordering|paragraphs|parent|pattern-separator|per-mille|percent|preceding|preceding-sibling|previous|processing-instruction|rename|replace|return|returning|revalidation|satisfies|schema|schema-attribute|schema-element|score|select|self|sentences|sliding|some|stable|start|strict|switch|text|then|times|to|treat|true|try|tumbling|type|typeswitch|union|unordered|updating|validate|value|variable|version|when|where|while|window|with|words|xquery|zero-digit".split("|");
    var keywords = keys.map(
      function(val) { return { name: "'" + val + "'", token: "keyword" }; }
    );
    
    var ncnames = keys.map(
      function(val) { return { name: "'" + val + "'", token: "text", next: function(stack){ stack.pop(); } }; }
    );

    var cdata = "constant.language";
    var number = "constant";
    var xmlcomment = "comment";
    var pi = "xml-pe";
    var pragma = "constant.buildin";
    
    var Rules = {
      start: [
        { name: "'(#'", token: pragma, next: function(stack){ stack.push("Pragma"); } },
        { name: "'(:'", token: "comment", next: function(stack){ stack.push("Comment"); } },
        { name: "'(:~'", token: "comment.doc", next: function(stack){ stack.push("CommentDoc"); } },
        { name: "'<!--'", token: xmlcomment, next: function(stack){ stack.push("XMLComment"); } },
        { name: "'<?'", token: pi, next: function(stack) { stack.push("PI"); } },
        { name: "''''", token: "string", next: function(stack){ stack.push("AposString"); } },
        { name: "'\"'", token: "string", next: function(stack){ stack.push("QuotString"); } },
        { name: "Annotation", token: "support.function" },
        { name: "ModuleDecl", token: "keyword", next: function(stack){ stack.push("Prefix"); } },
        { name: "OptionDecl", token: "keyword", next: function(stack){ stack.push("_EQName"); } },
        { name: "AttrTest", token: "support.type" },
        { name: "Variable",  token: "variable" },
        { name: "'<![CDATA['", token: cdata, next: function(stack){ stack.push("CData"); } },
        { name: "IntegerLiteral", token: number },
        { name: "DecimalLiteral", token: number },
        { name: "DoubleLiteral", token: number },
        { name: "Operator", token: "keyword.operator" },
        { name: "EQName", token: function(val) { return keys.indexOf(val) !== -1 ? "keyword" : "support.function"; } },
        { name: "'('", token:"lparen" },
        { name: "')'", token:"rparen" },
        { name: "Tag", token: "meta.tag", next: function(stack){ stack.push("StartTag"); } },
        { name: "'}'", token: "text", next: function(stack){ if(stack.length > 1) stack.pop();  } },
        { name: "'{'", token: "text", next: function(stack){ stack.push("start"); } } //, next: function(stack){ if(stack.length > 1) { stack.pop(); } } }
      ].concat(keywords),
      _EQName: [
        { name: "EQName", token: "text", next: function(stack) { stack.pop(); } }
      ].concat(ncnames),
      Prefix: [
        { name: "NCName", token: "text", next: function(stack) { stack.pop(); } }
      ].concat(ncnames),
      StartTag: [
        { name: "'>'", token: "meta.tag", next: function(stack){ stack.push("TagContent"); } },
        { name: "QName", token: "entity.other.attribute-name" },
        { name: "'='", token: "text" },
        { name: "''''", token: "string", next: function(stack){ stack.push("AposAttr"); } },
        { name: "'\"'", token: "string", next: function(stack){ stack.push("QuotAttr"); } },
        { name: "'/>'", token: "meta.tag.r", next: function(stack){ stack.pop(); } }
      ],
      TagContent: [
        { name: "ElementContentChar", token: "text" },
        { name: "'<![CDATA['", token: cdata, next: function(stack){ stack.push("CData"); } },
        { name: "'<!--'", token: xmlcomment, next: function(stack){ stack.push("XMLComment"); } },
        { name: "Tag", token: "meta.tag", next: function(stack){ stack.push("StartTag"); } },
        { name: "PredefinedEntityRef", token: "constant.language.escape" },
        { name: "CharRef", token: "constant.language.escape" },
        { name: "'{{'", token: "text" },
        { name: "'}}'", token: "text" },
        { name: "'{'", token: "text", next: function(stack){ stack.push("start"); } },
        { name: "EndTag", token: "meta.tag", next: function(stack){ stack.pop(); stack.pop(); } }
      ],
      AposAttr: [
        { name: "''''", token: "string", next: function(stack){ stack.pop(); } },
        { name: "EscapeApos", token: "constant.language.escape" },
        { name: "AposAttrContentChar", token: "string" },
        { name: "PredefinedEntityRef", token: "constant.language.escape" },
        { name: "CharRef", token: "constant.language.escape" },
        { name: "'{{'", token: "string" },
        { name: "'}}'", token: "string" },
        { name: "'{'", token: "text", next: function(stack){ stack.push("start"); } }
      ],
      QuotAttr: [
        { name: "'\"'", token: "string", next: function(stack){ stack.pop(); } },
        { name: "EscapeQuot", token: "constant.language.escape" },
        { name: "QuotAttrContentChar", token: "string" },
        { name: "PredefinedEntityRef", token: "constant.language.escape" },
        { name: "CharRef", token: "constant.language.escape" },
        { name: "'{{'", token: "string" },
        { name: "'}}'", token: "string" },
        { name: "'{'", token: "text", next: function(stack){ stack.push("start"); } }
      ],
      Pragma: [
        { name: "PragmaContents", token: pragma },
        { name: "'#'", token: pragma },
        { name: "'#)'", token: pragma, next: function(stack){ stack.pop(); } }
      ],
      Comment: [
        { name: "CommentContents", token: "comment" },
        { name: "'(:'", token: "comment", next: function(stack){ stack.push("Comment"); } },
        { name: "':)'", token: "comment", next: function(stack){ stack.pop(); } }
      ],
      CommentDoc: [
        { name: "DocCommentContents", token: "comment.doc" },
        { name: "DocTag", token: "comment.doc.tag" },
        { name: "'(:'", token: "comment.doc", next: function(stack){ stack.push("CommentDoc"); } },
        { name: "':)'", token: "comment.doc", next: function(stack){ stack.pop(); } }
      ],
      XMLComment: [
        { name: "DirCommentContents", token: xmlcomment },
        { name: "'-->'", token: xmlcomment, next: function(stack){ stack.pop(); } }
      ],
      CData: [
        { name: "CDataSectionContents", token: cdata },
        { name: "']]>'", token: cdata, next: function(stack){ stack.pop(); } }
      ],
      PI: [
        { name: "DirPIContents", token: pi },
        { name: "'?'", token: pi },
        { name: "'?>'", token: pi, next: function(stack){ stack.pop(); } }
      ],
      AposString: [
        { name: "''''", token: "string", next: function(stack){ stack.pop(); } },
        { name: "PredefinedEntityRef", token: "constant.language.escape" },
        { name: "CharRef", token: "constant.language.escape" },
        { name: "EscapeApos", token: "constant.language.escape" },
        { name: "AposChar", token: "string" }
      ],
      QuotString: [
        { name: "'\"'", token: "string", next: function(stack){ stack.pop(); } },
        { name: "PredefinedEntityRef", token: "constant.language.escape" },
        { name: "CharRef", token: "constant.language.escape" },
        { name: "EscapeQuot", token: "constant.language.escape" },
        { name: "QuotChar", token: "string" }
      ]
    };
    
exports.JSONiqLexer = function() {
  
  this.tokens = [];
  
  this.getLineTokens = function(line, state, row) {
    state = (state === "start" || !state) ? '["start"]' : state;
    var stack = JSON.parse(state);
    var h = new TokenHandler(line);
    var tokenizer = new JSONiqTokenizer(line, h);
    var tokens = [];
    
    while(true) {
      var currentState = stack[stack.length - 1];
      try {
        
        h.tokens = [];
        tokenizer["parse_" + currentState]();
        var info = null;
        
        if(h.tokens.length > 1 && h.tokens[0].name === "WS") {
          tokens.push({
            type: "text",
            value: h.tokens[0].value
          });
          h.tokens.splice(0, 1);
        }
        
        var token = h.tokens[0];
        var rules  = Rules[currentState];
        for(var k = 0; k < rules.length; k++) {
          var rule = Rules[currentState][k];
          if((typeof(rule.name) === "function" && rule.name(token)) || rule.name === token.name) {
            info = rule;
            break;
          }
        }
        
        if(token.name === "EOF") { break; }
        if(token.value === "") { throw "Encountered empty string lexical rule."; }
        
        tokens.push({
          type: info === null ? "text" : (typeof(info.token) === "function" ? info.token(token.value) : info.token),
          value: token.value
        });
        
        if(info && info.next) {
          info.next(stack);    
        }
      
      } catch(e) {
        if(e instanceof tokenizer.ParseException) {
          var index = 0;
          for(var i=0; i < tokens.length; i++) {
            index += tokens[i].value.length;
          }
          tokens.push({ type: "text", value: line.substring(index) });
          return {
            tokens: tokens,
            state: JSON.stringify(["start"])
          };
        } else {
          throw e;
        }  
      }
    }

    return {
      tokens: tokens,
      state: JSON.stringify(stack)
    };
  };
};
});

                                                            define('ace/mode/xquery/JSONiqTokenizer', ['require', 'exports', 'module' ], function(require, exports, module) {
                                                            var JSONiqTokenizer = exports.JSONiqTokenizer = function JSONiqTokenizer(string, parsingEventHandler)
                                                            {
                                                              init(string, parsingEventHandler);
  var self = this;

  this.ParseException = function(b, e, s, o, x)
  {
    var
      begin = b,
      end = e,
      state = s,
      offending = o,
      expected = x;

    this.getBegin = function() {return begin;};
    this.getEnd = function() {return end;};
    this.getState = function() {return state;};
    this.getExpected = function() {return expected;};
    this.getOffending = function() {return offending;};

    this.getMessage = function()
    {
      return offending < 0 ? "lexical analysis failed" : "syntax error";
    };
  };

  function init(string, parsingEventHandler)
  {
    eventHandler = parsingEventHandler;
    input = string;
    size = string.length;
    reset(0, 0, 0);
  }

  this.getInput = function()
  {
    return input;
  };

  function reset(l, b, e)
  {
            b0 = b; e0 = b;
    l1 = l; b1 = b; e1 = e;
    end = e;
    eventHandler.reset(input);
  }

  this.getOffendingToken = function(e)
  {
    var o = e.getOffending();
    return o >= 0 ? JSONiqTokenizer.TOKEN[o] : null;
  };

  this.getExpectedTokenSet = function(e)
  {
    var expected;
    if (e.getExpected() < 0)
    {
      expected = JSONiqTokenizer.getTokenSet(- e.getState());
    }
    else
    {
      expected = [JSONiqTokenizer.TOKEN[e.getExpected()]];
    }
    return expected;
  };

  this.getErrorMessage = function(e)
  {
    var tokenSet = this.getExpectedTokenSet(e);
    var found = this.getOffendingToken(e);
    var prefix = input.substring(0, e.getBegin());
    var lines = prefix.split("\n");
    var line = lines.length;
    var column = lines[line - 1].length + 1;
    var size = e.getEnd() - e.getBegin();
    return e.getMessage()
         + (found == null ? "" : ", found " + found)
         + "\nwhile expecting "
         + (tokenSet.length == 1 ? tokenSet[0] : ("[" + tokenSet.join(", ") + "]"))
         + "\n"
         + (size == 0 || found != null ? "" : "after successfully scanning " + size + " characters beginning ")
         + "at line " + line + ", column " + column + ":\n..."
         + input.substring(e.getBegin(), Math.min(input.length, e.getBegin() + 64))
         + "...";
  };

  this.parse_start = function()
  {
    eventHandler.startNonterminal("start", e0);
    lookahead1W(14);                // ModuleDecl | Annotation | OptionDecl | Operator | Variable | Tag | AttrTest |
    switch (l1)
    {
    case 56:                        // '<![CDATA['
      shift(56);                    // '<![CDATA['
      break;
    case 55:                        // '<!--'
      shift(55);                    // '<!--'
      break;
    case 57:                        // '<?'
      shift(57);                    // '<?'
      break;
    case 41:                        // '(#'
      shift(41);                    // '(#'
      break;
    case 43:                        // '(:~'
      shift(43);                    // '(:~'
      break;
    case 42:                        // '(:'
      shift(42);                    // '(:'
      break;
    case 35:                        // '"'
      shift(35);                    // '"'
      break;
    case 39:                        // "'"
      shift(39);                    // "'"
      break;
    case 275:                       // '}'
      shift(275);                   // '}'
      break;
    case 272:                       // '{'
      shift(272);                   // '{'
      break;
    case 40:                        // '('
      shift(40);                    // '('
      break;
    case 44:                        // ')'
      shift(44);                    // ')'
      break;
    case 50:                        // '/'
      shift(50);                    // '/'
      break;
    case 63:                        // '['
      shift(63);                    // '['
      break;
    case 64:                        // ']'
      shift(64);                    // ']'
      break;
    case 47:                        // ','
      shift(47);                    // ','
      break;
    case 49:                        // '.'
      shift(49);                    // '.'
      break;
    case 54:                        // ';'
      shift(54);                    // ';'
      break;
    case 52:                        // ':'
      shift(52);                    // ':'
      break;
    case 34:                        // '!'
      shift(34);                    // '!'
      break;
    case 274:                       // '|'
      shift(274);                   // '|'
      break;
    case 38:                        // '$$'
      shift(38);                    // '$$'
      break;
    case 2:                         // Annotation
      shift(2);                     // Annotation
      break;
    case 1:                         // ModuleDecl
      shift(1);                     // ModuleDecl
      break;
    case 3:                         // OptionDecl
      shift(3);                     // OptionDecl
      break;
    case 12:                        // AttrTest
      shift(12);                    // AttrTest
      break;
    case 13:                        // Wildcard
      shift(13);                    // Wildcard
      break;
    case 15:                        // IntegerLiteral
      shift(15);                    // IntegerLiteral
      break;
    case 16:                        // DecimalLiteral
      shift(16);                    // DecimalLiteral
      break;
    case 17:                        // DoubleLiteral
      shift(17);                    // DoubleLiteral
      break;
    case 5:                         // Variable
      shift(5);                     // Variable
      break;
    case 6:                         // Tag
      shift(6);                     // Tag
      break;
    case 4:                         // Operator
      shift(4);                     // Operator
      break;
    case 33:                        // EOF
      shift(33);                    // EOF
      break;
    default:
      parse_EQName();
    }
    eventHandler.endNonterminal("start", e0);
  };

  this.parse_StartTag = function()
  {
    eventHandler.startNonterminal("StartTag", e0);
    lookahead1W(8);                 // QName | S^WS | EOF | '"' | "'" | '/>' | '=' | '>'
    switch (l1)
    {
    case 59:                        // '>'
      shift(59);                    // '>'
      break;
    case 51:                        // '/>'
      shift(51);                    // '/>'
      break;
    case 27:                        // QName
      shift(27);                    // QName
      break;
    case 58:                        // '='
      shift(58);                    // '='
      break;
    case 35:                        // '"'
      shift(35);                    // '"'
      break;
    case 39:                        // "'"
      shift(39);                    // "'"
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("StartTag", e0);
  };

  this.parse_TagContent = function()
  {
    eventHandler.startNonterminal("TagContent", e0);
    lookahead1(11);                 // Tag | EndTag | PredefinedEntityRef | ElementContentChar | CharRef | EOF |
    switch (l1)
    {
    case 23:                        // ElementContentChar
      shift(23);                    // ElementContentChar
      break;
    case 6:                         // Tag
      shift(6);                     // Tag
      break;
    case 7:                         // EndTag
      shift(7);                     // EndTag
      break;
    case 56:                        // '<![CDATA['
      shift(56);                    // '<![CDATA['
      break;
    case 55:                        // '<!--'
      shift(55);                    // '<!--'
      break;
    case 18:                        // PredefinedEntityRef
      shift(18);                    // PredefinedEntityRef
      break;
    case 29:                        // CharRef
      shift(29);                    // CharRef
      break;
    case 273:                       // '{{'
      shift(273);                   // '{{'
      break;
    case 276:                       // '}}'
      shift(276);                   // '}}'
      break;
    case 272:                       // '{'
      shift(272);                   // '{'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("TagContent", e0);
  };

  this.parse_AposAttr = function()
  {
    eventHandler.startNonterminal("AposAttr", e0);
    lookahead1(10);                 // PredefinedEntityRef | EscapeApos | AposAttrContentChar | CharRef | EOF | "'" |
    switch (l1)
    {
    case 20:                        // EscapeApos
      shift(20);                    // EscapeApos
      break;
    case 25:                        // AposAttrContentChar
      shift(25);                    // AposAttrContentChar
      break;
    case 18:                        // PredefinedEntityRef
      shift(18);                    // PredefinedEntityRef
      break;
    case 29:                        // CharRef
      shift(29);                    // CharRef
      break;
    case 273:                       // '{{'
      shift(273);                   // '{{'
      break;
    case 276:                       // '}}'
      shift(276);                   // '}}'
      break;
    case 272:                       // '{'
      shift(272);                   // '{'
      break;
    case 39:                        // "'"
      shift(39);                    // "'"
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("AposAttr", e0);
  };

  this.parse_QuotAttr = function()
  {
    eventHandler.startNonterminal("QuotAttr", e0);
    lookahead1(9);                  // PredefinedEntityRef | EscapeQuot | QuotAttrContentChar | CharRef | EOF | '"' |
    switch (l1)
    {
    case 19:                        // EscapeQuot
      shift(19);                    // EscapeQuot
      break;
    case 24:                        // QuotAttrContentChar
      shift(24);                    // QuotAttrContentChar
      break;
    case 18:                        // PredefinedEntityRef
      shift(18);                    // PredefinedEntityRef
      break;
    case 29:                        // CharRef
      shift(29);                    // CharRef
      break;
    case 273:                       // '{{'
      shift(273);                   // '{{'
      break;
    case 276:                       // '}}'
      shift(276);                   // '}}'
      break;
    case 272:                       // '{'
      shift(272);                   // '{'
      break;
    case 35:                        // '"'
      shift(35);                    // '"'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("QuotAttr", e0);
  };

  this.parse_CData = function()
  {
    eventHandler.startNonterminal("CData", e0);
    lookahead1(1);                  // CDataSectionContents | EOF | ']]>'
    switch (l1)
    {
    case 11:                        // CDataSectionContents
      shift(11);                    // CDataSectionContents
      break;
    case 65:                        // ']]>'
      shift(65);                    // ']]>'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("CData", e0);
  };

  this.parse_XMLComment = function()
  {
    eventHandler.startNonterminal("XMLComment", e0);
    lookahead1(0);                  // DirCommentContents | EOF | '-->'
    switch (l1)
    {
    case 9:                         // DirCommentContents
      shift(9);                     // DirCommentContents
      break;
    case 48:                        // '-->'
      shift(48);                    // '-->'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("XMLComment", e0);
  };

  this.parse_PI = function()
  {
    eventHandler.startNonterminal("PI", e0);
    lookahead1(3);                  // DirPIContents | EOF | '?' | '?>'
    switch (l1)
    {
    case 10:                        // DirPIContents
      shift(10);                    // DirPIContents
      break;
    case 60:                        // '?'
      shift(60);                    // '?'
      break;
    case 61:                        // '?>'
      shift(61);                    // '?>'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("PI", e0);
  };

  this.parse_Pragma = function()
  {
    eventHandler.startNonterminal("Pragma", e0);
    lookahead1(2);                  // PragmaContents | EOF | '#' | '#)'
    switch (l1)
    {
    case 8:                         // PragmaContents
      shift(8);                     // PragmaContents
      break;
    case 36:                        // '#'
      shift(36);                    // '#'
      break;
    case 37:                        // '#)'
      shift(37);                    // '#)'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("Pragma", e0);
  };

  this.parse_Comment = function()
  {
    eventHandler.startNonterminal("Comment", e0);
    lookahead1(4);                  // CommentContents | EOF | '(:' | ':)'
    switch (l1)
    {
    case 53:                        // ':)'
      shift(53);                    // ':)'
      break;
    case 42:                        // '(:'
      shift(42);                    // '(:'
      break;
    case 30:                        // CommentContents
      shift(30);                    // CommentContents
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("Comment", e0);
  };

  this.parse_CommentDoc = function()
  {
    eventHandler.startNonterminal("CommentDoc", e0);
    lookahead1(5);                  // DocTag | DocCommentContents | EOF | '(:' | ':)'
    switch (l1)
    {
    case 31:                        // DocTag
      shift(31);                    // DocTag
      break;
    case 32:                        // DocCommentContents
      shift(32);                    // DocCommentContents
      break;
    case 53:                        // ':)'
      shift(53);                    // ':)'
      break;
    case 42:                        // '(:'
      shift(42);                    // '(:'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("CommentDoc", e0);
  };

  this.parse_QuotString = function()
  {
    eventHandler.startNonterminal("QuotString", e0);
    lookahead1(6);                  // PredefinedEntityRef | EscapeQuot | QuotChar | CharRef | EOF | '"'
    switch (l1)
    {
    case 18:                        // PredefinedEntityRef
      shift(18);                    // PredefinedEntityRef
      break;
    case 29:                        // CharRef
      shift(29);                    // CharRef
      break;
    case 19:                        // EscapeQuot
      shift(19);                    // EscapeQuot
      break;
    case 21:                        // QuotChar
      shift(21);                    // QuotChar
      break;
    case 35:                        // '"'
      shift(35);                    // '"'
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("QuotString", e0);
  };

  this.parse_AposString = function()
  {
    eventHandler.startNonterminal("AposString", e0);
    lookahead1(7);                  // PredefinedEntityRef | EscapeApos | AposChar | CharRef | EOF | "'"
    switch (l1)
    {
    case 18:                        // PredefinedEntityRef
      shift(18);                    // PredefinedEntityRef
      break;
    case 29:                        // CharRef
      shift(29);                    // CharRef
      break;
    case 20:                        // EscapeApos
      shift(20);                    // EscapeApos
      break;
    case 22:                        // AposChar
      shift(22);                    // AposChar
      break;
    case 39:                        // "'"
      shift(39);                    // "'"
      break;
    default:
      shift(33);                    // EOF
    }
    eventHandler.endNonterminal("AposString", e0);
  };

  this.parse_Prefix = function()
  {
    eventHandler.startNonterminal("Prefix", e0);
    lookahead1W(13);                // NCName^Token | S^WS | 'after' | 'allowing' | 'ancestor' | 'ancestor-or-self' |
    whitespace();
    parse_NCName();
    eventHandler.endNonterminal("Prefix", e0);
  };

  this.parse__EQName = function()
  {
    eventHandler.startNonterminal("_EQName", e0);
    lookahead1W(12);                // EQName^Token | S^WS | 'after' | 'allowing' | 'ancestor' | 'ancestor-or-self' |
    whitespace();
    parse_EQName();
    eventHandler.endNonterminal("_EQName", e0);
  };

  function parse_EQName()
  {
    eventHandler.startNonterminal("EQName", e0);
    switch (l1)
    {
    case 78:                        // 'attribute'
      shift(78);                    // 'attribute'
      break;
    case 92:                        // 'comment'
      shift(92);                    // 'comment'
      break;
    case 116:                       // 'document-node'
      shift(116);                   // 'document-node'
      break;
    case 117:                       // 'element'
      shift(117);                   // 'element'
      break;
    case 120:                       // 'empty-sequence'
      shift(120);                   // 'empty-sequence'
      break;
    case 141:                       // 'function'
      shift(141);                   // 'function'
      break;
    case 148:                       // 'if'
      shift(148);                   // 'if'
      break;
    case 161:                       // 'item'
      shift(161);                   // 'item'
      break;
    case 181:                       // 'namespace-node'
      shift(181);                   // 'namespace-node'
      break;
    case 187:                       // 'node'
      shift(187);                   // 'node'
      break;
    case 212:                       // 'processing-instruction'
      shift(212);                   // 'processing-instruction'
      break;
    case 222:                       // 'schema-attribute'
      shift(222);                   // 'schema-attribute'
      break;
    case 223:                       // 'schema-element'
      shift(223);                   // 'schema-element'
      break;
    case 239:                       // 'switch'
      shift(239);                   // 'switch'
      break;
    case 240:                       // 'text'
      shift(240);                   // 'text'
      break;
    case 249:                       // 'typeswitch'
      shift(249);                   // 'typeswitch'
      break;
    default:
      parse_FunctionName();
    }
    eventHandler.endNonterminal("EQName", e0);
  }

  function parse_FunctionName()
  {
    eventHandler.startNonterminal("FunctionName", e0);
    switch (l1)
    {
    case 14:                        // EQName^Token
      shift(14);                    // EQName^Token
      break;
    case 66:                        // 'after'
      shift(66);                    // 'after'
      break;
    case 69:                        // 'ancestor'
      shift(69);                    // 'ancestor'
      break;
    case 70:                        // 'ancestor-or-self'
      shift(70);                    // 'ancestor-or-self'
      break;
    case 71:                        // 'and'
      shift(71);                    // 'and'
      break;
    case 75:                        // 'as'
      shift(75);                    // 'as'
      break;
    case 76:                        // 'ascending'
      shift(76);                    // 'ascending'
      break;
    case 80:                        // 'before'
      shift(80);                    // 'before'
      break;
    case 84:                        // 'case'
      shift(84);                    // 'case'
      break;
    case 85:                        // 'cast'
      shift(85);                    // 'cast'
      break;
    case 86:                        // 'castable'
      shift(86);                    // 'castable'
      break;
    case 89:                        // 'child'
      shift(89);                    // 'child'
      break;
    case 90:                        // 'collation'
      shift(90);                    // 'collation'
      break;
    case 99:                        // 'copy'
      shift(99);                    // 'copy'
      break;
    case 101:                       // 'count'
      shift(101);                   // 'count'
      break;
    case 104:                       // 'declare'
      shift(104);                   // 'declare'
      break;
    case 105:                       // 'default'
      shift(105);                   // 'default'
      break;
    case 106:                       // 'delete'
      shift(106);                   // 'delete'
      break;
    case 107:                       // 'descendant'
      shift(107);                   // 'descendant'
      break;
    case 108:                       // 'descendant-or-self'
      shift(108);                   // 'descendant-or-self'
      break;
    case 109:                       // 'descending'
      shift(109);                   // 'descending'
      break;
    case 114:                       // 'div'
      shift(114);                   // 'div'
      break;
    case 115:                       // 'document'
      shift(115);                   // 'document'
      break;
    case 118:                       // 'else'
      shift(118);                   // 'else'
      break;
    case 119:                       // 'empty'
      shift(119);                   // 'empty'
      break;
    case 122:                       // 'end'
      shift(122);                   // 'end'
      break;
    case 124:                       // 'eq'
      shift(124);                   // 'eq'
      break;
    case 125:                       // 'every'
      shift(125);                   // 'every'
      break;
    case 127:                       // 'except'
      shift(127);                   // 'except'
      break;
    case 130:                       // 'first'
      shift(130);                   // 'first'
      break;
    case 131:                       // 'following'
      shift(131);                   // 'following'
      break;
    case 132:                       // 'following-sibling'
      shift(132);                   // 'following-sibling'
      break;
    case 133:                       // 'for'
      shift(133);                   // 'for'
      break;
    case 142:                       // 'ge'
      shift(142);                   // 'ge'
      break;
    case 144:                       // 'group'
      shift(144);                   // 'group'
      break;
    case 146:                       // 'gt'
      shift(146);                   // 'gt'
      break;
    case 147:                       // 'idiv'
      shift(147);                   // 'idiv'
      break;
    case 149:                       // 'import'
      shift(149);                   // 'import'
      break;
    case 155:                       // 'insert'
      shift(155);                   // 'insert'
      break;
    case 156:                       // 'instance'
      shift(156);                   // 'instance'
      break;
    case 158:                       // 'intersect'
      shift(158);                   // 'intersect'
      break;
    case 159:                       // 'into'
      shift(159);                   // 'into'
      break;
    case 160:                       // 'is'
      shift(160);                   // 'is'
      break;
    case 166:                       // 'last'
      shift(166);                   // 'last'
      break;
    case 168:                       // 'le'
      shift(168);                   // 'le'
      break;
    case 170:                       // 'let'
      shift(170);                   // 'let'
      break;
    case 174:                       // 'lt'
      shift(174);                   // 'lt'
      break;
    case 176:                       // 'mod'
      shift(176);                   // 'mod'
      break;
    case 177:                       // 'modify'
      shift(177);                   // 'modify'
      break;
    case 178:                       // 'module'
      shift(178);                   // 'module'
      break;
    case 180:                       // 'namespace'
      shift(180);                   // 'namespace'
      break;
    case 182:                       // 'ne'
      shift(182);                   // 'ne'
      break;
    case 194:                       // 'only'
      shift(194);                   // 'only'
      break;
    case 196:                       // 'or'
      shift(196);                   // 'or'
      break;
    case 197:                       // 'order'
      shift(197);                   // 'order'
      break;
    case 198:                       // 'ordered'
      shift(198);                   // 'ordered'
      break;
    case 202:                       // 'parent'
      shift(202);                   // 'parent'
      break;
    case 208:                       // 'preceding'
      shift(208);                   // 'preceding'
      break;
    case 209:                       // 'preceding-sibling'
      shift(209);                   // 'preceding-sibling'
      break;
    case 214:                       // 'rename'
      shift(214);                   // 'rename'
      break;
    case 215:                       // 'replace'
      shift(215);                   // 'replace'
      break;
    case 216:                       // 'return'
      shift(216);                   // 'return'
      break;
    case 220:                       // 'satisfies'
      shift(220);                   // 'satisfies'
      break;
    case 225:                       // 'self'
      shift(225);                   // 'self'
      break;
    case 231:                       // 'some'
      shift(231);                   // 'some'
      break;
    case 232:                       // 'stable'
      shift(232);                   // 'stable'
      break;
    case 233:                       // 'start'
      shift(233);                   // 'start'
      break;
    case 244:                       // 'to'
      shift(244);                   // 'to'
      break;
    case 245:                       // 'treat'
      shift(245);                   // 'treat'
      break;
    case 246:                       // 'try'
      shift(246);                   // 'try'
      break;
    case 250:                       // 'union'
      shift(250);                   // 'union'
      break;
    case 252:                       // 'unordered'
      shift(252);                   // 'unordered'
      break;
    case 256:                       // 'validate'
      shift(256);                   // 'validate'
      break;
    case 262:                       // 'where'
      shift(262);                   // 'where'
      break;
    case 266:                       // 'with'
      shift(266);                   // 'with'
      break;
    case 270:                       // 'xquery'
      shift(270);                   // 'xquery'
      break;
    case 68:                        // 'allowing'
      shift(68);                    // 'allowing'
      break;
    case 77:                        // 'at'
      shift(77);                    // 'at'
      break;
    case 79:                        // 'base-uri'
      shift(79);                    // 'base-uri'
      break;
    case 81:                        // 'boundary-space'
      shift(81);                    // 'boundary-space'
      break;
    case 82:                        // 'break'
      shift(82);                    // 'break'
      break;
    case 87:                        // 'catch'
      shift(87);                    // 'catch'
      break;
    case 94:                        // 'construction'
      shift(94);                    // 'construction'
      break;
    case 97:                        // 'context'
      shift(97);                    // 'context'
      break;
    case 98:                        // 'continue'
      shift(98);                    // 'continue'
      break;
    case 100:                       // 'copy-namespaces'
      shift(100);                   // 'copy-namespaces'
      break;
    case 102:                       // 'decimal-format'
      shift(102);                   // 'decimal-format'
      break;
    case 121:                       // 'encoding'
      shift(121);                   // 'encoding'
      break;
    case 128:                       // 'exit'
      shift(128);                   // 'exit'
      break;
    case 129:                       // 'external'
      shift(129);                   // 'external'
      break;
    case 137:                       // 'ft-option'
      shift(137);                   // 'ft-option'
      break;
    case 150:                       // 'in'
      shift(150);                   // 'in'
      break;
    case 151:                       // 'index'
      shift(151);                   // 'index'
      break;
    case 157:                       // 'integrity'
      shift(157);                   // 'integrity'
      break;
    case 167:                       // 'lax'
      shift(167);                   // 'lax'
      break;
    case 188:                       // 'nodes'
      shift(188);                   // 'nodes'
      break;
    case 195:                       // 'option'
      shift(195);                   // 'option'
      break;
    case 199:                       // 'ordering'
      shift(199);                   // 'ordering'
      break;
    case 218:                       // 'revalidation'
      shift(218);                   // 'revalidation'
      break;
    case 221:                       // 'schema'
      shift(221);                   // 'schema'
      break;
    case 224:                       // 'score'
      shift(224);                   // 'score'
      break;
    case 230:                       // 'sliding'
      shift(230);                   // 'sliding'
      break;
    case 236:                       // 'strict'
      shift(236);                   // 'strict'
      break;
    case 247:                       // 'tumbling'
      shift(247);                   // 'tumbling'
      break;
    case 248:                       // 'type'
      shift(248);                   // 'type'
      break;
    case 253:                       // 'updating'
      shift(253);                   // 'updating'
      break;
    case 257:                       // 'value'
      shift(257);                   // 'value'
      break;
    case 258:                       // 'variable'
      shift(258);                   // 'variable'
      break;
    case 259:                       // 'version'
      shift(259);                   // 'version'
      break;
    case 263:                       // 'while'
      shift(263);                   // 'while'
      break;
    case 93:                        // 'constraint'
      shift(93);                    // 'constraint'
      break;
    case 172:                       // 'loop'
      shift(172);                   // 'loop'
      break;
    default:
      shift(217);                   // 'returning'
    }
    eventHandler.endNonterminal("FunctionName", e0);
  }

  function parse_NCName()
  {
    eventHandler.startNonterminal("NCName", e0);
    switch (l1)
    {
    case 26:                        // NCName^Token
      shift(26);                    // NCName^Token
      break;
    case 66:                        // 'after'
      shift(66);                    // 'after'
      break;
    case 71:                        // 'and'
      shift(71);                    // 'and'
      break;
    case 75:                        // 'as'
      shift(75);                    // 'as'
      break;
    case 76:                        // 'ascending'
      shift(76);                    // 'ascending'
      break;
    case 80:                        // 'before'
      shift(80);                    // 'before'
      break;
    case 84:                        // 'case'
      shift(84);                    // 'case'
      break;
    case 85:                        // 'cast'
      shift(85);                    // 'cast'
      break;
    case 86:                        // 'castable'
      shift(86);                    // 'castable'
      break;
    case 90:                        // 'collation'
      shift(90);                    // 'collation'
      break;
    case 101:                       // 'count'
      shift(101);                   // 'count'
      break;
    case 105:                       // 'default'
      shift(105);                   // 'default'
      break;
    case 109:                       // 'descending'
      shift(109);                   // 'descending'
      break;
    case 114:                       // 'div'
      shift(114);                   // 'div'
      break;
    case 118:                       // 'else'
      shift(118);                   // 'else'
      break;
    case 119:                       // 'empty'
      shift(119);                   // 'empty'
      break;
    case 122:                       // 'end'
      shift(122);                   // 'end'
      break;
    case 124:                       // 'eq'
      shift(124);                   // 'eq'
      break;
    case 127:                       // 'except'
      shift(127);                   // 'except'
      break;
    case 133:                       // 'for'
      shift(133);                   // 'for'
      break;
    case 142:                       // 'ge'
      shift(142);                   // 'ge'
      break;
    case 144:                       // 'group'
      shift(144);                   // 'group'
      break;
    case 146:                       // 'gt'
      shift(146);                   // 'gt'
      break;
    case 147:                       // 'idiv'
      shift(147);                   // 'idiv'
      break;
    case 156:                       // 'instance'
      shift(156);                   // 'instance'
      break;
    case 158:                       // 'intersect'
      shift(158);                   // 'intersect'
      break;
    case 159:                       // 'into'
      shift(159);                   // 'into'
      break;
    case 160:                       // 'is'
      shift(160);                   // 'is'
      break;
    case 168:                       // 'le'
      shift(168);                   // 'le'
      break;
    case 170:                       // 'let'
      shift(170);                   // 'let'
      break;
    case 174:                       // 'lt'
      shift(174);                   // 'lt'
      break;
    case 176:                       // 'mod'
      shift(176);                   // 'mod'
      break;
    case 177:                       // 'modify'
      shift(177);                   // 'modify'
      break;
    case 182:                       // 'ne'
      shift(182);                   // 'ne'
      break;
    case 194:                       // 'only'
      shift(194);                   // 'only'
      break;
    case 196:                       // 'or'
      shift(196);                   // 'or'
      break;
    case 197:                       // 'order'
      shift(197);                   // 'order'
      break;
    case 216:                       // 'return'
      shift(216);                   // 'return'
      break;
    case 220:                       // 'satisfies'
      shift(220);                   // 'satisfies'
      break;
    case 232:                       // 'stable'
      shift(232);                   // 'stable'
      break;
    case 233:                       // 'start'
      shift(233);                   // 'start'
      break;
    case 244:                       // 'to'
      shift(244);                   // 'to'
      break;
    case 245:                       // 'treat'
      shift(245);                   // 'treat'
      break;
    case 250:                       // 'union'
      shift(250);                   // 'union'
      break;
    case 262:                       // 'where'
      shift(262);                   // 'where'
      break;
    case 266:                       // 'with'
      shift(266);                   // 'with'
      break;
    case 69:                        // 'ancestor'
      shift(69);                    // 'ancestor'
      break;
    case 70:                        // 'ancestor-or-self'
      shift(70);                    // 'ancestor-or-self'
      break;
    case 78:                        // 'attribute'
      shift(78);                    // 'attribute'
      break;
    case 89:                        // 'child'
      shift(89);                    // 'child'
      break;
    case 92:                        // 'comment'
      shift(92);                    // 'comment'
      break;
    case 99:                        // 'copy'
      shift(99);                    // 'copy'
      break;
    case 104:                       // 'declare'
      shift(104);                   // 'declare'
      break;
    case 106:                       // 'delete'
      shift(106);                   // 'delete'
      break;
    case 107:                       // 'descendant'
      shift(107);                   // 'descendant'
      break;
    case 108:                       // 'descendant-or-self'
      shift(108);                   // 'descendant-or-self'
      break;
    case 115:                       // 'document'
      shift(115);                   // 'document'
      break;
    case 116:                       // 'document-node'
      shift(116);                   // 'document-node'
      break;
    case 117:                       // 'element'
      shift(117);                   // 'element'
      break;
    case 120:                       // 'empty-sequence'
      shift(120);                   // 'empty-sequence'
      break;
    case 125:                       // 'every'
      shift(125);                   // 'every'
      break;
    case 130:                       // 'first'
      shift(130);                   // 'first'
      break;
    case 131:                       // 'following'
      shift(131);                   // 'following'
      break;
    case 132:                       // 'following-sibling'
      shift(132);                   // 'following-sibling'
      break;
    case 141:                       // 'function'
      shift(141);                   // 'function'
      break;
    case 148:                       // 'if'
      shift(148);                   // 'if'
      break;
    case 149:                       // 'import'
      shift(149);                   // 'import'
      break;
    case 155:                       // 'insert'
      shift(155);                   // 'insert'
      break;
    case 161:                       // 'item'
      shift(161);                   // 'item'
      break;
    case 166:                       // 'last'
      shift(166);                   // 'last'
      break;
    case 178:                       // 'module'
      shift(178);                   // 'module'
      break;
    case 180:                       // 'namespace'
      shift(180);                   // 'namespace'
      break;
    case 181:                       // 'namespace-node'
      shift(181);                   // 'namespace-node'
      break;
    case 187:                       // 'node'
      shift(187);                   // 'node'
      break;
    case 198:                       // 'ordered'
      shift(198);                   // 'ordered'
      break;
    case 202:                       // 'parent'
      shift(202);                   // 'parent'
      break;
    case 208:                       // 'preceding'
      shift(208);                   // 'preceding'
      break;
    case 209:                       // 'preceding-sibling'
      shift(209);                   // 'preceding-sibling'
      break;
    case 212:                       // 'processing-instruction'
      shift(212);                   // 'processing-instruction'
      break;
    case 214:                       // 'rename'
      shift(214);                   // 'rename'
      break;
    case 215:                       // 'replace'
      shift(215);                   // 'replace'
      break;
    case 222:                       // 'schema-attribute'
      shift(222);                   // 'schema-attribute'
      break;
    case 223:                       // 'schema-element'
      shift(223);                   // 'schema-element'
      break;
    case 225:                       // 'self'
      shift(225);                   // 'self'
      break;
    case 231:                       // 'some'
      shift(231);                   // 'some'
      break;
    case 239:                       // 'switch'
      shift(239);                   // 'switch'
      break;
    case 240:                       // 'text'
      shift(240);                   // 'text'
      break;
    case 246:                       // 'try'
      shift(246);                   // 'try'
      break;
    case 249:                       // 'typeswitch'
      shift(249);                   // 'typeswitch'
      break;
    case 252:                       // 'unordered'
      shift(252);                   // 'unordered'
      break;
    case 256:                       // 'validate'
      shift(256);                   // 'validate'
      break;
    case 258:                       // 'variable'
      shift(258);                   // 'variable'
      break;
    case 270:                       // 'xquery'
      shift(270);                   // 'xquery'
      break;
    case 68:                        // 'allowing'
      shift(68);                    // 'allowing'
      break;
    case 77:                        // 'at'
      shift(77);                    // 'at'
      break;
    case 79:                        // 'base-uri'
      shift(79);                    // 'base-uri'
      break;
    case 81:                        // 'boundary-space'
      shift(81);                    // 'boundary-space'
      break;
    case 82:                        // 'break'
      shift(82);                    // 'break'
      break;
    case 87:                        // 'catch'
      shift(87);                    // 'catch'
      break;
    case 94:                        // 'construction'
      shift(94);                    // 'construction'
      break;
    case 97:                        // 'context'
      shift(97);                    // 'context'
      break;
    case 98:                        // 'continue'
      shift(98);                    // 'continue'
      break;
    case 100:                       // 'copy-namespaces'
      shift(100);                   // 'copy-namespaces'
      break;
    case 102:                       // 'decimal-format'
      shift(102);                   // 'decimal-format'
      break;
    case 121:                       // 'encoding'
      shift(121);                   // 'encoding'
      break;
    case 128:                       // 'exit'
      shift(128);                   // 'exit'
      break;
    case 129:                       // 'external'
      shift(129);                   // 'external'
      break;
    case 137:                       // 'ft-option'
      shift(137);                   // 'ft-option'
      break;
    case 150:                       // 'in'
      shift(150);                   // 'in'
      break;
    case 151:                       // 'index'
      shift(151);                   // 'index'
      break;
    case 157:                       // 'integrity'
      shift(157);                   // 'integrity'
      break;
    case 167:                       // 'lax'
      shift(167);                   // 'lax'
      break;
    case 188:                       // 'nodes'
      shift(188);                   // 'nodes'
      break;
    case 195:                       // 'option'
      shift(195);                   // 'option'
      break;
    case 199:                       // 'ordering'
      shift(199);                   // 'ordering'
      break;
    case 218:                       // 'revalidation'
      shift(218);                   // 'revalidation'
      break;
    case 221:                       // 'schema'
      shift(221);                   // 'schema'
      break;
    case 224:                       // 'score'
      shift(224);                   // 'score'
      break;
    case 230:                       // 'sliding'
      shift(230);                   // 'sliding'
      break;
    case 236:                       // 'strict'
      shift(236);                   // 'strict'
      break;
    case 247:                       // 'tumbling'
      shift(247);                   // 'tumbling'
      break;
    case 248:                       // 'type'
      shift(248);                   // 'type'
      break;
    case 253:                       // 'updating'
      shift(253);                   // 'updating'
      break;
    case 257:                       // 'value'
      shift(257);                   // 'value'
      break;
    case 259:                       // 'version'
      shift(259);                   // 'version'
      break;
    case 263:                       // 'while'
      shift(263);                   // 'while'
      break;
    case 93:                        // 'constraint'
      shift(93);                    // 'constraint'
      break;
    case 172:                       // 'loop'
      shift(172);                   // 'loop'
      break;
    default:
      shift(217);                   // 'returning'
    }
    eventHandler.endNonterminal("NCName", e0);
  }

  function shift(t)
  {
    if (l1 == t)
    {
      whitespace();
      eventHandler.terminal(JSONiqTokenizer.TOKEN[l1], b1, e1 > size ? size : e1);
      b0 = b1; e0 = e1; l1 = 0;
    }
    else
    {
      error(b1, e1, 0, l1, t);
    }
  }

  function whitespace()
  {
    if (e0 != b1)
    {
      b0 = e0;
      e0 = b1;
      eventHandler.whitespace(b0, e0);
    }
  }

  function matchW(set)
  {
    var code;
    for (;;)
    {
      code = match(set);
      if (code != 28)               // S^WS
      {
        break;
      }
    }
    return code;
  }

  function lookahead1W(set)
  {
    if (l1 == 0)
    {
      l1 = matchW(set);
      b1 = begin;
      e1 = end;
    }
  }

  function lookahead1(set)
  {
    if (l1 == 0)
    {
      l1 = match(set);
      b1 = begin;
      e1 = end;
    }
  }

  function error(b, e, s, l, t)
  {
    throw new self.ParseException(b, e, s, l, t);
  }

  var lk, b0, e0;
  var l1, b1, e1;
  var eventHandler;

  var input;
  var size;
  var begin;
  var end;

  function match(tokenSetId)
  {
    var nonbmp = false;
    begin = end;
    var current = end;
    var result = JSONiqTokenizer.INITIAL[tokenSetId];
    var state = 0;

    for (var code = result & 4095; code != 0; )
    {
      var charclass;
      var c0 = current < size ? input.charCodeAt(current) : 0;
      ++current;
      if (c0 < 0x80)
      {
        charclass = JSONiqTokenizer.MAP0[c0];
      }
      else if (c0 < 0xd800)
      {
        var c1 = c0 >> 4;
        charclass = JSONiqTokenizer.MAP1[(c0 & 15) + JSONiqTokenizer.MAP1[(c1 & 31) + JSONiqTokenizer.MAP1[c1 >> 5]]];
      }
      else
      {
        if (c0 < 0xdc00)
        {
          var c1 = current < size ? input.charCodeAt(current) : 0;
          if (c1 >= 0xdc00 && c1 < 0xe000)
          {
            ++current;
            c0 = ((c0 & 0x3ff) << 10) + (c1 & 0x3ff) + 0x10000;
            nonbmp = true;
          }
        }
        var lo = 0, hi = 5;
        for (var m = 3; ; m = (hi + lo) >> 1)
        {
          if (JSONiqTokenizer.MAP2[m] > c0) hi = m - 1;
          else if (JSONiqTokenizer.MAP2[6 + m] < c0) lo = m + 1;
          else {charclass = JSONiqTokenizer.MAP2[12 + m]; break;}
          if (lo > hi) {charclass = 0; break;}
        }
      }

      state = code;
      var i0 = (charclass << 12) + code - 1;
      code = JSONiqTokenizer.TRANSITION[(i0 & 15) + JSONiqTokenizer.TRANSITION[i0 >> 4]];

      if (code > 4095)
      {
        result = code;
        code &= 4095;
        end = current;
      }
    }

    result >>= 12;
    if (result == 0)
    {
      end = current - 1;
      var c1 = end < size ? input.charCodeAt(end) : 0;
      if (c1 >= 0xdc00 && c1 < 0xe000) --end;
      return error(begin, end, state, -1, -1);
    }

    if (nonbmp)
    {
      for (var i = result >> 9; i > 0; --i)
      {
        --end;
        var c1 = end < size ? input.charCodeAt(end) : 0;
        if (c1 >= 0xdc00 && c1 < 0xe000) --end;
      }
    }
    else
    {
      end -= result >> 9;
    }

    return (result & 511) - 1;
  }
}

JSONiqTokenizer.getTokenSet = function(tokenSetId)
{
  var set = [];
  var s = tokenSetId < 0 ? - tokenSetId : INITIAL[tokenSetId] & 4095;
  for (var i = 0; i < 277; i += 32)
  {
    var j = i;
    var i0 = (i >> 5) * 2062 + s - 1;
    var i1 = i0 >> 2;
    var i2 = i1 >> 2;
    var f = JSONiqTokenizer.EXPECTED[(i0 & 3) + JSONiqTokenizer.EXPECTED[(i1 & 3) + JSONiqTokenizer.EXPECTED[(i2 & 3) + JSONiqTokenizer.EXPECTED[i2 >> 2]]]];
    for ( ; f != 0; f >>>= 1, ++j)
    {
      if ((f & 1) != 0)
      {
        set.push(JSONiqTokenizer.TOKEN[j]);
      }
    }
  }
  return set;
};

JSONiqTokenizer.MAP0 =
[ 66, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 27, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 32, 31, 31, 33, 31, 31, 31, 31, 31, 31, 34, 35, 36, 35, 31, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 31, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 31, 61, 62, 63, 64, 35
];

JSONiqTokenizer.MAP1 =
[ 108, 124, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 156, 181, 181, 181, 181, 181, 214, 215, 213, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 214, 247, 261, 277, 293, 309, 347, 363, 379, 416, 416, 416, 408, 331, 323, 331, 323, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 433, 433, 433, 433, 433, 433, 433, 316, 331, 331, 331, 331, 331, 331, 331, 331, 394, 416, 416, 417, 415, 416, 416, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 416, 330, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 331, 416, 66, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 27, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 35, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 32, 31, 31, 33, 31, 31, 31, 31, 31, 31, 34, 35, 36, 35, 31, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 31, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 31, 61, 62, 63, 64, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 31, 31, 35, 35, 35, 35, 35, 35, 35, 65, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65
];

JSONiqTokenizer.MAP2 =
[ 57344, 63744, 64976, 65008, 65536, 983040, 63743, 64975, 65007, 65533, 983039, 1114111, 35, 31, 35, 31, 31, 35
];

JSONiqTokenizer.INITIAL =
[ 1, 2, 36867, 45060, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
];

JSONiqTokenizer.TRANSITION =
[ 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22890, 18871, 17152, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 17365, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 17494, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 18211, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 17902, 17934, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18077, 36560, 18656, 18093, 18110, 18126, 18171, 18197, 18227, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 18392, 18840, 18453, 18469, 18155, 17393, 18524, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 18614, 21702, 17152, 19051, 19276, 17768, 19051, 28693, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 17365, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 17494, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 18211, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 17902, 17934, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18077, 36560, 18656, 18093, 18110, 18126, 18171, 18197, 18227, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 18392, 18840, 18453, 18469, 18155, 17393, 18524, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 20107, 18871, 18672, 19051, 19276, 21258, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 18798, 18813, 18829, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 18856, 22905, 18949, 19051, 19276, 17593, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18980, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 19097, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 18996, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21834, 18871, 19030, 19051, 19276, 18181, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21687, 18871, 19030, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22411, 20122, 18755, 19051, 19276, 17768, 19051, 17173, 23541, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18141, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 17292, 19154, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 19067, 18871, 18644, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 19124, 22426, 19030, 19051, 19276, 17768, 19051, 19108, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21983, 21998, 19030, 19051, 19276, 17768, 19051, 18725, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22396, 18871, 19030, 19051, 19276, 30675, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 19181, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 19323, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 19215, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21774, 18871, 19030, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 19261, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21642, 18871, 19030, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 19292, 19308, 19350, 18506, 27885, 30525, 24400, 31433, 23339, 18506, 19394, 18506, 18508, 27218, 19413, 27218, 27218, 19435, 24400, 34311, 24400, 24400, 25501, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 28546, 19483, 24400, 24400, 24400, 24400, 24033, 18048, 24057, 18506, 18506, 18506, 18508, 19511, 27218, 27218, 27218, 27218, 19527, 35539, 19563, 24400, 24400, 24400, 19671, 18506, 35639, 18506, 18506, 23068, 27218, 19581, 27218, 27218, 30780, 24009, 24400, 19603, 24400, 24400, 26774, 18506, 18506, 19370, 27883, 27218, 27218, 19623, 17614, 24014, 24400, 24400, 19643, 25699, 18506, 18506, 28527, 27218, 27219, 24013, 19663, 19911, 28435, 18926, 18507, 19687, 27218, 24341, 35860, 19911, 31007, 19737, 19419, 19760, 22275, 19778, 22089, 19794, 35170, 19819, 19840, 19860, 19883, 25810, 34264, 24132, 19744, 19899, 31004, 23498, 30997, 28320, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21759, 18871, 19030, 19051, 19276, 17431, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22381, 18871, 19931, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21657, 18871, 19350, 18506, 27885, 30560, 24400, 29192, 21458, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 19959, 24400, 24400, 24400, 24400, 32332, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 28546, 19989, 24400, 24400, 24400, 24400, 31489, 18499, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 20012, 24400, 24400, 24400, 24400, 24400, 33670, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 29539, 29955, 24400, 24400, 24400, 24400, 26130, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 20041, 22950, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 20092, 19082, 20182, 20391, 20874, 17956, 20300, 20843, 25667, 20594, 20484, 20209, 20233, 17189, 17208, 17281, 17756, 20256, 20297, 20319, 20362, 22472, 20767, 20590, 21345, 20625, 20389, 20927, 21223, 17726, 17421, 17447, 17192, 20736, 22441, 20303, 25565, 22452, 20300, 20407, 19007, 20445, 20470, 21333, 21041, 20500, 17699, 20346, 21147, 17567, 17583, 17609, 22479, 20530, 19547, 20270, 20546, 20281, 20454, 20575, 20610, 20217, 20641, 17685, 20514, 17715, 17742, 17784, 19537, 20669, 20682, 22462, 21017, 21087, 19014, 21101, 20698, 20726, 18380, 17807, 17886, 17614, 25552, 20373, 20752, 20802, 20193, 20818, 21392, 20653, 17988, 18033, 18584, 20834, 20559, 25576, 20859, 20890, 18126, 18171, 20906, 20943, 21003, 21033, 21057, 18293, 21073, 18598, 21117, 21133, 21197, 21172, 20920, 20873, 21161, 21213, 21249, 21274, 21181, 20240, 17405, 21286, 21302, 21318, 20710, 20334, 21361, 21377, 21408, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21968, 18871, 19030, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 21443, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 21495, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 36516, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 28683, 21937, 17641, 36488, 18277, 17237, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 21566, 21525, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 21551, 30652, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21789, 18871, 21603, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21627, 18871, 19030, 19051, 19276, 21233, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21744, 19139, 21894, 19051, 19276, 17768, 19051, 19334, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 17379, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 21922, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 18334, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21953, 18629, 19030, 19051, 19276, 22034, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21672, 21849, 19030, 19051, 19276, 17768, 19051, 21535, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 30637, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 31489, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 32269, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 21422, 24400, 24400, 24400, 24400, 26130, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 22187, 22950, 24400, 24400, 24400, 22244, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 30637, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 31489, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 31170, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 21422, 24400, 24400, 24400, 24400, 26130, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 22187, 22950, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 31660, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 31489, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 31170, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 21422, 24400, 24400, 24400, 24400, 26130, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 22187, 22950, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 30637, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 33573, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 31170, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 21422, 24400, 24400, 24400, 24400, 26130, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 22187, 22950, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 34084, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22261, 24400, 24400, 24400, 24400, 30637, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 31489, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 31170, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 21422, 24400, 24400, 24400, 24400, 26130, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 22187, 22950, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 18901, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 24033, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22306, 18871, 22050, 18506, 27885, 34973, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 18901, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 24033, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 18901, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 24033, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 34452, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22336, 18871, 19030, 19051, 19276, 17768, 19051, 17173, 27093, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 19943, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21819, 18871, 19030, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22291, 22495, 19030, 19051, 19276, 17768, 19051, 19165, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 22526, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22590, 18871, 22970, 22986, 27613, 23002, 23018, 23049, 22078, 18506, 18506, 18506, 23065, 27218, 27218, 27218, 23084, 22112, 24400, 24400, 24400, 23104, 31375, 31098, 19717, 18506, 28128, 28241, 19467, 35061, 27218, 27218, 23124, 23155, 23171, 23194, 24400, 24400, 23228, 35346, 31675, 23244, 18506, 23272, 23290, 27811, 26728, 23309, 35230, 34895, 33356, 23328, 18247, 23375, 32724, 23965, 24400, 23396, 35271, 23445, 18506, 33900, 23424, 23464, 27218, 27218, 23514, 23534, 21422, 23557, 24400, 24400, 23586, 26130, 23617, 23639, 18506, 33460, 23667, 32891, 27218, 22187, 18886, 23718, 36605, 24400, 18505, 23747, 32617, 27218, 23766, 23784, 20071, 32985, 24383, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 23800, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 28233, 31811, 23820, 26941, 34932, 23847, 26517, 25809, 23875, 23911, 23498, 30997, 22096, 19462, 27972, 19702, 29828, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22605, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 30637, 18506, 18506, 18506, 18506, 28918, 25810, 27218, 27218, 27218, 34035, 23930, 22164, 24400, 24400, 24400, 28409, 23946, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 31170, 26607, 18506, 18506, 18506, 31601, 23981, 27218, 27218, 27218, 24002, 22201, 24030, 24400, 24400, 24400, 24049, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 22187, 22950, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 26520, 24073, 24123, 24148, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22620, 18871, 22050, 19721, 27885, 24182, 24400, 24198, 24214, 26616, 18506, 18506, 18508, 24249, 24265, 27218, 27218, 22112, 24284, 24300, 24400, 24400, 30637, 19824, 35443, 36015, 32625, 18506, 25810, 24319, 28975, 23768, 27218, 35026, 22164, 24357, 32056, 26853, 24399, 31489, 31675, 18506, 18506, 18506, 24800, 18508, 27218, 27218, 27218, 27218, 24417, 19527, 24400, 24400, 24400, 24400, 20158, 31170, 18506, 18506, 18506, 27861, 23068, 27218, 27218, 33518, 27218, 30780, 21422, 24400, 24400, 22954, 24400, 26130, 18506, 36262, 18506, 27883, 27218, 24439, 27218, 22187, 22950, 24400, 24458, 24400, 36778, 28454, 18506, 34482, 34524, 35787, 24477, 24401, 24493, 25693, 18506, 36236, 27218, 27218, 24514, 30970, 23731, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 24537, 31006, 27884, 34267, 30106, 23359, 24562, 19880, 25809, 19803, 31004, 23498, 26168, 22096, 19462, 29840, 24578, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22635, 18871, 22050, 25783, 22148, 25341, 23178, 29192, 24613, 24107, 23623, 24672, 26138, 24696, 24442, 24712, 28567, 22112, 24747, 24461, 24763, 23380, 30637, 18506, 18506, 18506, 18506, 24797, 25810, 27218, 27218, 27218, 34226, 35026, 22164, 24400, 24400, 24400, 33275, 31489, 22541, 24103, 24229, 18506, 18506, 34924, 24816, 30435, 27218, 27218, 32434, 19527, 29797, 35081, 24400, 24400, 19915, 31170, 24851, 18506, 18506, 24870, 29230, 27218, 27218, 32022, 27218, 30780, 35360, 24400, 24400, 31560, 24400, 26130, 33114, 27830, 27018, 27883, 34684, 25641, 24887, 22187, 22950, 19238, 34547, 24905, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 18506, 33631, 27218, 27218, 24923, 24946, 23570, 31007, 18508, 27218, 31818, 22215, 19490, 23068, 23312, 19871, 30893, 31031, 24971, 19883, 24999, 34264, 30887, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 25015, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22650, 18871, 25040, 25056, 31309, 25072, 25088, 25104, 22078, 34750, 24233, 36269, 34824, 32653, 25120, 23088, 32864, 22261, 36639, 25136, 30695, 27372, 30637, 25152, 26471, 25190, 25224, 22556, 23256, 25240, 25256, 25272, 25322, 25357, 25373, 25434, 25462, 25486, 26755, 25538, 31675, 23651, 25592, 27414, 25609, 28608, 25961, 25633, 27218, 32562, 27311, 25657, 25866, 25683, 24400, 34774, 25715, 25732, 22568, 27803, 30237, 25772, 25805, 25826, 25844, 28349, 29004, 30780, 21509, 33421, 25864, 25882, 25920, 26130, 31243, 26693, 30183, 27883, 25957, 25977, 27218, 22187, 22950, 25993, 26013, 24400, 23410, 27791, 25756, 25286, 26029, 26064, 26080, 26120, 26154, 26194, 26227, 26246, 26263, 30516, 26396, 26298, 28404, 31007, 33727, 27218, 33661, 26340, 36732, 26369, 26390, 35316, 31006, 26412, 26431, 30943, 26374, 33848, 26458, 26487, 26503, 26536, 23498, 33162, 26555, 26571, 27972, 31282, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22665, 18871, 26592, 26205, 26632, 25341, 26659, 29192, 22078, 26685, 18506, 18506, 18508, 26709, 27218, 27218, 27218, 22112, 26744, 24400, 24400, 24400, 30637, 18506, 18506, 18506, 18506, 26798, 25810, 27218, 27218, 27218, 26274, 35026, 22164, 24400, 24400, 24400, 21587, 31489, 31675, 18506, 18506, 33965, 18506, 18508, 27218, 27218, 25828, 27218, 27218, 19527, 24400, 24400, 24400, 26816, 24400, 31170, 18506, 18506, 18506, 35586, 23068, 27218, 27218, 27218, 26833, 30780, 21422, 24400, 24400, 24400, 26852, 26130, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 22187, 22950, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 35787, 20071, 24401, 19911, 25693, 31898, 18507, 35715, 27218, 19762, 26869, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 26929, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 24983, 31077, 19462, 26969, 27679, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22680, 18871, 27006, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 23033, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 27040, 24400, 24400, 24400, 24400, 24033, 31675, 18506, 18506, 27063, 18506, 18508, 27218, 27218, 27347, 27218, 27218, 27082, 24400, 24400, 29041, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 33973, 27883, 27218, 27218, 27109, 17614, 24014, 24400, 24400, 27130, 27151, 36338, 27169, 27217, 27235, 28375, 18241, 34796, 34421, 27251, 35988, 27284, 27309, 27327, 36056, 34000, 20970, 31867, 21469, 30551, 27363, 32536, 27388, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 26353, 30134, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 27413, 27430, 27452, 27468, 27489, 22078, 18506, 18506, 30187, 18508, 27218, 27218, 27998, 27218, 22112, 24400, 24400, 25716, 24400, 18901, 18506, 18506, 18506, 18506, 18506, 34029, 27218, 27218, 27218, 27218, 29747, 22164, 24400, 24400, 24400, 24400, 27135, 31675, 27505, 18506, 18506, 18506, 18508, 27201, 27218, 27218, 27218, 27218, 19527, 27473, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 27066, 23068, 27218, 27218, 27218, 32485, 30780, 24009, 24400, 24400, 24400, 34998, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 20786, 27218, 29378, 22126, 33956, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22695, 18871, 22050, 27524, 27544, 27569, 35198, 27585, 22078, 29709, 26316, 23274, 27601, 24731, 27629, 27218, 27664, 22112, 36613, 27714, 24400, 27749, 18901, 18506, 27827, 18506, 27846, 22062, 27881, 32210, 27218, 25174, 27901, 27929, 22164, 29474, 24400, 29993, 34408, 26766, 27779, 26905, 18506, 18506, 27268, 29902, 27945, 27218, 27218, 27218, 27997, 28014, 28040, 28061, 24400, 24400, 28078, 28097, 28144, 25522, 28161, 26104, 28176, 27218, 28189, 24656, 28205, 30780, 31512, 24400, 28221, 34170, 36182, 24955, 28257, 28275, 28299, 21479, 33050, 28336, 28365, 17614, 20957, 23108, 28391, 28425, 28111, 28451, 28470, 28490, 28525, 28543, 20025, 33698, 25895, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 30288, 28283, 28562, 28583, 19449, 28599, 23068, 23312, 19871, 19495, 28624, 28669, 31091, 25810, 34264, 19880, 25809, 19803, 29660, 35966, 30334, 22096, 19462, 27972, 23139, 28709, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 18506, 27885, 25341, 24400, 29192, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 18901, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 24033, 22510, 18506, 18506, 18506, 18506, 18508, 25299, 27218, 27218, 27218, 27218, 19527, 29413, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22710, 18871, 28756, 28791, 28826, 28850, 28866, 28889, 28905, 24158, 28952, 31961, 36345, 25306, 28970, 27648, 28991, 29020, 24521, 29036, 25470, 29057, 23033, 27528, 29099, 29119, 30737, 18506, 23494, 29139, 24835, 27218, 29164, 28936, 27040, 29182, 23212, 24400, 29208, 35545, 31675, 18506, 18506, 25617, 32605, 29227, 27218, 27218, 31450, 30716, 29246, 27082, 24400, 24400, 24400, 29271, 29322, 19671, 18506, 33399, 18506, 18506, 23068, 27218, 29349, 27218, 27218, 30780, 24009, 35941, 24400, 24400, 24400, 27733, 36139, 18506, 18506, 29366, 29429, 27218, 35658, 17614, 21427, 29448, 24400, 25997, 18505, 33882, 18506, 27218, 26983, 27219, 24013, 32745, 19911, 25693, 18506, 26913, 27218, 27218, 29467, 23886, 24370, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 31753, 19883, 25810, 34264, 19880, 29490, 29555, 29299, 29597, 29653, 22096, 32549, 29517, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22725, 18871, 22050, 29676, 29528, 25341, 33258, 29192, 29698, 27261, 18506, 29725, 33302, 26990, 27218, 29741, 29763, 22112, 19245, 24400, 32718, 29788, 18901, 26800, 33908, 28474, 18506, 18506, 25810, 29813, 27218, 29856, 27218, 35026, 22164, 35833, 24400, 29875, 24400, 24033, 36772, 25208, 18506, 18506, 29895, 18508, 27218, 29918, 27218, 26048, 27218, 29941, 24400, 29976, 24400, 33610, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 29255, 30009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 31681, 18506, 18506, 19627, 27218, 27219, 24013, 30029, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19973, 19490, 36677, 19587, 19871, 30045, 30144, 30078, 19883, 25810, 30094, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 30122, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22740, 18871, 30168, 30203, 30253, 30304, 30320, 30360, 22078, 35632, 32813, 25789, 18508, 29925, 34112, 26836, 27218, 22112, 24930, 23205, 29211, 24400, 18901, 34460, 30376, 18506, 18506, 18506, 23429, 24723, 27218, 27218, 27218, 35026, 30394, 35006, 24400, 24400, 24400, 24033, 29570, 18506, 18506, 27153, 18506, 31297, 30410, 27218, 27218, 30429, 30582, 19527, 30451, 24400, 24400, 29985, 35694, 19671, 28775, 30471, 35475, 35622, 23068, 28740, 30506, 30541, 30576, 30780, 24009, 20147, 30598, 30622, 30691, 26307, 33442, 28954, 27698, 30711, 23691, 33482, 28509, 17614, 23960, 20429, 34354, 20987, 32347, 26324, 30732, 30753, 24331, 30772, 21579, 36388, 30803, 26669, 24627, 33193, 32464, 30830, 31820, 25446, 25933, 26539, 18508, 28834, 31818, 29285, 19490, 28313, 34256, 23831, 26092, 30858, 30874, 32131, 30909, 30931, 32773, 25809, 30959, 31004, 23498, 30997, 30986, 31023, 27972, 19702, 29505, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22755, 18871, 31047, 31063, 32413, 31114, 31130, 31186, 22078, 18506, 29581, 35593, 36741, 27218, 33232, 31202, 24423, 22112, 24400, 20166, 31218, 34317, 27764, 31234, 33404, 27182, 18506, 29103, 27293, 27218, 31267, 31325, 27218, 31344, 31360, 24400, 31391, 31407, 24400, 31426, 31675, 18506, 36146, 32817, 18506, 18508, 27218, 27218, 31449, 31466, 27218, 19527, 24400, 24400, 31486, 33604, 24400, 32993, 18506, 18506, 18506, 18506, 30054, 27218, 27218, 27218, 27218, 31505, 32260, 24400, 24400, 24400, 24400, 31528, 18506, 28771, 18506, 24650, 35748, 27218, 27218, 28653, 31554, 35804, 24400, 24400, 19361, 32002, 18506, 33224, 25332, 27219, 30013, 29879, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 31576, 19911, 31617, 32385, 33332, 30152, 31645, 19996, 31697, 31742, 31769, 31797, 30062, 31836, 31863, 25810, 34298, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 31883, 30268, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22770, 18871, 22050, 18933, 30490, 31918, 24303, 31934, 31950, 32783, 35278, 27024, 29637, 34119, 19844, 29432, 33339, 22112, 27047, 30455, 29451, 28873, 29612, 18506, 18506, 18506, 31977, 18506, 25810, 27218, 27218, 35054, 27218, 35026, 22164, 24400, 24400, 29405, 24400, 24033, 31995, 18506, 26953, 18506, 18506, 18508, 27218, 31470, 32018, 27218, 27218, 32038, 24400, 33031, 32072, 24400, 24400, 33706, 18506, 18506, 33135, 18506, 23068, 27218, 27218, 27640, 27218, 29772, 32094, 24400, 24400, 34348, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 36707, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 31726, 22171, 33197, 24268, 32119, 31006, 27884, 34267, 19883, 25810, 34264, 30281, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 32154, 32182, 32202, 30842, 33268, 29083, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 23601, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 32226, 24400, 24400, 24400, 24400, 24033, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 32249, 24400, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 33873, 18507, 36073, 27218, 19762, 35305, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22785, 18871, 32285, 31629, 34620, 32301, 32317, 32367, 22078, 18506, 32383, 19378, 32401, 27218, 32429, 27114, 32450, 22112, 24400, 32501, 20076, 32522, 18901, 25412, 23750, 18506, 18506, 32578, 32641, 27218, 32669, 27218, 23680, 32689, 32705, 24400, 32740, 24400, 25904, 32761, 34722, 18506, 27397, 32799, 24593, 24854, 32833, 24889, 32854, 32880, 27218, 32915, 32950, 24400, 32973, 29333, 24400, 30814, 26230, 27694, 33891, 18506, 23068, 36368, 27218, 33009, 27218, 30780, 24009, 32103, 24400, 33029, 24400, 35869, 18506, 18506, 30378, 27981, 27218, 27218, 33770, 17614, 20136, 24400, 24400, 34592, 20782, 18506, 18506, 33047, 27218, 27219, 36175, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 34570, 24166, 33066, 33096, 33130, 27884, 34267, 23859, 26576, 31712, 19880, 25809, 19803, 31004, 23498, 30997, 33151, 22139, 27972, 23479, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22800, 18871, 33178, 28122, 33213, 25341, 33248, 29192, 22078, 33291, 35449, 18506, 18508, 33318, 26415, 33355, 27218, 22112, 33372, 28081, 33420, 24400, 18901, 22245, 18506, 33437, 18506, 18506, 33458, 33476, 24827, 27218, 27218, 26643, 22164, 24774, 35206, 24400, 24400, 25941, 29627, 18506, 18506, 29306, 25202, 33498, 33517, 27218, 27218, 33534, 36292, 19527, 33570, 24400, 24400, 33589, 32506, 19671, 18506, 18506, 31251, 33626, 23068, 27218, 27218, 33647, 27218, 30780, 24009, 24400, 24400, 33686, 24400, 26878, 27508, 18506, 33722, 27883, 32899, 34655, 27218, 17614, 32052, 24781, 23804, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 33743, 36113, 19911, 25693, 18506, 23350, 27218, 29166, 19762, 23886, 35373, 30344, 18508, 33764, 34691, 33786, 19490, 34066, 33840, 31847, 31006, 27884, 34267, 33864, 28929, 33924, 19880, 30485, 33989, 25401, 36049, 34016, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22815, 18871, 34051, 32592, 34100, 34135, 34151, 34186, 34202, 32166, 36021, 31538, 31902, 34218, 34242, 34283, 29350, 34333, 34370, 34394, 34437, 26817, 18901, 26211, 29682, 25418, 18506, 35107, 25810, 34476, 34498, 34520, 25848, 35026, 22164, 34540, 34563, 34586, 19647, 24033, 36670, 35127, 24680, 18506, 32351, 34608, 31328, 34636, 34652, 27218, 34671, 34707, 28062, 34766, 34790, 24400, 33801, 19671, 34812, 32186, 34860, 24597, 33501, 26720, 34844, 34876, 35509, 29148, 36720, 33816, 35384, 32957, 34162, 26774, 34911, 18506, 18506, 34948, 34964, 27218, 33013, 17614, 29960, 34989, 24400, 36312, 25516, 30218, 35891, 35022, 35042, 26282, 20420, 31162, 35077, 35097, 35143, 24639, 28500, 27913, 19762, 35159, 35186, 26178, 28810, 35222, 35246, 33080, 35261, 23068, 23312, 29070, 31006, 27884, 34267, 19883, 25810, 34264, 24546, 25163, 35294, 31781, 35332, 33386, 22096, 19462, 27972, 24088, 28639, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22830, 18871, 22050, 34736, 34075, 35400, 20979, 35416, 35432, 35465, 18506, 18506, 23448, 35491, 27218, 27218, 27218, 35525, 31143, 24400, 24400, 24400, 35561, 18506, 26887, 35117, 35609, 24871, 25810, 30413, 23518, 26040, 35655, 35674, 22164, 19565, 19607, 30606, 35690, 27725, 35576, 29123, 18506, 18506, 18506, 18508, 27218, 35710, 27218, 27218, 27218, 35731, 24400, 36596, 24400, 24400, 24400, 19671, 30231, 18506, 18506, 18506, 23068, 35747, 27218, 27218, 27218, 27553, 22920, 24400, 24400, 24400, 24400, 23895, 35764, 18506, 18506, 25024, 35786, 27218, 27218, 17614, 20055, 35803, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 23914, 18508, 34504, 31818, 25387, 19490, 23068, 23312, 26442, 31006, 27884, 34267, 19883, 25810, 35820, 19880, 27194, 35849, 33108, 23498, 30997, 22096, 22228, 28721, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22845, 18871, 22050, 35885, 28732, 25341, 31153, 29192, 22078, 26782, 18506, 22574, 18508, 23986, 27218, 29859, 27218, 22112, 33748, 24400, 31410, 24400, 18901, 18506, 18506, 26896, 18506, 18506, 25810, 27218, 30756, 27218, 27218, 35026, 22164, 24400, 24907, 24400, 24400, 24033, 31675, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22860, 18871, 22050, 27865, 27885, 35907, 24400, 35923, 22078, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 22112, 24400, 24400, 24400, 24400, 18901, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 24033, 31591, 18506, 18506, 18506, 18506, 26247, 27218, 27218, 27218, 27218, 27218, 19527, 35939, 24400, 24400, 24400, 24400, 19671, 18506, 28145, 18506, 18506, 35957, 27218, 32838, 27218, 32673, 30780, 24009, 24400, 32233, 24400, 32078, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22875, 18871, 22050, 35982, 34836, 25341, 33947, 29192, 36004, 18506, 23293, 18506, 36037, 27218, 27218, 36072, 36089, 22112, 24400, 24400, 36112, 33937, 18901, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 35026, 22164, 24400, 24400, 24400, 24400, 24033, 36129, 18506, 25593, 18506, 18506, 18508, 27218, 27218, 27340, 27218, 27218, 36162, 24400, 24400, 34378, 24400, 24400, 19671, 28259, 18506, 18506, 18506, 23068, 30915, 27218, 27218, 27218, 23702, 24009, 33824, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22321, 18871, 22050, 19397, 27885, 36198, 24400, 36214, 22078, 18506, 18506, 18506, 18061, 27218, 27218, 27218, 35501, 22112, 24400, 24400, 24400, 29387, 18901, 18506, 36230, 18506, 28804, 18506, 25810, 34888, 27218, 27436, 27218, 35026, 22164, 29396, 24400, 24498, 24400, 24033, 31675, 18506, 36252, 18506, 18506, 18508, 27218, 36096, 27218, 27218, 27218, 19527, 24400, 28045, 24400, 24400, 24400, 19671, 18506, 18506, 32138, 18506, 35770, 27218, 27218, 36285, 27218, 33547, 24009, 24400, 24400, 36308, 24400, 36328, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 25746, 18506, 18506, 36361, 27218, 27219, 19227, 24401, 19911, 25693, 31979, 18507, 27218, 32478, 19762, 23886, 36384, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22366, 18871, 36404, 19051, 19276, 17768, 36449, 17173, 17619, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 36468, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 17763, 21717, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 22351, 18871, 19030, 19051, 19276, 17768, 19051, 21728, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 18003, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21804, 18871, 36504, 19051, 19276, 17768, 19051, 17173, 17791, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 17822, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 17455, 22013, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21819, 18871, 19030, 19051, 19276, 17768, 19051, 17173, 30787, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 36532, 17308, 17327, 17346, 18961, 18484, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 20736, 21864, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 21819, 18871, 19350, 18506, 27885, 30780, 24400, 29192, 28024, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 36582, 24400, 24400, 24400, 24400, 22935, 18506, 18506, 18506, 18506, 18506, 25810, 27218, 27218, 27218, 27218, 28546, 36629, 24400, 24400, 24400, 24400, 24033, 18916, 18506, 18506, 18506, 18506, 18508, 27218, 27218, 27218, 27218, 27218, 19527, 24400, 24400, 24400, 24400, 24400, 19671, 18506, 18506, 18506, 18506, 23068, 27218, 27218, 27218, 27218, 30780, 24009, 24400, 24400, 24400, 24400, 26774, 18506, 18506, 18506, 27883, 27218, 27218, 27218, 17614, 24014, 24400, 24400, 24400, 18505, 18506, 18506, 27218, 27218, 27219, 24013, 24401, 19911, 25693, 18506, 18507, 27218, 27218, 19762, 23886, 19911, 31007, 18508, 27218, 31818, 19449, 19490, 23068, 23312, 19871, 31006, 27884, 34267, 19883, 25810, 34264, 19880, 25809, 19803, 31004, 23498, 30997, 22096, 19462, 27972, 19702, 27960, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 36655, 36693, 18755, 19051, 19276, 17768, 19051, 17478, 17619, 36452, 17330, 17349, 18964, 17189, 17208, 17281, 17756, 17223, 17308, 17327, 17346, 18961, 36757, 21871, 18684, 18700, 19049, 17265, 22024, 17726, 17421, 17447, 17192, 17763, 21717, 17311, 18693, 19042, 19051, 17471, 32925, 17521, 17544, 17251, 36426, 17836, 17699, 20346, 21147, 17567, 17583, 17609, 21878, 17528, 17551, 17258, 36433, 21906, 21931, 17635, 36482, 18271, 17657, 17685, 20514, 17715, 17742, 17784, 33554, 21937, 17641, 36488, 18277, 36546, 17501, 19195, 17914, 17946, 18380, 17807, 17886, 17614, 21611, 17505, 19199, 17918, 18766, 17972, 36566, 20653, 17988, 18033, 18762, 18716, 18437, 18656, 18093, 18110, 18126, 18171, 18197, 18741, 18106, 18263, 18304, 18293, 18320, 18017, 18350, 18366, 18408, 17861, 36418, 19275, 17850, 17163, 30666, 18424, 17870, 32934, 17669, 18840, 18453, 18469, 18554, 17393, 18782, 18540, 18570, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 17614, 0, 94242, 0, 118820, 0, 2211840, 102439, 0, 0, 106538, 98347, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2486272, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 2207744, 2408448, 2416640, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3108864, 2609152, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2682880, 2207744, 2699264, 2207744, 2707456, 2207744, 2715648, 2756608, 2207744, 0, 0, 0, 0, 0, 0, 2166784, 0, 0, 0, 0, 0, 0, 2158592, 2158592, 3174400, 3178496, 2158592, 0, 139, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2428928, 2158592, 2158592, 2158592, 2752512, 2760704, 2781184, 2805760, 2158592, 2158592, 2158592, 2867200, 2895872, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3108864, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2207744, 2789376, 2207744, 2813952, 2207744, 2207744, 2846720, 2207744, 2207744, 2207744, 2904064, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 823, 0, 825, 2158592, 2408448, 2416640, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2568192, 2158592, 2158592, 2609152, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2682880, 2158592, 2699264, 2158592, 2707456, 2158592, 2715648, 2756608, 2158592, 2158592, 2789376, 2158592, 2158592, 2789376, 2158592, 2813952, 2158592, 2158592, 2846720, 2158592, 2158592, 2158592, 2904064, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 18, 0, 0, 0, 0, 0, 0, 0, 2211840, 0, 0, 641, 0, 2158592, 0, 0, 0, 0, 0, 0, 0, 0, 2211840, 0, 0, 32768, 0, 2158592, 0, 2158592, 2158592, 2158592, 2387968, 2158592, 2158592, 2158592, 2158592, 3010560, 2387968, 2207744, 2207744, 2207744, 2207744, 2158877, 2158877, 2158877, 2158877, 0, 0, 0, 2158877, 2576669, 2158877, 2158877, 0, 2207744, 2207744, 2600960, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2646016, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 0, 0, 0, 0, 0, 2162968, 0, 0, 2207744, 2207744, 2207744, 2207744, 2785280, 2797568, 2207744, 2822144, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 541, 0, 543, 3108864, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 0, 0, 2146304, 2146304, 2224128, 2224128, 2232320, 2232320, 2232320, 641, 0, 0, 0, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2535424, 2158592, 2158592, 2158592, 2158592, 2158592, 2621440, 2158592, 2158592, 2158592, 2158592, 2445312, 2449408, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2506752, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2584576, 2158592, 2158592, 2158592, 2158592, 2625536, 2158592, 2584576, 2158592, 2158592, 2158592, 2158592, 2625536, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2703360, 2158592, 2158592, 2158592, 2158592, 2158592, 2752512, 2760704, 2781184, 2805760, 2207744, 2867200, 2895872, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3022848, 2207744, 3047424, 2207744, 2207744, 2207744, 2207744, 3084288, 2207744, 2207744, 3117056, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 0, 0, 172032, 0, 0, 2162688, 0, 0, 2207744, 2207744, 2207744, 3190784, 2207744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2158592, 2158592, 2158592, 2408448, 2416640, 2158592, 2514944, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2588672, 2158592, 2613248, 2158592, 2158592, 2633728, 2158592, 2158592, 2158592, 2691072, 2158592, 2719744, 2158592, 2158592, 3125248, 2158592, 2158592, 2158592, 3153920, 2158592, 2158592, 3174400, 3178496, 2158592, 2371584, 2207744, 2207744, 2207744, 2207744, 2158592, 2158592, 2158592, 2158592, 0, 0, 0, 2158592, 2576384, 2158592, 2158592, 0, 2207744, 2207744, 2207744, 2437120, 2207744, 2457600, 2465792, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2514944, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2445312, 2449408, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2506752, 2719744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2871296, 2207744, 2908160, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2568192, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3018752, 2207744, 2207744, 3055616, 2207744, 2207744, 3104768, 2207744, 2207744, 3125248, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3100672, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 0, 0, 0, 0, 0, 2162688, 0, 0, 2207744, 3153920, 2207744, 2207744, 3174400, 3178496, 2207744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 2158592, 2158592, 2158592, 2408448, 2416640, 2711552, 2736128, 2207744, 2207744, 2207744, 2826240, 2830336, 2207744, 2899968, 2207744, 2207744, 2928640, 2207744, 2207744, 2977792, 2207744, 0, 0, 0, 0, 0, 0, 2166784, 0, 0, 0, 0, 0, 285, 2158592, 2158592, 3117056, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3190784, 2158592, 2207744, 2207744, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 0, 0, 2539520, 2547712, 2158592, 2158592, 2158592, 0, 0, 0, 2158592, 2158592, 2158592, 2994176, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2576384, 2985984, 2207744, 2207744, 3006464, 2207744, 3051520, 3067904, 3080192, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3207168, 2713056, 2736128, 2158592, 2158592, 2158592, 2826240, 2831844, 2158592, 2899968, 2158592, 2158592, 2928640, 2158592, 2158592, 2977792, 2158592, 2985984, 2158592, 2158592, 3006464, 2158592, 3051520, 3067904, 3080192, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3207168, 2985984, 2158592, 2158592, 3007972, 2158592, 3051520, 3067904, 3080192, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3207168, 2207744, 2207744, 2207744, 2207744, 2207744, 2428928, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 0, 0, 176406, 279, 0, 2162688, 0, 0, 2527232, 2531328, 2158592, 2158592, 2580480, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2912256, 2531328, 2207744, 2207744, 2580480, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2912256, 2207744, 0, 0, 0, 0, 0, 0, 2166784, 0, 0, 0, 0, 0, 286, 2158592, 2158592, 0, 0, 2158592, 2158592, 2158592, 2158592, 2637824, 2662400, 0, 0, 2744320, 2748416, 0, 2838528, 2207744, 2207744, 2981888, 2207744, 2207744, 2207744, 2207744, 3043328, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3162112, 0, 0, 29315, 0, 0, 0, 0, 45, 45, 45, 45, 45, 933, 45, 45, 45, 45, 442, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 2498560, 2158592, 2158592, 2158592, 2528853, 2531328, 2158592, 2158592, 2580480, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 1504, 2158592, 2502656, 2158592, 2158592, 2158592, 2158592, 2572288, 2158592, 2596864, 2629632, 2158592, 2158592, 2678784, 2740224, 2158592, 2158592, 0, 2158592, 2916352, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3112960, 2158592, 2158592, 3137536, 3149824, 3158016, 2379776, 2383872, 2207744, 2207744, 2424832, 2207744, 2453504, 2207744, 2207744, 2207744, 2502656, 2207744, 2207744, 2207744, 2207744, 2572288, 2207744, 0, 0, 0, 0, 0, 0, 2166784, 0, 0, 0, 0, 0, 551, 2158592, 2158592, 2158592, 2158592, 2207744, 2510848, 2207744, 2207744, 2207744, 2207744, 2207744, 2158592, 2510848, 0, 2020, 2158592, 2596864, 2629632, 2207744, 2207744, 2678784, 2740224, 2207744, 2207744, 2207744, 2916352, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 159744, 0, 0, 0, 0, 2162688, 0, 0, 2207744, 3112960, 2207744, 2207744, 3137536, 3149824, 3158016, 2379776, 2383872, 2158592, 2158592, 2424832, 2158592, 2453504, 2158592, 2158592, 2158592, 2158592, 2158592, 3190784, 2158592, 0, 641, 0, 0, 0, 0, 0, 0, 2371584, 2158592, 2502656, 2158592, 2158592, 1621, 2158592, 2158592, 2572288, 2158592, 2596864, 2629632, 2158592, 2158592, 2678784, 0, 0, 0, 0, 0, 1608, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1107, 97, 97, 1110, 97, 97, 3137536, 3149824, 3158016, 2158592, 2412544, 2420736, 2158592, 2469888, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3018752, 2158592, 2158592, 3055616, 2158592, 2158592, 3104768, 2158592, 2158592, 3125248, 2158592, 2158592, 2158592, 3153920, 2420736, 2207744, 2469888, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2637824, 2662400, 2744320, 2748416, 2838528, 2953216, 2158592, 2990080, 2158592, 3002368, 2158592, 2158592, 2158592, 3133440, 2207744, 2412544, 2953216, 2207744, 2990080, 2207744, 3002368, 2207744, 2207744, 2207744, 3133440, 2158592, 2412544, 2420736, 2158592, 2469888, 2158592, 2158592, 2158592, 2158592, 2158592, 3190784, 2158592, 0, 32768, 0, 0, 0, 0, 0, 0, 2371584, 2953216, 2158592, 2990080, 2158592, 3002368, 2158592, 2158592, 2158592, 3133440, 2158592, 2158592, 2482176, 2158592, 2158592, 2158592, 2539520, 2547712, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3121152, 2207744, 2207744, 2482176, 2207744, 2207744, 2207744, 2207744, 2207744, 2535424, 2207744, 2207744, 2207744, 2207744, 2207744, 2621440, 2207744, 2207744, 2207744, 2207744, 2158592, 2158592, 2158592, 2158592, 0, 0, 0, 2158592, 2576384, 2158592, 2158592, 1508, 2207744, 2539520, 2547712, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3121152, 2158592, 2158592, 2482176, 2207744, 2207744, 2994176, 2207744, 2207744, 2158592, 2158592, 2486272, 2158592, 2158592, 0, 0, 0, 2158592, 2158592, 2158592, 0, 2158592, 2912256, 2158592, 2158592, 2158592, 2981888, 2158592, 2158592, 2158592, 2158592, 3043328, 2158592, 2158592, 3014656, 2207744, 2433024, 2207744, 2519040, 2207744, 2592768, 2207744, 2842624, 2207744, 2207744, 2207744, 3014656, 2158592, 2433024, 2158592, 2519040, 0, 0, 2158592, 2592768, 2158592, 0, 2842624, 2158592, 2158592, 2158592, 3014656, 2158592, 2510848, 2158592, 18, 0, 0, 0, 0, 0, 0, 0, 2211840, 0, 0, 0, 0, 2158592, 0, 0, 29315, 922, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 3010560, 2387968, 0, 2020, 2158592, 2158592, 2158592, 2158592, 3010560, 2158592, 2641920, 2957312, 2158592, 2207744, 2641920, 2957312, 2207744, 0, 0, 2158592, 2641920, 2957312, 2158592, 2543616, 2158592, 2543616, 2207744, 0, 0, 2543616, 2158592, 2158592, 2158592, 2158592, 2207744, 2510848, 2207744, 2207744, 2207744, 2207744, 2207744, 2158592, 2510848, 0, 0, 2158592, 2207744, 0, 2158592, 2158592, 2207744, 0, 2158592, 2158592, 2207744, 0, 2158592, 2969600, 2969600, 2969600, 0, 0, 0, 0, 0, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2478365, 2158877, 2158877, 0, 0, 2158877, 2158877, 2158877, 2158877, 2638109, 2662685, 0, 0, 2744605, 2748701, 0, 2838813, 40976, 18, 36884, 45078, 24, 28, 90143, 94242, 118820, 102439, 106538, 98347, 118820, 118820, 118820, 40976, 18, 18, 36884, 0, 0, 0, 24, 24, 24, 27, 27, 27, 27, 90143, 0, 0, 86016, 0, 0, 2211840, 102439, 0, 0, 0, 98347, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 3162112, 0, 2379776, 2383872, 2158592, 2158592, 2424832, 2158592, 2453504, 2158592, 2158592, 0, 94242, 0, 0, 0, 2211840, 102439, 0, 0, 106538, 98347, 135, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2568192, 2158592, 2158592, 2158592, 2158592, 2158592, 2600960, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2646016, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2785280, 2797568, 2498560, 2158592, 2158592, 2158592, 2527232, 2531328, 2158592, 2158592, 2580480, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 40976, 0, 18, 18, 24, 0, 27, 27, 0, 2158592, 2502656, 2158592, 2158592, 0, 2158592, 2158592, 2572288, 2158592, 2596864, 2629632, 2158592, 2158592, 2678784, 0, 0, 0, 0, 0, 2211840, 0, 0, 0, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2478080, 2158592, 2158592, 2498560, 2158592, 2158592, 2158592, 3010560, 2387968, 0, 0, 2158592, 2158592, 2158592, 2158592, 3010560, 2158592, 2641920, 2957312, 2158592, 2207744, 2641920, 2957312, 40976, 18, 36884, 45078, 24, 27, 147488, 94242, 147456, 147488, 106538, 98347, 0, 0, 147456, 40976, 18, 18, 36884, 0, 45078, 0, 24, 24, 24, 27, 27, 27, 27, 0, 81920, 0, 94242, 0, 0, 0, 2211840, 0, 0, 0, 106538, 98347, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2433024, 2158592, 2519040, 2158592, 2592768, 2158592, 2842624, 2158592, 2158592, 40976, 18, 151573, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 0, 40976, 18, 18, 36884, 0, 45078, 0, 24, 24, 24, 27, 27, 27, 27, 90143, 0, 0, 1315, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1487, 97, 18, 131427, 0, 0, 0, 0, 0, 0, 362, 0, 0, 365, 29315, 367, 0, 0, 29315, 0, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1663, 45, 45, 45, 45, 45, 45, 45, 45, 45, 183, 45, 45, 45, 45, 201, 45, 130, 94242, 0, 0, 0, 2211840, 102439, 0, 0, 106538, 98347, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3100672, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2207744, 2207744, 2158592, 18, 0, 0, 0, 0, 0, 0, 0, 2211840, 0, 0, 0, 0, 2158592, 644, 2207744, 2207744, 2207744, 3190784, 2207744, 0, 1080, 0, 1084, 0, 1088, 0, 0, 0, 0, 0, 0, 0, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2535562, 2158730, 2158730, 2158730, 2158730, 2158730, 2621578, 0, 94242, 0, 0, 0, 2211840, 102439, 0, 0, 106538, 98347, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2785280, 2797568, 2158592, 2822144, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 40976, 18, 36884, 45078, 24, 27, 90143, 163875, 163840, 102439, 163875, 98347, 0, 0, 163840, 40976, 18, 18, 36884, 0, 45078, 0, 2224253, 176128, 2224253, 2232448, 2232448, 176128, 2232448, 90143, 0, 0, 2170880, 0, 0, 550, 829, 2158592, 2158592, 2158592, 2392064, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 40976, 0, 18, 18, 124, 124, 127, 127, 127, 40976, 18, 36884, 45078, 25, 29, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 168027, 40976, 18, 18, 36884, 0, 45078, 253952, 24, 24, 24, 27, 27, 27, 27, 90143, 0, 0, 2170880, 0, 0, 827, 0, 2158592, 2158592, 2158592, 2392064, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 40976, 0, 4243810, 4243810, 24, 24, 27, 27, 27, 2207744, 0, 0, 0, 0, 0, 0, 2166784, 0, 0, 0, 0, 57344, 286, 2158592, 2158592, 2158592, 2158592, 2711552, 2736128, 2158592, 2158592, 2158592, 2826240, 2830336, 2158592, 2899968, 2158592, 2158592, 2928640, 2158592, 2158592, 2977792, 2158592, 2207744, 2207744, 2207744, 3190784, 2207744, 0, 0, 0, 0, 0, 0, 53248, 0, 0, 0, 0, 0, 97, 97, 97, 97, 97, 1613, 97, 97, 97, 97, 97, 97, 1495, 97, 97, 97, 97, 97, 97, 97, 97, 97, 566, 97, 97, 97, 97, 97, 97, 2207744, 0, 0, 0, 0, 0, 0, 2166784, 546, 0, 0, 0, 0, 286, 2158592, 2158592, 2158592, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 17, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 20480, 120, 121, 18, 18, 36884, 0, 45078, 0, 24, 24, 24, 27, 27, 27, 27, 90143, 0, 0, 2170880, 0, 53248, 550, 0, 2158592, 2158592, 2158592, 2392064, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 40976, 200704, 18, 270336, 24, 24, 27, 27, 27, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 0, 45, 45, 45, 45, 45, 45, 45, 1535, 45, 45, 45, 45, 45, 45, 45, 1416, 45, 45, 45, 45, 45, 45, 45, 45, 424, 45, 45, 45, 45, 45, 45, 45, 45, 45, 405, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 199, 45, 45, 67, 67, 67, 67, 67, 491, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1766, 67, 67, 67, 1767, 67, 24850, 24850, 12564, 12564, 0, 0, 2166784, 546, 0, 53531, 53531, 0, 286, 97, 97, 0, 0, 97, 97, 97, 97, 97, 97, 0, 0, 97, 97, 0, 97, 97, 97, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 743, 57889, 0, 2170880, 0, 0, 550, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 1856, 45, 1858, 1859, 67, 67, 67, 1009, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1021, 67, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2371869, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2703645, 2158877, 2158877, 2158877, 2158877, 2158877, 2752797, 2760989, 2781469, 2806045, 97, 1115, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 857, 97, 67, 67, 67, 67, 67, 1258, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1826, 67, 97, 97, 97, 97, 97, 97, 1338, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 870, 97, 97, 67, 67, 67, 1463, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1579, 67, 67, 97, 97, 97, 1518, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 904, 905, 97, 97, 97, 97, 1620, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 921, 0, 0, 0, 0, 0, 0, 45, 1679, 67, 67, 67, 1682, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1690, 67, 0, 0, 97, 97, 97, 97, 45, 45, 67, 67, 0, 0, 97, 97, 45, 45, 45, 669, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 189, 45, 45, 45, 1748, 45, 45, 45, 1749, 1750, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 1959, 67, 67, 67, 67, 1768, 67, 67, 67, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1791, 97, 97, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 1802, 67, 1817, 67, 67, 67, 67, 67, 67, 1823, 67, 67, 67, 67, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 0, 97, 97, 97, 97, 1848, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 659, 45, 45, 45, 45, 45, 45, 45, 1863, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 495, 67, 67, 67, 67, 67, 1878, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 0, 0, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 97, 97, 97, 97, 0, 0, 0, 1973, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1165, 97, 1167, 0, 94242, 0, 0, 0, 2211840, 102439, 0, 0, 106538, 98347, 136, 2158592, 2158592, 2158592, 2158592, 2158592, 3162112, 233472, 2379776, 2383872, 2158592, 2158592, 2424832, 2158592, 2453504, 2158592, 2158592, 67, 24850, 24850, 12564, 12564, 0, 0, 280, 547, 0, 53531, 53531, 0, 286, 97, 97, 0, 0, 97, 97, 97, 97, 97, 97, 0, 0, 97, 97, 1789, 97, 57889, 547, 547, 0, 0, 550, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 45, 45, 45, 1799, 45, 45, 45, 67, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 1092, 0, 0, 0, 0, 0, 97, 97, 97, 97, 1612, 97, 97, 97, 97, 1616, 97, 1297, 1472, 0, 0, 0, 0, 1303, 1474, 0, 0, 0, 0, 1309, 1476, 0, 0, 0, 0, 97, 97, 97, 1481, 97, 97, 97, 97, 97, 97, 1488, 97, 0, 1474, 0, 1476, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 607, 97, 97, 97, 97, 40976, 18, 36884, 45078, 26, 30, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 217176, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 143448, 40976, 18, 18, 36884, 0, 45078, 0, 24, 24, 24, 27, 27, 27, 27, 0, 0, 0, 0, 97, 97, 97, 97, 1482, 97, 1483, 97, 97, 97, 97, 97, 97, 1326, 97, 97, 1329, 1330, 97, 97, 97, 97, 97, 97, 1159, 1160, 97, 97, 97, 97, 97, 97, 97, 97, 590, 97, 97, 97, 97, 97, 97, 97, 0, 94242, 0, 0, 0, 2211974, 102439, 0, 0, 106538, 98347, 0, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2478218, 2158730, 2158730, 2498698, 2158730, 2158730, 2158730, 2814090, 2158730, 2158730, 2846858, 2158730, 2158730, 2158730, 2904202, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3018890, 2158730, 2158730, 3055754, 2158730, 2158730, 3104906, 2158730, 2158730, 2158730, 2158730, 3100810, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2207744, 2207744, 2207744, 2207744, 2207744, 2576384, 2207744, 2207744, 2207744, 2207744, 541, 541, 543, 543, 0, 0, 2166784, 0, 548, 549, 549, 0, 286, 2158877, 2158877, 2158877, 2867485, 2896157, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 3191069, 2158877, 0, 0, 0, 0, 0, 0, 0, 0, 2371722, 2158877, 2408733, 2416925, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2568477, 2158877, 2158877, 2609437, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2683165, 2158877, 2699549, 2158877, 2707741, 2158877, 2715933, 2756893, 2158877, 0, 2158877, 2158877, 2158877, 2388106, 2158730, 2158730, 2158730, 2158730, 3010698, 2387968, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2584576, 2207744, 2207744, 2207744, 2207744, 2625536, 2207744, 2207744, 2158877, 2789661, 2158877, 2814237, 2158877, 2158877, 2847005, 2158877, 2158877, 2158877, 2904349, 2158877, 2158877, 2158877, 2158877, 2158877, 2535709, 2158877, 2158877, 2158877, 2158877, 2158877, 2621725, 2158877, 2158877, 2158877, 2158877, 2158730, 2822282, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3109149, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 0, 0, 0, 0, 0, 97, 97, 97, 1611, 97, 97, 97, 97, 97, 97, 97, 1496, 97, 97, 1499, 97, 97, 97, 97, 97, 2445450, 2449546, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2506890, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2437258, 2158730, 2457738, 2465930, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2584714, 2158730, 2158730, 2158730, 2158730, 2625674, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2703498, 2158730, 2158730, 2158730, 2158730, 2683018, 2158730, 2699402, 2158730, 2707594, 2158730, 2715786, 2756746, 2158730, 2158730, 2789514, 2158730, 2158730, 2158730, 3117194, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3190922, 2158730, 2207744, 2207744, 2207744, 2207744, 2207744, 2588672, 2207744, 2613248, 2207744, 2207744, 2633728, 2207744, 2207744, 2207744, 2691072, 2207744, 2158877, 2507037, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2584861, 2158877, 2158877, 2158877, 2158877, 2625821, 2158877, 3023133, 2158877, 3047709, 2158877, 2158877, 2158877, 2158877, 3084573, 2158877, 2158877, 3117341, 2158877, 2158877, 2158877, 2158877, 0, 2158877, 2912541, 2158877, 2158877, 2158877, 2982173, 2158877, 2158877, 2158877, 2158877, 3043613, 2158877, 2158730, 2515082, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2588810, 2158730, 2613386, 2158730, 2158730, 2633866, 2158730, 2158730, 2158730, 2392202, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2609290, 2158730, 2158730, 2158730, 2158730, 2691210, 2158730, 2719882, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2871434, 2158730, 2908298, 2158730, 2158730, 2158730, 2646154, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2785418, 2797706, 2158730, 3125386, 2158730, 2158730, 2158730, 3154058, 2158730, 2158730, 3174538, 3178634, 2158730, 2371584, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2478080, 2207744, 2207744, 2498560, 2207744, 2207744, 2207744, 2527232, 2158877, 2437405, 2158877, 2457885, 2466077, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2515229, 2158877, 2158877, 2158877, 2158877, 2588957, 2158877, 2613533, 2158877, 2158877, 2634013, 2158877, 2158877, 2158877, 2691357, 2158877, 2720029, 2158877, 2158730, 2158730, 2977930, 2158730, 2986122, 2158730, 2158730, 3006602, 2158730, 3051658, 3068042, 3080330, 2158730, 2158730, 2158730, 2158730, 2207744, 2510848, 2207744, 2207744, 2207744, 2207744, 2207744, 2158877, 2511133, 0, 0, 2158877, 2158730, 2158730, 2158730, 3207306, 2207744, 2207744, 2207744, 2207744, 2207744, 2428928, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 542, 0, 544, 2711837, 2736413, 2158877, 2158877, 2158877, 2826525, 2830621, 2158877, 2900253, 2158877, 2158877, 2928925, 2158877, 2158877, 2978077, 2158877, 18, 0, 0, 0, 0, 0, 0, 0, 2211840, 0, 0, 642, 0, 2158592, 0, 45, 1529, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1755, 45, 67, 67, 2986269, 2158877, 2158877, 3006749, 2158877, 3051805, 3068189, 3080477, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 3207453, 2527370, 2531466, 2158730, 2158730, 2580618, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2912394, 2498845, 2158877, 2158877, 2158877, 2527517, 2531613, 2158877, 2158877, 2580765, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 0, 40976, 0, 18, 18, 4321280, 2224253, 2232448, 4329472, 2232448, 2158730, 2502794, 2158730, 2158730, 2158730, 2158730, 2572426, 2158730, 2597002, 2629770, 2158730, 2158730, 2678922, 2740362, 2158730, 2158730, 2158730, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2158730, 2916490, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3113098, 2158730, 2158730, 3137674, 3149962, 3158154, 2379776, 2207744, 3112960, 2207744, 2207744, 3137536, 3149824, 3158016, 2380061, 2384157, 2158877, 2158877, 2425117, 2158877, 2453789, 2158877, 2158877, 2158877, 3121437, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3109002, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158877, 2502941, 2158877, 2158877, 0, 2158877, 2158877, 2572573, 2158877, 2597149, 2629917, 2158877, 2158877, 2679069, 0, 0, 0, 0, 97, 97, 1480, 97, 97, 97, 97, 97, 1485, 97, 97, 97, 0, 97, 97, 1729, 97, 1731, 97, 97, 97, 97, 97, 97, 97, 311, 97, 97, 97, 97, 97, 97, 97, 97, 1520, 97, 97, 1523, 97, 97, 1526, 97, 2740509, 2158877, 2158877, 0, 2158877, 2916637, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 3113245, 2158877, 2158877, 3019037, 2158877, 2158877, 3055901, 2158877, 2158877, 3105053, 2158877, 2158877, 3125533, 2158877, 2158877, 2158877, 3154205, 3137821, 3150109, 3158301, 2158730, 2412682, 2420874, 2158730, 2470026, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3022986, 2158730, 3047562, 2158730, 2158730, 2158730, 2158730, 3084426, 2637962, 2662538, 2744458, 2748554, 2838666, 2953354, 2158730, 2990218, 2158730, 3002506, 2158730, 2158730, 2158730, 3133578, 2207744, 2412544, 2953216, 2207744, 2990080, 2207744, 3002368, 2207744, 2207744, 2207744, 3133440, 2158877, 2412829, 2421021, 2158877, 2470173, 2158877, 2158877, 3174685, 3178781, 2158877, 0, 0, 0, 2158730, 2158730, 2158730, 2158730, 2158730, 2429066, 2158730, 2158730, 2158730, 2158730, 2711690, 2736266, 2158730, 2158730, 2158730, 2826378, 2830474, 2158730, 2900106, 2158730, 2158730, 2928778, 2953501, 2158877, 2990365, 2158877, 3002653, 2158877, 2158877, 2158877, 3133725, 2158730, 2158730, 2482314, 2158730, 2158730, 2158730, 2539658, 2547850, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3121290, 2207744, 2207744, 2482176, 2207744, 2207744, 2207744, 2207744, 2703360, 2207744, 2207744, 2207744, 2207744, 2207744, 2752512, 2760704, 2781184, 2805760, 2207744, 2207744, 2158877, 2158877, 2158877, 2158877, 2158877, 0, 0, 0, 2158877, 2158877, 2158877, 2158877, 0, 0, 2539805, 2547997, 2158877, 2158877, 2158877, 0, 0, 0, 2158877, 2158877, 2158877, 2994461, 2158877, 2158877, 2158730, 2158730, 2158730, 2158730, 2158730, 2576522, 2207744, 2539520, 2547712, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3121152, 2158877, 2158877, 2482461, 0, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158730, 2158730, 2486410, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2207744, 2207744, 2207744, 2392064, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 20480, 0, 0, 0, 0, 0, 2162688, 20480, 0, 2158730, 2158730, 2158730, 2994314, 2158730, 2158730, 2207744, 2207744, 2486272, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 0, 0, 0, 0, 0, 2162688, 135, 0, 2207744, 2207744, 2994176, 2207744, 2207744, 2158877, 2158877, 2486557, 2158877, 2158877, 0, 0, 0, 2158877, 2158877, 2158877, 2158877, 2158877, 2158730, 2433162, 2158730, 2519178, 2158730, 2592906, 2158730, 2842762, 2158730, 2158730, 2158730, 3014794, 2207744, 2433024, 2207744, 2519040, 2207744, 2592768, 2207744, 2842624, 2207744, 2207744, 2207744, 3014656, 2158877, 2433309, 2158877, 2519325, 0, 0, 2158877, 2593053, 2158877, 0, 2842909, 2158877, 2158877, 2158877, 3014941, 2158730, 2510986, 2158730, 2158730, 2158730, 2752650, 2760842, 2781322, 2805898, 2158730, 2158730, 2158730, 2867338, 2896010, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 2568330, 2158730, 2158730, 2158730, 2158730, 2158730, 2601098, 2158730, 2158730, 2158730, 3010560, 2388253, 0, 0, 2158877, 2158877, 2158877, 2158877, 3010845, 2158730, 2642058, 2957450, 2158730, 2207744, 2641920, 2957312, 2207744, 0, 0, 2158877, 2642205, 2957597, 2158877, 2543754, 2158730, 2543616, 2207744, 0, 0, 2543901, 2158877, 2158730, 2158730, 2158730, 2982026, 2158730, 2158730, 2158730, 2158730, 3043466, 2158730, 2158730, 2158730, 2158730, 2158730, 2158730, 3162250, 2207744, 0, 2158877, 2158730, 2207744, 0, 2158877, 2158730, 2207744, 0, 2158877, 2969738, 2969600, 2969885, 0, 0, 0, 0, 1315, 0, 0, 0, 0, 97, 97, 97, 97, 97, 97, 97, 1484, 97, 97, 97, 97, 2158592, 18, 0, 122880, 0, 0, 0, 77824, 0, 2211840, 0, 0, 0, 0, 2158592, 0, 356, 0, 0, 0, 0, 0, 0, 28809, 0, 139, 45, 45, 45, 45, 45, 45, 1751, 45, 45, 45, 45, 45, 45, 45, 67, 67, 1427, 67, 67, 67, 67, 67, 1432, 67, 67, 67, 3108864, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 122880, 0, 0, 0, 0, 1315, 0, 0, 0, 0, 97, 97, 97, 97, 97, 97, 1322, 550, 0, 286, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2428928, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 40976, 0, 18, 18, 24, 24, 4329472, 27, 27, 2207744, 2207744, 2981888, 2207744, 2207744, 2207744, 2207744, 3043328, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 3162112, 542, 0, 0, 0, 542, 0, 544, 0, 0, 0, 544, 0, 550, 0, 0, 0, 0, 0, 97, 97, 1610, 97, 97, 97, 97, 97, 97, 97, 97, 898, 97, 97, 97, 97, 97, 97, 97, 0, 94242, 0, 0, 0, 2211840, 0, 0, 0, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2428928, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 241664, 102439, 106538, 98347, 0, 0, 20480, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 196608, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 94, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 96, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 12378, 40976, 18, 18, 36884, 0, 45078, 0, 24, 24, 24, 126, 126, 126, 126, 90143, 0, 0, 2170880, 0, 0, 0, 0, 2158592, 2158592, 2158592, 2392064, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 20480, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 245760, 102439, 106538, 98347, 0, 0, 20568, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 204893, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 20480, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 0, 0, 44, 0, 0, 20575, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 41, 41, 41, 0, 0, 1130496, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 0, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 89, 40976, 18, 18, 36884, 0, 45078, 0, 24, 24, 24, 27, 131201, 27, 27, 90143, 0, 0, 2170880, 0, 0, 550, 0, 2158592, 2158592, 2158592, 2392064, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2445312, 2449408, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 94242, 0, 0, 212992, 2211840, 102439, 0, 0, 106538, 98347, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 3190784, 2158592, 0, 0, 0, 0, 0, 0, 0, 0, 2371584, 32768, 0, 0, 0, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2437120, 2158592, 2457600, 2465792, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2514944, 2158592, 2158592, 2158592, 2158592, 40976, 18, 36884, 249879, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 20480, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 225280, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 184320, 40976, 18, 18, 36884, 155648, 45078, 0, 24, 24, 221184, 27, 27, 27, 221184, 90143, 0, 0, 2170880, 0, 0, 828, 0, 2158592, 2158592, 2158592, 2392064, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2207744, 2207744, 2207744, 2392064, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 0, 0, 0, 0, 0, 2162688, 237568, 0, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 45, 45, 45, 718, 45, 45, 45, 45, 45, 45, 45, 45, 45, 727, 131427, 0, 0, 0, 0, 362, 0, 365, 28809, 367, 139, 45, 45, 45, 45, 45, 45, 1808, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 97, 97, 0, 0, 97, 67, 24850, 24850, 12564, 12564, 0, 57889, 0, 0, 0, 53531, 53531, 367, 286, 97, 97, 0, 0, 97, 97, 97, 97, 97, 97, 0, 1788, 97, 97, 0, 97, 2024, 97, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 235, 67, 67, 67, 67, 67, 57889, 0, 0, 54074, 54074, 550, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 45, 1798, 45, 45, 1800, 45, 45, 0, 1472, 0, 0, 0, 0, 0, 1474, 0, 0, 0, 0, 0, 1476, 0, 0, 0, 0, 1315, 0, 0, 0, 0, 97, 97, 97, 97, 1320, 97, 97, 0, 0, 97, 97, 97, 97, 97, 97, 1787, 0, 97, 97, 0, 97, 97, 97, 45, 45, 45, 45, 2029, 45, 67, 67, 67, 67, 2033, 1527, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 663, 67, 24850, 24850, 12564, 12564, 0, 57889, 281, 0, 0, 53531, 53531, 367, 286, 97, 97, 0, 0, 97, 97, 97, 97, 1786, 97, 0, 0, 97, 97, 0, 1790, 40976, 19, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 266240, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 46, 67, 98, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 45, 67, 97, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 262144, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 1126519, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 1118248, 1118248, 1118248, 0, 0, 1118208, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 37, 102439, 106538, 98347, 0, 0, 208896, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 0, 102439, 106538, 98347, 0, 0, 57436, 40976, 18, 36884, 45078, 24, 27, 33, 33, 0, 33, 33, 33, 0, 0, 0, 40976, 18, 18, 36884, 0, 45078, 0, 124, 124, 124, 127, 127, 127, 127, 90143, 0, 0, 2170880, 0, 0, 550, 0, 2158877, 2158877, 2158877, 2392349, 2158877, 2158877, 2158877, 2158877, 2158877, 2785565, 2797853, 2158877, 2822429, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2871581, 2158877, 2908445, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 3100957, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2445597, 2449693, 2158877, 2158877, 2158877, 2158877, 2158877, 40976, 122, 123, 36884, 0, 45078, 0, 24, 24, 24, 27, 27, 27, 27, 90143, 0, 921, 29315, 0, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 936, 2158592, 4243810, 0, 0, 0, 0, 0, 0, 0, 2211840, 0, 0, 0, 0, 2158592, 0, 921, 29315, 0, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 935, 45, 45, 45, 715, 45, 45, 45, 45, 45, 45, 45, 723, 45, 45, 45, 45, 45, 1182, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 430, 45, 45, 45, 45, 45, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 47, 68, 99, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 48, 69, 100, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 49, 70, 101, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 50, 71, 102, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 51, 72, 103, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 52, 73, 104, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 53, 74, 105, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 54, 75, 106, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 55, 76, 107, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 56, 77, 108, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 57, 78, 109, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 58, 79, 110, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 59, 80, 111, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 60, 81, 112, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 61, 82, 113, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 62, 83, 114, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 63, 84, 115, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 64, 85, 116, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 65, 86, 117, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 38, 102439, 106538, 98347, 66, 87, 118, 40976, 18, 36884, 45078, 24, 27, 90143, 94242, 118820, 102439, 106538, 98347, 118820, 118820, 118820, 40976, 18, 18, 0, 0, 45078, 0, 24, 24, 24, 27, 27, 27, 27, 90143, 0, 0, 1314, 0, 0, 0, 0, 0, 0, 97, 97, 97, 97, 97, 1321, 97, 18, 131427, 0, 0, 0, 0, 0, 0, 362, 0, 0, 365, 0, 367, 0, 0, 1315, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1360, 97, 97, 131, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 45, 145, 149, 45, 45, 45, 45, 45, 174, 45, 179, 45, 185, 45, 188, 45, 45, 202, 67, 255, 67, 67, 269, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 97, 292, 296, 97, 97, 97, 97, 97, 321, 97, 326, 97, 332, 97, 18, 131427, 0, 0, 0, 0, 0, 0, 362, 0, 0, 365, 29315, 367, 646, 335, 97, 97, 349, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 437, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 523, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 511, 67, 67, 67, 97, 97, 97, 620, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1501, 1502, 97, 793, 67, 67, 796, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 808, 67, 0, 0, 97, 97, 97, 97, 45, 45, 67, 67, 0, 0, 97, 97, 2052, 67, 67, 67, 67, 813, 67, 67, 67, 67, 67, 67, 67, 25398, 542, 13112, 544, 57889, 0, 0, 54074, 54074, 550, 830, 97, 97, 97, 97, 97, 97, 97, 97, 97, 315, 97, 97, 97, 97, 97, 97, 841, 97, 97, 97, 97, 97, 97, 97, 97, 97, 854, 97, 97, 97, 97, 97, 97, 589, 97, 97, 97, 97, 97, 97, 97, 97, 97, 867, 97, 97, 97, 97, 97, 97, 97, 891, 97, 97, 894, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 906, 45, 937, 45, 45, 940, 45, 45, 45, 45, 45, 45, 948, 45, 45, 45, 45, 45, 734, 735, 67, 737, 67, 738, 67, 740, 67, 67, 67, 45, 967, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 435, 45, 45, 45, 980, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 415, 45, 45, 67, 67, 1024, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 97, 97, 97, 67, 67, 67, 67, 67, 25398, 1081, 13112, 1085, 54074, 1089, 0, 0, 0, 0, 0, 0, 363, 0, 28809, 0, 139, 45, 45, 45, 45, 45, 45, 1674, 45, 45, 45, 45, 45, 45, 45, 45, 67, 1913, 67, 1914, 67, 67, 67, 1918, 67, 67, 97, 97, 97, 97, 1118, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 630, 97, 97, 97, 97, 97, 1169, 97, 97, 97, 97, 97, 0, 921, 0, 1175, 0, 0, 0, 0, 45, 45, 45, 45, 45, 45, 1534, 45, 45, 45, 45, 45, 1538, 45, 45, 45, 45, 1233, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 742, 67, 45, 45, 1191, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 454, 67, 67, 67, 67, 1243, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1251, 67, 0, 0, 97, 97, 97, 97, 45, 45, 67, 67, 2050, 0, 97, 97, 45, 45, 45, 732, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 97, 97, 67, 67, 67, 1284, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 772, 67, 67, 67, 1293, 67, 67, 67, 67, 67, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 368, 2158592, 2158592, 2158592, 2408448, 2416640, 1323, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1331, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1737, 97, 1364, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1373, 97, 18, 131427, 0, 0, 0, 0, 0, 0, 362, 0, 0, 365, 29315, 367, 647, 45, 45, 1387, 45, 45, 1391, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 410, 45, 45, 45, 45, 45, 1400, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1407, 45, 45, 45, 45, 45, 941, 45, 943, 45, 45, 45, 45, 45, 45, 951, 45, 67, 1438, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1447, 67, 67, 67, 67, 67, 67, 799, 67, 67, 67, 804, 67, 67, 67, 67, 67, 67, 67, 1443, 67, 67, 1446, 67, 67, 67, 67, 67, 67, 67, 1298, 0, 0, 0, 1304, 0, 0, 0, 1310, 97, 1491, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1500, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1736, 97, 45, 45, 1541, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 677, 45, 45, 67, 1581, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 791, 792, 67, 67, 67, 67, 1598, 67, 1600, 67, 67, 67, 67, 67, 67, 67, 67, 1472, 97, 97, 97, 1727, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1513, 97, 97, 67, 67, 97, 1879, 97, 1881, 97, 0, 1884, 0, 97, 97, 97, 97, 0, 0, 97, 97, 97, 97, 97, 0, 0, 0, 1842, 97, 97, 67, 67, 67, 67, 67, 97, 97, 97, 97, 1928, 0, 0, 0, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 1903, 45, 45, 45, 67, 67, 67, 67, 97, 97, 97, 97, 1971, 0, 0, 97, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 0, 0, 45, 45, 45, 1381, 45, 45, 45, 45, 1976, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1747, 809, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 25398, 542, 13112, 544, 97, 907, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 638, 0, 0, 0, 0, 1478, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1150, 97, 97, 97, 97, 67, 67, 67, 67, 1244, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 477, 67, 67, 67, 67, 67, 67, 1294, 67, 67, 67, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1324, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 0, 0, 1374, 97, 97, 97, 97, 0, 1175, 0, 45, 45, 45, 45, 45, 45, 45, 45, 945, 45, 45, 45, 45, 45, 45, 45, 45, 1908, 45, 45, 1910, 45, 67, 67, 67, 67, 67, 67, 67, 67, 1919, 67, 0, 0, 97, 97, 97, 97, 45, 2048, 67, 2049, 0, 0, 97, 2051, 45, 45, 45, 939, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 397, 45, 45, 45, 1921, 67, 67, 1923, 67, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 1947, 45, 1935, 0, 0, 0, 97, 1939, 97, 97, 1941, 97, 45, 45, 45, 45, 45, 45, 382, 389, 45, 45, 45, 45, 45, 45, 45, 45, 1810, 45, 45, 1812, 67, 67, 67, 67, 67, 256, 67, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 336, 97, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 131427, 0, 0, 0, 0, 362, 0, 365, 28809, 367, 139, 45, 45, 371, 373, 45, 45, 45, 955, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 413, 45, 45, 45, 457, 459, 67, 67, 67, 67, 67, 67, 67, 67, 473, 67, 478, 67, 67, 482, 67, 67, 485, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 97, 1828, 97, 554, 556, 97, 97, 97, 97, 97, 97, 97, 97, 570, 97, 575, 97, 97, 579, 97, 97, 582, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 330, 97, 97, 67, 746, 67, 67, 67, 67, 67, 67, 67, 67, 67, 758, 67, 67, 67, 67, 67, 67, 67, 1587, 67, 1589, 67, 67, 67, 67, 67, 67, 67, 97, 1706, 97, 97, 97, 1709, 97, 97, 97, 97, 97, 844, 97, 97, 97, 97, 97, 97, 97, 97, 97, 856, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 1735, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 1642, 97, 1644, 97, 97, 890, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 67, 67, 67, 67, 1065, 1066, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 532, 67, 67, 67, 67, 67, 67, 67, 1451, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 496, 67, 67, 97, 97, 1505, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 593, 97, 97, 0, 1474, 0, 1476, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1617, 97, 97, 1635, 0, 1637, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 885, 97, 97, 97, 97, 67, 67, 1704, 67, 67, 67, 67, 97, 97, 97, 97, 97, 97, 97, 97, 97, 565, 572, 97, 97, 97, 97, 97, 97, 97, 97, 1832, 0, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 97, 97, 45, 45, 45, 1946, 45, 45, 67, 67, 67, 67, 67, 97, 1926, 97, 1927, 97, 0, 0, 0, 97, 97, 1934, 2043, 0, 0, 97, 97, 97, 2047, 45, 45, 67, 67, 0, 1832, 97, 97, 45, 45, 45, 981, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1227, 45, 45, 45, 131427, 0, 0, 0, 0, 362, 0, 365, 28809, 367, 139, 45, 45, 372, 45, 45, 45, 45, 1661, 1662, 45, 45, 45, 45, 45, 1666, 45, 45, 45, 45, 45, 1673, 45, 1675, 45, 45, 45, 45, 45, 45, 45, 67, 1426, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1275, 67, 67, 67, 67, 67, 45, 418, 45, 45, 420, 45, 45, 423, 45, 45, 45, 45, 45, 45, 45, 45, 959, 45, 45, 962, 45, 45, 45, 45, 458, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 483, 67, 67, 67, 67, 504, 67, 67, 506, 67, 67, 509, 67, 67, 67, 67, 67, 67, 67, 753, 67, 67, 67, 67, 67, 67, 67, 67, 467, 67, 67, 67, 67, 67, 67, 67, 555, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 580, 97, 97, 97, 97, 601, 97, 97, 603, 97, 97, 606, 97, 97, 97, 97, 97, 97, 848, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1498, 97, 97, 97, 97, 97, 97, 45, 45, 714, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 989, 990, 45, 67, 67, 67, 67, 67, 1011, 67, 67, 67, 67, 1015, 67, 67, 67, 67, 67, 67, 67, 768, 67, 67, 67, 67, 67, 67, 67, 67, 769, 67, 67, 67, 67, 67, 67, 67, 45, 45, 1179, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1003, 1004, 67, 1217, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 728, 67, 1461, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1034, 67, 97, 1516, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 871, 97, 67, 67, 67, 1705, 67, 67, 67, 97, 97, 97, 97, 97, 97, 97, 97, 97, 567, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1715, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 0, 0, 45, 45, 1380, 45, 45, 45, 45, 45, 67, 67, 97, 97, 97, 97, 97, 0, 0, 0, 97, 1887, 97, 97, 0, 0, 97, 97, 97, 0, 97, 97, 97, 97, 97, 2006, 45, 45, 1907, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1920, 67, 97, 0, 2035, 97, 97, 97, 97, 97, 45, 45, 45, 45, 67, 67, 67, 1428, 67, 67, 67, 67, 67, 67, 1435, 67, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 45, 146, 45, 152, 45, 45, 165, 45, 175, 45, 180, 45, 45, 187, 190, 195, 45, 203, 254, 257, 262, 67, 270, 67, 67, 0, 24850, 12564, 0, 0, 0, 281, 28809, 53531, 97, 97, 97, 293, 97, 299, 97, 97, 312, 97, 322, 97, 327, 97, 97, 334, 337, 342, 97, 350, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 67, 484, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 499, 97, 581, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 596, 648, 45, 650, 45, 651, 45, 653, 45, 45, 45, 657, 45, 45, 45, 45, 45, 45, 1954, 67, 67, 67, 1958, 67, 67, 67, 67, 67, 67, 67, 783, 67, 67, 67, 788, 67, 67, 67, 67, 680, 45, 45, 45, 45, 45, 45, 45, 45, 688, 689, 691, 45, 45, 45, 45, 45, 983, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 947, 45, 45, 45, 45, 952, 45, 45, 698, 699, 45, 45, 702, 703, 45, 45, 45, 45, 45, 45, 45, 711, 744, 67, 67, 67, 67, 67, 67, 67, 67, 67, 757, 67, 67, 67, 67, 761, 67, 67, 67, 67, 765, 67, 767, 67, 67, 67, 67, 67, 67, 67, 67, 775, 776, 778, 67, 67, 67, 67, 67, 67, 785, 786, 67, 67, 789, 790, 67, 67, 67, 67, 67, 67, 1574, 67, 67, 67, 67, 67, 1578, 67, 67, 67, 67, 67, 67, 1012, 67, 67, 67, 67, 67, 67, 67, 67, 67, 468, 475, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 798, 67, 67, 67, 802, 67, 67, 67, 67, 67, 67, 67, 67, 1588, 67, 67, 67, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 67, 810, 67, 67, 67, 67, 67, 67, 67, 67, 67, 821, 25398, 542, 13112, 544, 57889, 0, 0, 54074, 54074, 550, 0, 833, 97, 835, 97, 836, 97, 838, 97, 97, 0, 0, 97, 97, 97, 1785, 97, 97, 0, 0, 97, 97, 0, 97, 97, 1979, 97, 97, 45, 45, 1983, 45, 1984, 45, 45, 45, 45, 45, 652, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 690, 45, 45, 694, 45, 45, 97, 842, 97, 97, 97, 97, 97, 97, 97, 97, 97, 855, 97, 97, 97, 97, 0, 1717, 1718, 97, 97, 97, 97, 97, 1722, 97, 0, 0, 859, 97, 97, 97, 97, 863, 97, 865, 97, 97, 97, 97, 97, 97, 97, 97, 604, 97, 97, 97, 97, 97, 97, 97, 873, 874, 876, 97, 97, 97, 97, 97, 97, 883, 884, 97, 97, 887, 888, 97, 18, 131427, 0, 0, 0, 0, 0, 0, 362, 229376, 0, 365, 0, 367, 0, 45, 45, 45, 1531, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1199, 45, 45, 45, 45, 45, 97, 97, 908, 97, 97, 97, 97, 97, 97, 97, 97, 97, 919, 638, 0, 0, 0, 0, 2158877, 2158877, 2158877, 2158877, 2158877, 2429213, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2601245, 2158877, 2158877, 2158877, 2158877, 2158877, 2158877, 2646301, 2158877, 2158877, 2158877, 2158877, 2158877, 3162397, 0, 2379914, 2384010, 2158730, 2158730, 2424970, 2158730, 2453642, 2158730, 2158730, 953, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 965, 978, 45, 45, 45, 45, 45, 45, 985, 45, 45, 45, 45, 45, 45, 45, 45, 971, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 1027, 67, 1029, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1455, 67, 67, 67, 67, 67, 67, 67, 1077, 1078, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 0, 0, 0, 0, 0, 0, 366, 0, 139, 2158730, 2158730, 2158730, 2408586, 2416778, 1113, 97, 97, 97, 97, 97, 97, 1121, 97, 1123, 97, 97, 97, 97, 97, 97, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1540, 1155, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 615, 1168, 97, 97, 1171, 1172, 97, 97, 0, 921, 0, 1175, 0, 0, 0, 0, 45, 45, 45, 45, 45, 1533, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1559, 1561, 45, 45, 45, 1564, 45, 1566, 1567, 45, 45, 45, 1219, 45, 45, 45, 45, 45, 45, 45, 1226, 45, 45, 45, 45, 45, 168, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 427, 45, 45, 45, 45, 45, 45, 45, 1231, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1242, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1046, 67, 67, 1254, 67, 1256, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 806, 807, 67, 67, 97, 1336, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1111, 97, 97, 97, 97, 97, 1351, 97, 97, 97, 1354, 97, 97, 97, 1359, 97, 97, 97, 0, 97, 97, 97, 97, 1640, 97, 97, 97, 97, 97, 97, 97, 897, 97, 97, 97, 902, 97, 97, 97, 97, 97, 97, 97, 97, 1366, 97, 97, 97, 97, 97, 97, 97, 1371, 97, 97, 97, 0, 97, 97, 97, 1730, 97, 97, 97, 97, 97, 97, 97, 97, 915, 97, 97, 97, 97, 0, 360, 0, 67, 67, 67, 1440, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1017, 67, 1019, 67, 67, 67, 67, 67, 1453, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1459, 97, 97, 97, 1493, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1525, 97, 97, 97, 97, 97, 97, 1507, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1514, 67, 67, 67, 67, 1584, 67, 67, 67, 67, 67, 1590, 67, 67, 67, 67, 67, 67, 67, 784, 67, 67, 67, 67, 67, 67, 67, 67, 1055, 67, 67, 67, 67, 1060, 67, 67, 67, 67, 67, 67, 67, 1599, 1601, 67, 67, 67, 1604, 67, 1606, 1607, 67, 1472, 0, 1474, 0, 1476, 0, 97, 97, 97, 97, 97, 97, 1614, 97, 97, 97, 97, 45, 45, 1850, 45, 45, 45, 45, 1855, 45, 45, 45, 45, 45, 1222, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1229, 97, 1618, 97, 97, 97, 97, 97, 97, 97, 1625, 97, 97, 97, 97, 97, 0, 1175, 0, 45, 45, 45, 45, 45, 45, 45, 45, 447, 45, 45, 45, 45, 45, 67, 67, 1633, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 1643, 1645, 97, 97, 0, 0, 97, 97, 97, 2002, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 1740, 45, 45, 45, 1744, 45, 45, 45, 97, 1648, 97, 1650, 1651, 97, 0, 45, 45, 45, 1654, 45, 45, 45, 45, 45, 169, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 658, 45, 45, 45, 45, 664, 45, 45, 1659, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1187, 45, 45, 1669, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 1005, 67, 67, 1681, 67, 67, 67, 67, 67, 67, 67, 1686, 67, 67, 67, 67, 67, 67, 67, 800, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1603, 67, 67, 67, 67, 67, 0, 97, 97, 1713, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 0, 0, 1378, 45, 45, 45, 45, 45, 45, 45, 408, 45, 45, 45, 45, 45, 45, 45, 45, 1547, 45, 1549, 45, 45, 45, 45, 45, 97, 97, 1780, 0, 97, 97, 97, 97, 97, 97, 0, 0, 97, 97, 0, 97, 97, 97, 45, 45, 2027, 2028, 45, 45, 67, 67, 2031, 2032, 67, 45, 45, 1804, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 1917, 67, 67, 67, 67, 67, 67, 67, 1819, 67, 67, 67, 67, 67, 67, 67, 67, 97, 97, 97, 1708, 97, 97, 97, 97, 97, 45, 45, 1862, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 497, 67, 67, 67, 1877, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 0, 0, 97, 97, 97, 97, 97, 1839, 0, 0, 97, 97, 97, 97, 1936, 0, 0, 97, 97, 97, 97, 97, 97, 1943, 1944, 1945, 45, 45, 45, 45, 670, 45, 45, 45, 45, 674, 45, 45, 45, 45, 678, 45, 1948, 45, 1950, 45, 45, 45, 45, 1955, 1956, 1957, 67, 67, 67, 1960, 67, 1962, 67, 67, 67, 67, 1967, 1968, 1969, 97, 0, 0, 0, 97, 97, 1974, 97, 0, 1936, 0, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 1906, 0, 1977, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1746, 45, 45, 45, 45, 2011, 67, 67, 2013, 67, 67, 67, 2017, 97, 97, 0, 0, 2021, 97, 8192, 97, 97, 2025, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 1916, 67, 67, 67, 67, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 140, 45, 45, 45, 1180, 45, 45, 45, 45, 1184, 45, 45, 45, 45, 45, 45, 45, 387, 45, 392, 45, 45, 396, 45, 45, 399, 45, 45, 67, 207, 67, 67, 67, 67, 67, 67, 236, 67, 67, 67, 67, 67, 67, 67, 817, 67, 67, 67, 67, 25398, 542, 13112, 544, 97, 97, 287, 97, 97, 97, 97, 97, 97, 316, 97, 97, 97, 97, 97, 97, 0, 45, 45, 45, 45, 45, 45, 45, 1656, 1657, 45, 376, 45, 45, 45, 45, 45, 388, 45, 45, 45, 45, 45, 45, 45, 45, 1406, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 462, 67, 67, 67, 67, 67, 474, 67, 67, 67, 67, 67, 67, 67, 1245, 67, 67, 67, 67, 67, 67, 67, 67, 1013, 67, 67, 1016, 67, 67, 67, 67, 97, 97, 97, 97, 559, 97, 97, 97, 97, 97, 571, 97, 97, 97, 97, 97, 97, 896, 97, 97, 97, 900, 97, 97, 97, 97, 97, 97, 912, 914, 97, 97, 97, 97, 97, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 391, 45, 45, 45, 45, 45, 45, 45, 45, 713, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 662, 45, 1140, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 636, 67, 67, 1283, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 513, 67, 67, 1363, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 889, 97, 97, 97, 1714, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 0, 926, 45, 45, 45, 45, 45, 45, 45, 45, 672, 45, 45, 45, 45, 45, 45, 45, 45, 686, 45, 45, 45, 45, 45, 45, 45, 45, 944, 45, 45, 45, 45, 45, 45, 45, 45, 1676, 45, 45, 45, 45, 45, 45, 67, 97, 97, 97, 1833, 0, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 1902, 45, 45, 45, 45, 45, 957, 45, 45, 45, 45, 961, 45, 963, 45, 45, 45, 67, 97, 2034, 0, 97, 97, 97, 97, 97, 2040, 45, 45, 45, 2042, 67, 67, 67, 67, 67, 67, 1586, 67, 67, 67, 67, 67, 67, 67, 67, 67, 469, 67, 67, 67, 67, 67, 67, 132, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 45, 45, 45, 1414, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 428, 45, 45, 45, 45, 45, 57889, 0, 0, 54074, 54074, 550, 831, 97, 97, 97, 97, 97, 97, 97, 97, 97, 568, 97, 97, 97, 97, 578, 97, 45, 45, 968, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1228, 45, 45, 67, 67, 67, 67, 67, 25398, 1082, 13112, 1086, 54074, 1090, 0, 0, 0, 0, 0, 0, 364, 0, 0, 0, 139, 2158592, 2158592, 2158592, 2408448, 2416640, 67, 67, 67, 67, 1464, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 510, 67, 67, 67, 67, 97, 97, 97, 97, 1519, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 918, 97, 0, 0, 0, 0, 1528, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 976, 45, 1554, 45, 45, 45, 45, 45, 45, 45, 45, 1562, 45, 45, 1565, 45, 45, 45, 45, 683, 45, 45, 45, 687, 45, 45, 692, 45, 45, 45, 45, 45, 1953, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1014, 67, 67, 67, 67, 67, 67, 1568, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 0, 67, 67, 67, 67, 67, 1585, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1594, 97, 97, 1649, 97, 97, 97, 0, 45, 45, 1653, 45, 45, 45, 45, 45, 45, 383, 45, 45, 45, 45, 45, 45, 45, 45, 45, 986, 45, 45, 45, 45, 45, 45, 45, 45, 1670, 45, 1672, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 736, 67, 67, 67, 67, 67, 741, 67, 67, 67, 1680, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1074, 67, 67, 67, 1692, 67, 67, 67, 67, 67, 67, 67, 1697, 67, 1699, 67, 67, 67, 67, 67, 67, 1041, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1044, 67, 67, 67, 67, 67, 67, 67, 1769, 67, 67, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 97, 97, 624, 97, 97, 97, 97, 97, 97, 634, 97, 97, 1792, 97, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 958, 45, 45, 45, 45, 45, 45, 964, 45, 150, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 977, 204, 45, 67, 67, 67, 217, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 787, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 271, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 97, 97, 297, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1108, 97, 97, 97, 97, 97, 97, 97, 97, 351, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 45, 45, 938, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1398, 45, 45, 45, 153, 45, 161, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 660, 661, 45, 45, 205, 45, 67, 67, 67, 67, 220, 67, 228, 67, 67, 67, 67, 67, 67, 67, 0, 0, 0, 1302, 0, 0, 0, 1308, 0, 67, 67, 67, 67, 67, 272, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 97, 97, 352, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 45, 439, 45, 45, 45, 45, 45, 445, 45, 45, 45, 452, 45, 45, 67, 67, 212, 216, 67, 67, 67, 67, 67, 241, 67, 246, 67, 252, 67, 67, 486, 67, 67, 67, 67, 67, 67, 67, 494, 67, 67, 67, 67, 67, 67, 67, 1272, 67, 67, 67, 67, 67, 67, 67, 67, 507, 67, 67, 67, 67, 67, 67, 67, 67, 521, 67, 67, 525, 67, 67, 67, 67, 67, 531, 67, 67, 67, 538, 67, 0, 0, 2046, 97, 97, 97, 45, 45, 67, 67, 0, 0, 97, 97, 45, 45, 45, 1192, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1418, 45, 45, 1421, 97, 97, 583, 97, 97, 97, 97, 97, 97, 97, 591, 97, 97, 97, 97, 97, 97, 913, 97, 97, 97, 97, 97, 97, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 1384, 97, 618, 97, 97, 622, 97, 97, 97, 97, 97, 628, 97, 97, 97, 635, 97, 18, 131427, 0, 0, 0, 639, 0, 132, 362, 0, 0, 365, 29315, 367, 0, 921, 29315, 0, 0, 0, 0, 45, 45, 45, 45, 932, 45, 45, 45, 45, 45, 1544, 45, 45, 45, 45, 45, 1550, 45, 45, 45, 45, 45, 1194, 45, 1196, 45, 45, 45, 45, 45, 45, 45, 45, 999, 45, 45, 45, 45, 45, 67, 67, 45, 45, 667, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1408, 45, 45, 45, 696, 45, 45, 45, 701, 45, 45, 45, 45, 45, 45, 45, 45, 710, 45, 45, 45, 1220, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 194, 45, 45, 45, 729, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 797, 67, 67, 67, 67, 67, 67, 805, 67, 67, 67, 67, 67, 67, 67, 1695, 67, 67, 67, 67, 67, 1700, 67, 1702, 67, 67, 67, 67, 67, 814, 816, 67, 67, 67, 67, 67, 25398, 542, 13112, 544, 67, 67, 1008, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1020, 67, 0, 97, 45, 67, 0, 97, 45, 67, 0, 97, 45, 67, 97, 0, 0, 97, 97, 97, 97, 97, 45, 45, 45, 45, 67, 67, 67, 67, 1429, 67, 1430, 67, 67, 67, 67, 67, 1062, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 518, 1076, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 0, 0, 0, 0, 0, 0, 28809, 0, 139, 45, 45, 45, 45, 45, 97, 97, 97, 97, 1102, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1124, 97, 1126, 97, 97, 1114, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1112, 97, 97, 1156, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 594, 97, 97, 97, 97, 1170, 97, 97, 97, 97, 0, 921, 0, 0, 0, 0, 0, 0, 45, 45, 45, 45, 1532, 45, 45, 45, 45, 1536, 45, 45, 45, 45, 45, 172, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 706, 45, 45, 709, 45, 45, 1177, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1202, 45, 1204, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1215, 45, 45, 45, 1232, 45, 45, 45, 45, 45, 45, 45, 67, 1237, 67, 67, 67, 67, 67, 67, 1259, 67, 67, 67, 67, 67, 67, 1264, 67, 67, 67, 1282, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1289, 67, 67, 67, 1292, 97, 97, 97, 97, 1339, 97, 97, 97, 97, 97, 97, 1344, 97, 97, 97, 97, 45, 1849, 45, 1851, 45, 45, 45, 45, 45, 45, 45, 45, 721, 45, 45, 45, 45, 45, 726, 45, 1385, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1188, 45, 45, 1401, 1402, 45, 45, 45, 45, 1405, 45, 45, 45, 45, 45, 45, 45, 45, 1752, 45, 45, 45, 45, 45, 67, 67, 1410, 45, 45, 45, 1413, 45, 1415, 45, 45, 45, 45, 45, 45, 1419, 45, 45, 45, 45, 1806, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 97, 97, 2019, 0, 97, 67, 67, 67, 1452, 67, 67, 67, 67, 67, 67, 67, 67, 1457, 67, 67, 67, 67, 67, 67, 1271, 67, 67, 67, 1274, 67, 67, 67, 1279, 67, 1460, 67, 1462, 67, 67, 67, 67, 67, 67, 1466, 67, 67, 67, 67, 67, 67, 67, 67, 1602, 67, 67, 1605, 67, 67, 67, 0, 97, 97, 97, 1506, 97, 97, 97, 97, 97, 97, 97, 97, 1512, 97, 97, 97, 0, 1728, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 901, 97, 97, 97, 97, 1515, 97, 1517, 97, 97, 97, 97, 97, 97, 1521, 97, 97, 97, 97, 97, 97, 0, 45, 1652, 45, 45, 45, 1655, 45, 45, 45, 45, 45, 1542, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1552, 1553, 45, 45, 45, 1556, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 693, 45, 45, 45, 67, 67, 67, 67, 1572, 67, 67, 67, 67, 1576, 67, 67, 67, 67, 67, 67, 67, 67, 1685, 67, 67, 67, 67, 67, 67, 67, 67, 1465, 67, 67, 1468, 67, 67, 1471, 67, 67, 1582, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1580, 67, 67, 1596, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 0, 542, 0, 544, 67, 67, 67, 67, 1759, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 533, 67, 67, 67, 67, 67, 67, 67, 1770, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 97, 1777, 97, 97, 97, 1793, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 998, 45, 45, 1001, 1002, 45, 45, 67, 67, 45, 1861, 45, 67, 67, 67, 67, 67, 67, 67, 67, 1871, 67, 1873, 1874, 67, 0, 97, 45, 67, 0, 97, 45, 67, 16384, 97, 45, 67, 97, 0, 0, 0, 1473, 0, 1082, 0, 0, 0, 1475, 0, 1086, 0, 0, 0, 1477, 1876, 67, 97, 97, 97, 97, 97, 1883, 0, 1885, 97, 97, 97, 1889, 0, 0, 0, 286, 0, 0, 0, 286, 0, 2371584, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 40976, 0, 18, 18, 24, 24, 126, 126, 126, 2053, 0, 2055, 45, 67, 0, 97, 45, 67, 0, 97, 45, 67, 97, 0, 0, 97, 97, 97, 2039, 97, 45, 45, 45, 45, 67, 67, 67, 67, 67, 226, 67, 67, 67, 67, 67, 67, 67, 67, 1246, 67, 67, 1249, 1250, 67, 67, 67, 132, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 141, 45, 45, 45, 1403, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1186, 45, 45, 1189, 45, 45, 155, 45, 45, 45, 45, 45, 45, 45, 45, 45, 191, 45, 45, 45, 45, 700, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1753, 45, 45, 45, 67, 67, 45, 45, 67, 208, 67, 67, 67, 222, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1764, 67, 67, 67, 67, 67, 67, 67, 258, 67, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 288, 97, 97, 97, 302, 97, 97, 97, 97, 97, 97, 97, 97, 97, 627, 97, 97, 97, 97, 97, 97, 338, 97, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 131427, 0, 0, 0, 0, 362, 0, 365, 28809, 367, 139, 45, 370, 45, 45, 45, 45, 716, 45, 45, 45, 45, 45, 722, 45, 45, 45, 45, 45, 45, 1912, 67, 67, 67, 67, 67, 67, 67, 67, 67, 819, 67, 67, 25398, 542, 13112, 544, 45, 403, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1409, 45, 67, 67, 67, 67, 489, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 771, 67, 67, 67, 67, 520, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 534, 67, 67, 67, 67, 67, 67, 1286, 67, 67, 67, 67, 67, 67, 67, 1291, 67, 67, 24850, 24850, 12564, 12564, 0, 57889, 0, 0, 0, 53531, 53531, 367, 286, 97, 553, 97, 97, 97, 97, 586, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1138, 97, 97, 97, 97, 617, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 631, 97, 97, 97, 0, 1834, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 97, 353, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 45, 45, 668, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 724, 45, 45, 45, 45, 45, 682, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 949, 45, 45, 45, 67, 67, 747, 748, 67, 67, 67, 67, 755, 67, 67, 67, 67, 67, 67, 67, 0, 0, 1301, 0, 0, 0, 1307, 0, 0, 67, 794, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1701, 67, 97, 97, 97, 845, 846, 97, 97, 97, 97, 853, 97, 97, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 97, 97, 892, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 610, 97, 97, 45, 992, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 1239, 67, 67, 67, 1063, 67, 67, 67, 67, 67, 1068, 67, 67, 67, 67, 67, 67, 67, 0, 1299, 0, 0, 0, 1305, 0, 0, 0, 97, 1141, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1152, 97, 97, 0, 0, 97, 97, 1784, 97, 97, 97, 0, 0, 97, 97, 0, 97, 1978, 97, 97, 97, 1982, 45, 45, 45, 45, 45, 45, 45, 45, 45, 972, 973, 45, 45, 45, 45, 45, 97, 97, 97, 97, 1157, 97, 97, 97, 97, 97, 1162, 97, 97, 97, 97, 97, 97, 1145, 97, 97, 97, 97, 97, 1151, 97, 97, 97, 1253, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 539, 45, 1423, 45, 45, 67, 67, 67, 67, 67, 67, 67, 1431, 67, 67, 67, 67, 67, 67, 67, 1773, 67, 97, 97, 97, 97, 97, 97, 97, 625, 97, 97, 97, 97, 97, 97, 97, 97, 850, 97, 97, 97, 97, 97, 97, 97, 97, 880, 97, 97, 97, 97, 97, 97, 97, 97, 1106, 97, 97, 97, 97, 97, 97, 97, 67, 67, 1439, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 514, 67, 67, 97, 97, 1492, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 611, 97, 97, 1703, 67, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 97, 97, 97, 97, 852, 97, 97, 97, 97, 97, 97, 45, 1949, 45, 1951, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 1961, 67, 0, 97, 45, 67, 0, 97, 2060, 2061, 0, 2062, 45, 67, 97, 0, 0, 2036, 97, 97, 97, 97, 45, 45, 45, 45, 67, 67, 67, 67, 67, 223, 67, 67, 237, 67, 67, 67, 67, 67, 67, 67, 1297, 0, 0, 0, 1303, 0, 0, 0, 1309, 1963, 67, 67, 67, 97, 97, 97, 97, 0, 1972, 0, 97, 97, 97, 1975, 0, 921, 29315, 0, 0, 0, 0, 45, 45, 45, 931, 45, 45, 45, 45, 45, 407, 45, 45, 45, 45, 45, 45, 45, 45, 45, 417, 45, 45, 1989, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1996, 97, 18, 131427, 0, 0, 360, 0, 0, 0, 362, 0, 0, 365, 29315, 367, 0, 921, 29315, 0, 0, 0, 0, 45, 45, 930, 45, 45, 45, 45, 45, 45, 444, 45, 45, 45, 45, 45, 45, 45, 67, 67, 97, 97, 1998, 0, 97, 97, 97, 0, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 1985, 45, 1986, 45, 45, 45, 156, 45, 45, 170, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 675, 45, 45, 45, 45, 679, 131427, 0, 358, 0, 0, 362, 0, 365, 28809, 367, 139, 45, 45, 45, 45, 45, 381, 45, 45, 45, 45, 45, 45, 45, 45, 45, 400, 45, 45, 419, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 436, 67, 67, 67, 67, 67, 505, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 820, 67, 25398, 542, 13112, 544, 67, 67, 522, 67, 67, 67, 67, 67, 529, 67, 67, 67, 67, 67, 67, 67, 0, 1300, 0, 0, 0, 1306, 0, 0, 0, 97, 97, 619, 97, 97, 97, 97, 97, 626, 97, 97, 97, 97, 97, 97, 97, 1105, 97, 97, 97, 97, 1109, 97, 97, 97, 67, 67, 67, 67, 749, 67, 67, 67, 67, 67, 67, 67, 67, 67, 760, 67, 0, 97, 45, 67, 2058, 97, 45, 67, 0, 97, 45, 67, 97, 0, 0, 97, 97, 97, 97, 97, 45, 45, 45, 2041, 67, 67, 67, 67, 67, 780, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 516, 67, 67, 97, 97, 97, 878, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1629, 97, 0, 45, 979, 45, 45, 45, 45, 984, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1000, 45, 45, 45, 45, 67, 67, 67, 1023, 67, 67, 67, 67, 1028, 67, 67, 67, 67, 67, 67, 67, 67, 67, 470, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 0, 1094, 0, 0, 0, 1092, 1315, 0, 0, 0, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1486, 97, 1489, 97, 97, 97, 1117, 97, 97, 97, 97, 1122, 97, 97, 97, 97, 97, 97, 97, 1146, 97, 97, 97, 97, 97, 97, 97, 97, 881, 97, 97, 97, 886, 97, 97, 97, 1311, 0, 0, 0, 0, 0, 0, 0, 0, 97, 97, 97, 97, 97, 97, 97, 1615, 97, 97, 97, 97, 97, 1619, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1631, 97, 97, 1847, 97, 45, 45, 45, 45, 1852, 45, 45, 45, 45, 45, 45, 45, 1235, 45, 45, 45, 67, 67, 67, 67, 67, 1868, 67, 67, 67, 1872, 67, 67, 67, 67, 67, 97, 97, 97, 97, 1882, 0, 0, 0, 97, 97, 97, 97, 0, 1891, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 1929, 0, 0, 97, 97, 97, 97, 97, 97, 45, 1900, 45, 1901, 45, 45, 45, 1905, 45, 67, 2054, 97, 45, 67, 0, 97, 45, 67, 0, 97, 45, 67, 97, 0, 0, 97, 2037, 2038, 97, 97, 45, 45, 45, 45, 67, 67, 67, 67, 1867, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1774, 97, 97, 97, 97, 97, 97, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 142, 45, 45, 45, 1412, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 432, 45, 45, 45, 45, 45, 157, 45, 45, 171, 45, 45, 45, 182, 45, 45, 45, 45, 200, 45, 45, 45, 1543, 45, 45, 45, 45, 45, 45, 45, 45, 1551, 45, 45, 45, 45, 1181, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1211, 45, 45, 45, 1214, 45, 45, 45, 67, 209, 67, 67, 67, 224, 67, 67, 238, 67, 67, 67, 249, 67, 0, 97, 2056, 2057, 0, 2059, 45, 67, 0, 97, 45, 67, 97, 0, 0, 1937, 97, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 1741, 45, 45, 45, 45, 45, 45, 67, 67, 67, 267, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 289, 97, 97, 97, 304, 97, 97, 318, 97, 97, 97, 329, 97, 97, 0, 0, 97, 97, 2001, 0, 97, 2003, 97, 97, 97, 45, 45, 45, 1739, 45, 45, 45, 1742, 45, 45, 45, 45, 45, 97, 97, 347, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 45, 666, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1420, 45, 57889, 0, 0, 54074, 54074, 550, 0, 97, 97, 97, 97, 97, 97, 97, 97, 840, 67, 1007, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 759, 67, 67, 67, 67, 67, 67, 67, 1052, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1031, 67, 67, 67, 67, 67, 97, 97, 97, 1101, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 592, 97, 97, 97, 1190, 45, 45, 45, 45, 45, 1195, 45, 1197, 45, 45, 45, 45, 1201, 45, 45, 45, 45, 1952, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 250, 67, 67, 67, 1255, 67, 1257, 67, 67, 67, 67, 1261, 67, 67, 67, 67, 67, 67, 67, 67, 1696, 67, 67, 67, 67, 67, 67, 67, 0, 0, 0, 0, 0, 0, 2162688, 0, 0, 67, 67, 1267, 67, 67, 67, 67, 67, 67, 1273, 67, 67, 67, 67, 67, 67, 67, 67, 1763, 67, 67, 67, 67, 67, 67, 67, 0, 0, 0, 0, 0, 280, 94, 0, 0, 1281, 67, 67, 67, 67, 1285, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1070, 67, 67, 67, 67, 67, 1335, 97, 1337, 97, 97, 97, 97, 1341, 97, 97, 97, 97, 97, 97, 97, 97, 882, 97, 97, 97, 97, 97, 97, 97, 1347, 97, 97, 97, 97, 97, 97, 1353, 97, 97, 97, 97, 97, 97, 1361, 97, 18, 131427, 0, 638, 0, 0, 0, 0, 362, 0, 0, 365, 29315, 367, 0, 544, 0, 550, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2478080, 2158592, 2158592, 2158592, 2994176, 2158592, 2158592, 2207744, 2207744, 2486272, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 2207744, 0, 0, 0, 0, 0, 0, 2162688, 0, 53530, 97, 97, 97, 1365, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 608, 97, 97, 97, 45, 45, 1424, 45, 1425, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1058, 67, 67, 67, 67, 45, 1555, 45, 45, 1557, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 707, 45, 45, 45, 45, 67, 67, 1570, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 773, 67, 67, 1595, 67, 67, 1597, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 139, 2158592, 2158592, 2158592, 2408448, 2416640, 97, 97, 97, 1636, 97, 97, 97, 1639, 97, 97, 1641, 97, 97, 97, 97, 97, 97, 1173, 0, 921, 0, 0, 0, 0, 0, 0, 45, 67, 67, 67, 1693, 67, 67, 67, 67, 67, 67, 67, 1698, 67, 67, 67, 67, 67, 67, 273, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 1860, 45, 45, 67, 67, 1865, 67, 67, 67, 67, 1870, 67, 67, 67, 67, 1875, 67, 67, 97, 97, 1880, 97, 97, 0, 0, 0, 97, 97, 1888, 97, 0, 0, 0, 1938, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 1854, 45, 45, 45, 45, 45, 45, 45, 1909, 45, 45, 1911, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1248, 67, 67, 67, 67, 67, 67, 1922, 67, 67, 1924, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 97, 1898, 45, 45, 45, 45, 45, 45, 1904, 45, 45, 67, 67, 67, 67, 97, 97, 97, 97, 0, 0, 16384, 97, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 1724, 2008, 2009, 45, 45, 67, 67, 67, 2014, 2015, 67, 67, 97, 97, 0, 0, 97, 97, 97, 0, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 2022, 0, 2023, 97, 97, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 1869, 67, 67, 67, 67, 67, 67, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 45, 147, 151, 154, 45, 162, 45, 45, 176, 178, 181, 45, 45, 45, 192, 196, 45, 45, 45, 45, 2012, 67, 67, 67, 67, 67, 67, 2018, 97, 0, 0, 97, 1894, 1895, 97, 1897, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 656, 45, 45, 45, 45, 45, 45, 67, 259, 263, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 97, 294, 298, 301, 97, 309, 97, 97, 323, 325, 328, 97, 97, 97, 97, 97, 560, 97, 97, 97, 569, 97, 97, 97, 97, 97, 97, 306, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1624, 97, 97, 97, 97, 97, 97, 97, 0, 921, 0, 1175, 0, 0, 0, 0, 45, 339, 343, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 67, 67, 503, 67, 67, 67, 67, 67, 67, 67, 67, 67, 512, 67, 67, 519, 97, 97, 600, 97, 97, 97, 97, 97, 97, 97, 97, 97, 609, 97, 97, 616, 45, 649, 45, 45, 45, 45, 45, 654, 45, 45, 45, 45, 45, 45, 45, 45, 1393, 45, 45, 45, 45, 45, 45, 45, 45, 1209, 45, 45, 45, 45, 45, 45, 45, 67, 763, 67, 67, 67, 67, 67, 67, 67, 67, 770, 67, 67, 67, 774, 67, 0, 2045, 97, 97, 97, 97, 45, 45, 67, 67, 0, 0, 97, 97, 45, 45, 45, 994, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 213, 67, 219, 67, 67, 232, 67, 242, 67, 247, 67, 67, 67, 779, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1018, 67, 67, 67, 67, 811, 67, 67, 67, 67, 67, 67, 67, 67, 67, 25398, 542, 13112, 544, 57889, 0, 0, 54074, 54074, 550, 0, 97, 834, 97, 97, 97, 97, 97, 839, 97, 18, 131427, 0, 638, 0, 0, 0, 0, 362, 0, 0, 365, 29315, 367, 645, 97, 97, 861, 97, 97, 97, 97, 97, 97, 97, 97, 868, 97, 97, 97, 872, 97, 97, 877, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 613, 97, 97, 97, 97, 97, 909, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 0, 0, 18, 18, 24, 24, 27, 27, 27, 1036, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1047, 67, 67, 67, 1050, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1033, 67, 67, 67, 97, 97, 1130, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 638, 0, 0, 67, 67, 67, 1295, 67, 67, 67, 0, 0, 0, 0, 0, 0, 0, 0, 0, 97, 1317, 97, 97, 97, 97, 97, 97, 1375, 97, 97, 97, 0, 0, 0, 45, 1379, 45, 45, 45, 45, 45, 45, 422, 45, 45, 45, 429, 431, 45, 45, 45, 45, 0, 1090, 0, 0, 97, 1479, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1357, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1716, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1723, 0, 921, 29315, 0, 0, 0, 0, 45, 929, 45, 45, 45, 45, 45, 45, 45, 1234, 45, 45, 45, 45, 67, 67, 67, 67, 1240, 97, 97, 97, 1738, 45, 45, 45, 45, 45, 45, 45, 1743, 45, 45, 45, 45, 166, 45, 45, 45, 45, 184, 186, 45, 45, 197, 45, 45, 97, 1779, 0, 0, 97, 97, 97, 97, 97, 97, 0, 0, 97, 97, 0, 97, 18, 131427, 0, 638, 0, 0, 0, 0, 362, 0, 640, 365, 29315, 367, 0, 921, 29315, 0, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1539, 45, 45, 1803, 45, 45, 45, 45, 45, 1809, 45, 45, 45, 67, 67, 67, 1814, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 0, 0, 0, 1932, 97, 97, 0, 1781, 97, 97, 97, 97, 97, 97, 0, 0, 97, 97, 0, 97, 67, 67, 67, 1818, 67, 67, 67, 67, 67, 1824, 67, 67, 67, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 1890, 0, 1829, 97, 97, 0, 0, 97, 97, 1836, 97, 97, 0, 0, 0, 97, 97, 97, 97, 1981, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1987, 1845, 97, 97, 97, 45, 45, 45, 45, 45, 1853, 45, 45, 45, 1857, 45, 45, 45, 67, 1864, 67, 1866, 67, 67, 67, 67, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 97, 97, 1710, 1711, 67, 67, 97, 97, 97, 97, 97, 0, 0, 0, 1886, 97, 97, 97, 0, 0, 97, 97, 97, 97, 1838, 0, 0, 0, 97, 1843, 97, 0, 1893, 97, 97, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1745, 45, 45, 67, 2044, 0, 97, 97, 97, 97, 45, 45, 67, 67, 0, 0, 97, 97, 45, 45, 45, 1660, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 453, 45, 455, 67, 67, 67, 67, 268, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 348, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 131427, 0, 359, 0, 0, 362, 0, 365, 28809, 367, 139, 45, 45, 45, 45, 45, 421, 45, 45, 45, 45, 45, 45, 45, 434, 45, 45, 695, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1667, 45, 0, 921, 29315, 0, 925, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1548, 45, 45, 45, 45, 45, 45, 67, 1037, 67, 1039, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1277, 67, 67, 67, 67, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 0, 1095, 0, 0, 0, 1096, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 869, 97, 97, 97, 97, 97, 97, 1131, 97, 1133, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1370, 97, 97, 97, 97, 97, 1312, 0, 0, 0, 0, 1096, 0, 0, 0, 97, 97, 97, 97, 97, 97, 97, 1327, 97, 97, 97, 97, 97, 1332, 97, 97, 97, 1830, 97, 0, 0, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 1896, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1210, 45, 45, 45, 45, 45, 45, 133, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 45, 45, 380, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 401, 45, 45, 158, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1200, 45, 45, 45, 45, 206, 67, 67, 67, 67, 67, 225, 67, 67, 67, 67, 67, 67, 67, 67, 754, 67, 67, 67, 67, 67, 67, 67, 57889, 0, 0, 54074, 54074, 550, 832, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1342, 97, 97, 97, 97, 97, 97, 67, 67, 67, 67, 67, 25398, 1083, 13112, 1087, 54074, 1091, 0, 0, 0, 0, 0, 0, 1316, 0, 831, 97, 97, 97, 97, 97, 97, 97, 1174, 921, 0, 1175, 0, 0, 0, 0, 45, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 45, 148, 67, 67, 264, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 97, 295, 97, 97, 97, 97, 313, 97, 97, 97, 97, 331, 333, 97, 18, 131427, 356, 638, 0, 0, 0, 0, 362, 0, 0, 365, 0, 367, 0, 45, 45, 1530, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 988, 45, 45, 45, 97, 344, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 402, 404, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1756, 67, 438, 45, 45, 45, 45, 45, 45, 45, 45, 449, 450, 45, 45, 45, 67, 67, 214, 218, 221, 67, 229, 67, 67, 243, 245, 248, 67, 67, 67, 67, 67, 488, 490, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1071, 67, 1073, 67, 67, 67, 67, 67, 524, 67, 67, 67, 67, 67, 67, 67, 67, 535, 536, 67, 67, 67, 67, 67, 67, 1683, 1684, 67, 67, 67, 67, 1688, 1689, 67, 67, 67, 67, 67, 67, 1694, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1288, 67, 67, 67, 67, 67, 67, 97, 97, 97, 585, 587, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1163, 97, 97, 97, 97, 97, 97, 97, 621, 97, 97, 97, 97, 97, 97, 97, 97, 632, 633, 97, 97, 0, 0, 97, 1783, 97, 97, 97, 97, 0, 0, 97, 97, 0, 97, 97, 97, 45, 2026, 45, 45, 45, 45, 67, 2030, 67, 67, 67, 67, 67, 67, 1053, 1054, 67, 67, 67, 67, 67, 67, 1061, 67, 712, 45, 45, 45, 717, 45, 45, 45, 45, 45, 45, 45, 45, 725, 45, 45, 45, 163, 167, 173, 177, 45, 45, 45, 45, 45, 193, 45, 45, 45, 45, 982, 45, 45, 45, 45, 45, 45, 987, 45, 45, 45, 45, 45, 1558, 45, 1560, 45, 45, 45, 45, 45, 45, 45, 45, 704, 705, 45, 45, 45, 45, 45, 45, 45, 45, 731, 45, 45, 45, 67, 67, 67, 67, 67, 739, 67, 67, 67, 67, 67, 67, 464, 67, 67, 67, 67, 67, 67, 479, 67, 67, 67, 67, 67, 764, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1290, 67, 67, 67, 67, 67, 67, 812, 67, 67, 67, 67, 818, 67, 67, 67, 25398, 542, 13112, 544, 57889, 0, 0, 54074, 54074, 550, 0, 97, 97, 97, 97, 97, 837, 97, 97, 97, 97, 97, 602, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1137, 97, 97, 97, 97, 97, 97, 97, 97, 97, 862, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1627, 97, 97, 97, 0, 97, 97, 97, 97, 910, 97, 97, 97, 97, 916, 97, 97, 97, 0, 0, 0, 97, 97, 1940, 97, 97, 1942, 45, 45, 45, 45, 45, 45, 385, 45, 45, 45, 45, 395, 45, 45, 45, 45, 966, 45, 969, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 975, 45, 45, 45, 406, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 974, 45, 45, 45, 67, 67, 67, 67, 1010, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1262, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1040, 67, 1042, 67, 1045, 67, 67, 67, 67, 67, 67, 67, 527, 67, 67, 67, 67, 67, 67, 537, 67, 67, 67, 67, 67, 1051, 67, 67, 67, 67, 67, 1057, 67, 67, 67, 67, 67, 67, 67, 1454, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1445, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1079, 25398, 0, 13112, 0, 54074, 0, 0, 0, 0, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2207744, 2207744, 2207744, 2207744, 2207744, 2576384, 2207744, 2207744, 2207744, 1098, 97, 97, 97, 97, 97, 1104, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1356, 97, 97, 97, 97, 97, 97, 1128, 97, 97, 97, 97, 97, 97, 1134, 97, 1136, 97, 1139, 97, 97, 97, 97, 97, 97, 1622, 97, 97, 97, 97, 97, 97, 97, 97, 0, 921, 0, 0, 0, 1176, 0, 646, 45, 67, 67, 67, 1268, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1469, 67, 67, 67, 97, 1348, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1127, 97, 67, 1569, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1448, 1449, 67, 1816, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1825, 67, 67, 1827, 97, 97, 0, 0, 1782, 97, 97, 97, 97, 97, 0, 0, 97, 97, 0, 97, 97, 97, 1831, 0, 0, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 1980, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1395, 45, 45, 45, 45, 45, 97, 1846, 97, 97, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1212, 45, 45, 45, 45, 45, 45, 2010, 45, 67, 67, 67, 67, 67, 2016, 67, 97, 97, 0, 0, 97, 97, 97, 0, 97, 97, 97, 97, 97, 45, 45, 2007, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 143, 45, 45, 45, 1671, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 1813, 67, 67, 1815, 45, 45, 67, 210, 67, 67, 67, 67, 67, 67, 239, 67, 67, 67, 67, 67, 67, 67, 1575, 67, 67, 67, 67, 67, 67, 67, 67, 493, 67, 67, 67, 67, 67, 67, 67, 97, 97, 290, 97, 97, 97, 97, 97, 97, 319, 97, 97, 97, 97, 97, 97, 303, 97, 97, 317, 97, 97, 97, 97, 97, 97, 305, 97, 97, 97, 97, 97, 97, 97, 97, 97, 899, 97, 97, 97, 97, 97, 97, 375, 45, 45, 45, 379, 45, 45, 390, 45, 45, 394, 45, 45, 45, 45, 45, 443, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 461, 67, 67, 67, 465, 67, 67, 476, 67, 67, 480, 67, 67, 67, 67, 67, 67, 1761, 67, 67, 67, 67, 67, 67, 67, 67, 67, 530, 67, 67, 67, 67, 67, 67, 500, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1075, 97, 97, 97, 558, 97, 97, 97, 562, 97, 97, 573, 97, 97, 577, 97, 97, 0, 1999, 97, 97, 97, 0, 97, 97, 2004, 2005, 97, 45, 45, 45, 45, 1193, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 676, 45, 45, 45, 45, 597, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1334, 45, 681, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1396, 45, 45, 1399, 45, 45, 730, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1434, 67, 67, 67, 67, 67, 67, 750, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1456, 67, 67, 67, 67, 67, 45, 45, 993, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 1238, 67, 67, 1006, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1280, 1048, 1049, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1059, 67, 67, 67, 67, 67, 67, 1296, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2371584, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 97, 97, 1100, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 638, 0, 920, 97, 97, 1142, 1143, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1153, 97, 97, 97, 97, 97, 1144, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1149, 97, 97, 97, 97, 1154, 45, 1218, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1678, 45, 45, 45, 67, 67, 67, 67, 67, 1269, 67, 67, 67, 67, 67, 67, 67, 67, 1278, 67, 67, 67, 67, 67, 67, 1772, 67, 67, 97, 97, 97, 97, 97, 97, 97, 0, 921, 922, 1175, 0, 0, 0, 0, 45, 97, 97, 1349, 97, 97, 97, 97, 97, 97, 97, 97, 1358, 97, 97, 97, 97, 97, 97, 1623, 97, 97, 97, 97, 97, 97, 97, 97, 0, 921, 0, 0, 926, 0, 0, 0, 45, 45, 1411, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1754, 45, 45, 67, 67, 1301, 0, 1307, 0, 1313, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 21054, 97, 97, 97, 97, 67, 1757, 67, 67, 67, 1760, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1467, 67, 67, 67, 67, 67, 1778, 97, 0, 0, 97, 97, 97, 97, 97, 97, 0, 0, 97, 97, 0, 97, 97, 97, 97, 97, 1158, 97, 97, 97, 1161, 97, 97, 97, 97, 1166, 97, 97, 97, 97, 97, 1325, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1328, 97, 97, 97, 97, 97, 97, 97, 67, 67, 67, 67, 67, 1820, 67, 1822, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 0, 0, 0, 97, 1933, 97, 1892, 97, 97, 97, 97, 97, 97, 1899, 45, 45, 45, 45, 45, 45, 45, 45, 1664, 45, 45, 45, 45, 45, 45, 45, 45, 1546, 45, 45, 45, 45, 45, 45, 45, 45, 1208, 45, 45, 45, 45, 45, 45, 45, 45, 1224, 45, 45, 45, 45, 45, 45, 45, 45, 673, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 1925, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 97, 623, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 307, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1796, 97, 45, 45, 45, 45, 45, 45, 45, 970, 45, 45, 45, 45, 45, 45, 45, 45, 1417, 45, 45, 45, 45, 45, 45, 45, 67, 1964, 67, 67, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 1721, 97, 97, 0, 0, 1997, 97, 0, 0, 2000, 97, 97, 0, 97, 97, 97, 97, 97, 45, 45, 45, 45, 733, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 803, 67, 67, 67, 67, 67, 0, 94242, 0, 0, 0, 38, 102439, 0, 0, 106538, 98347, 28809, 45, 45, 144, 45, 45, 45, 1805, 45, 1807, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 231, 67, 67, 67, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 281, 28809, 53531, 45, 45, 67, 211, 67, 67, 67, 67, 230, 234, 240, 244, 67, 67, 67, 67, 67, 67, 492, 67, 67, 67, 67, 67, 67, 67, 67, 67, 471, 67, 67, 67, 67, 481, 67, 67, 260, 67, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 97, 291, 97, 97, 97, 97, 310, 314, 320, 324, 97, 97, 97, 97, 97, 97, 1367, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1355, 97, 97, 97, 97, 97, 97, 1362, 340, 97, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 131427, 0, 0, 360, 0, 362, 0, 365, 28809, 367, 139, 369, 45, 45, 45, 374, 67, 67, 460, 67, 67, 67, 67, 466, 67, 67, 67, 67, 67, 67, 67, 67, 801, 67, 67, 67, 67, 67, 67, 67, 67, 67, 487, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 498, 67, 67, 67, 67, 67, 67, 1821, 67, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 0, 0, 67, 502, 67, 67, 67, 67, 67, 67, 67, 508, 67, 67, 67, 515, 517, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 0, 0, 1931, 97, 97, 97, 97, 97, 588, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 629, 97, 97, 97, 97, 97, 67, 24850, 24850, 12564, 12564, 0, 57889, 0, 0, 0, 53531, 53531, 367, 286, 552, 97, 97, 97, 97, 97, 1352, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1511, 97, 97, 97, 97, 97, 97, 97, 557, 97, 97, 97, 97, 563, 97, 97, 97, 97, 97, 97, 97, 97, 1135, 97, 97, 97, 97, 97, 97, 97, 97, 97, 584, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 595, 97, 97, 97, 97, 97, 895, 97, 97, 97, 97, 97, 97, 903, 97, 97, 97, 0, 97, 97, 1638, 97, 97, 97, 97, 97, 97, 97, 97, 1646, 97, 599, 97, 97, 97, 97, 97, 97, 97, 605, 97, 97, 97, 612, 614, 97, 97, 97, 97, 97, 1377, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 655, 45, 45, 45, 45, 45, 45, 45, 745, 67, 67, 67, 67, 751, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1577, 67, 67, 67, 67, 67, 762, 67, 67, 67, 67, 766, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1765, 67, 67, 67, 67, 67, 777, 67, 67, 781, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1592, 1593, 67, 67, 97, 843, 97, 97, 97, 97, 849, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1510, 97, 97, 97, 97, 97, 97, 97, 860, 97, 97, 97, 97, 864, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1797, 45, 45, 45, 45, 1801, 45, 97, 875, 97, 97, 879, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1522, 97, 97, 97, 97, 97, 991, 45, 45, 45, 45, 996, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 215, 67, 67, 67, 67, 233, 67, 67, 67, 67, 251, 253, 1022, 67, 67, 67, 1026, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1035, 67, 67, 1038, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1458, 67, 67, 67, 67, 67, 1064, 67, 67, 67, 1067, 67, 67, 67, 67, 1072, 67, 67, 67, 67, 67, 67, 1442, 67, 67, 67, 67, 67, 67, 67, 67, 67, 97, 97, 97, 1775, 97, 97, 97, 67, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 0, 0, 1096, 0, 921, 29315, 0, 0, 0, 0, 928, 45, 45, 45, 45, 45, 934, 45, 45, 45, 164, 45, 45, 45, 45, 45, 45, 45, 45, 45, 198, 45, 45, 45, 378, 45, 45, 45, 45, 45, 45, 393, 45, 45, 45, 398, 45, 97, 97, 1116, 97, 97, 97, 1120, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1147, 1148, 97, 97, 97, 97, 97, 97, 97, 1129, 97, 97, 1132, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1626, 97, 97, 97, 97, 0, 45, 1178, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1185, 45, 45, 45, 45, 441, 45, 45, 45, 45, 45, 45, 451, 45, 45, 67, 67, 67, 67, 67, 227, 67, 67, 67, 67, 67, 67, 67, 67, 1260, 67, 67, 67, 1263, 67, 67, 1265, 1203, 45, 45, 1205, 45, 1206, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1216, 67, 1266, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1276, 67, 67, 67, 67, 67, 67, 752, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1056, 67, 67, 67, 67, 67, 67, 45, 1386, 45, 1389, 45, 45, 45, 45, 1394, 45, 45, 45, 1397, 45, 45, 45, 45, 995, 45, 997, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 1915, 67, 67, 67, 67, 67, 1422, 45, 45, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1433, 67, 1436, 67, 67, 67, 67, 1441, 67, 67, 67, 1444, 67, 67, 67, 67, 67, 67, 67, 0, 24851, 12565, 0, 0, 0, 0, 28809, 53532, 97, 97, 97, 97, 1494, 97, 97, 97, 1497, 97, 97, 97, 97, 97, 97, 97, 1368, 97, 97, 97, 97, 97, 97, 97, 97, 851, 97, 97, 97, 97, 97, 97, 97, 67, 67, 67, 1571, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 25398, 542, 13112, 544, 67, 67, 1583, 67, 67, 67, 67, 67, 67, 67, 67, 1591, 67, 67, 67, 67, 67, 67, 782, 67, 67, 67, 67, 67, 67, 67, 67, 67, 756, 67, 67, 67, 67, 67, 67, 97, 1634, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1125, 97, 97, 97, 1647, 97, 97, 97, 97, 97, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 719, 720, 45, 45, 45, 45, 45, 45, 45, 45, 685, 45, 45, 45, 45, 45, 45, 45, 45, 45, 942, 45, 45, 946, 45, 45, 45, 950, 45, 45, 1658, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1668, 1712, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 0, 0, 1835, 97, 97, 97, 97, 0, 0, 0, 97, 97, 1844, 97, 97, 1726, 0, 97, 97, 97, 97, 97, 1732, 97, 1734, 97, 97, 97, 97, 97, 300, 97, 308, 97, 97, 97, 97, 97, 97, 97, 97, 866, 97, 97, 97, 97, 97, 97, 97, 67, 67, 67, 1758, 67, 67, 67, 1762, 67, 67, 67, 67, 67, 67, 67, 67, 1043, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1771, 67, 67, 67, 97, 97, 97, 97, 97, 1776, 97, 97, 97, 97, 97, 1794, 97, 97, 97, 45, 45, 45, 45, 45, 45, 45, 1183, 45, 45, 45, 45, 45, 45, 45, 45, 45, 409, 45, 45, 45, 45, 45, 45, 67, 67, 67, 1966, 97, 97, 97, 1970, 0, 0, 0, 97, 97, 97, 97, 0, 97, 97, 97, 1720, 97, 97, 97, 97, 97, 0, 0, 97, 97, 97, 1837, 97, 0, 1840, 1841, 97, 97, 97, 1988, 45, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1994, 1995, 67, 97, 97, 97, 97, 97, 911, 97, 97, 97, 97, 97, 97, 97, 638, 0, 0, 0, 0, 1315, 0, 0, 0, 0, 97, 97, 97, 1319, 97, 97, 97, 0, 97, 97, 97, 97, 97, 97, 1733, 97, 97, 97, 97, 97, 97, 1340, 97, 97, 97, 1343, 97, 97, 1345, 97, 1346, 67, 67, 265, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 345, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 131427, 0, 0, 0, 361, 362, 0, 365, 28809, 367, 139, 45, 45, 45, 45, 45, 671, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 411, 45, 45, 414, 45, 45, 45, 45, 377, 45, 45, 45, 386, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1207, 45, 45, 45, 45, 45, 45, 1213, 45, 45, 67, 67, 67, 67, 67, 463, 67, 67, 67, 472, 67, 67, 67, 67, 67, 67, 67, 528, 67, 67, 67, 67, 67, 67, 67, 67, 1287, 67, 67, 67, 67, 67, 67, 67, 540, 24850, 24850, 12564, 12564, 0, 57889, 0, 0, 0, 53531, 53531, 367, 286, 97, 97, 97, 97, 97, 1103, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 917, 97, 97, 0, 0, 0, 637, 18, 131427, 0, 0, 0, 0, 0, 0, 362, 0, 0, 365, 29315, 367, 0, 921, 29315, 0, 0, 0, 927, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1223, 45, 45, 45, 45, 45, 45, 45, 45, 45, 426, 45, 45, 433, 45, 45, 45, 45, 697, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 708, 45, 45, 45, 45, 1221, 45, 45, 45, 45, 1225, 45, 45, 45, 45, 45, 45, 384, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1198, 45, 45, 45, 45, 45, 45, 67, 67, 795, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1470, 67, 67, 67, 67, 67, 67, 67, 815, 67, 67, 67, 67, 67, 67, 25398, 542, 13112, 544, 97, 97, 97, 893, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1164, 97, 97, 97, 67, 67, 67, 1025, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1687, 67, 67, 67, 67, 67, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 0, 0, 0, 1097, 1241, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1450, 45, 45, 1388, 45, 1390, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1236, 67, 67, 67, 67, 67, 1437, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1472, 1490, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1503, 67, 67, 67, 67, 67, 97, 97, 97, 97, 97, 0, 1930, 0, 97, 97, 97, 97, 97, 847, 97, 97, 97, 97, 97, 97, 97, 97, 97, 858, 67, 67, 1965, 67, 97, 97, 97, 97, 0, 0, 0, 97, 97, 97, 97, 0, 97, 97, 1719, 97, 97, 97, 97, 97, 97, 0, 0, 0, 45, 45, 45, 45, 1382, 45, 1383, 45, 45, 45, 159, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1563, 45, 45, 45, 45, 45, 67, 261, 67, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 341, 97, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 97, 1099, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1333, 97, 1230, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 67, 1992, 67, 1993, 67, 67, 67, 97, 97, 45, 45, 160, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1665, 45, 45, 45, 45, 45, 131427, 357, 0, 0, 0, 362, 0, 365, 28809, 367, 139, 45, 45, 45, 45, 45, 684, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 412, 45, 45, 45, 416, 45, 45, 45, 440, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 67, 67, 1990, 67, 1991, 67, 67, 67, 67, 67, 67, 67, 97, 97, 1707, 97, 97, 97, 97, 97, 97, 501, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1691, 67, 67, 67, 67, 67, 526, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1030, 67, 1032, 67, 67, 67, 67, 598, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1632, 0, 921, 29315, 923, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1392, 45, 45, 45, 45, 45, 45, 45, 45, 45, 960, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 25398, 0, 13112, 0, 54074, 0, 0, 1093, 0, 0, 0, 0, 0, 97, 1609, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1369, 97, 97, 97, 1372, 97, 97, 67, 67, 266, 67, 67, 67, 67, 0, 24850, 12564, 0, 0, 0, 0, 28809, 53531, 97, 346, 97, 97, 97, 97, 0, 40976, 0, 18, 18, 24, 24, 27, 27, 27, 665, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1677, 45, 45, 45, 45, 67, 45, 45, 954, 45, 956, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1404, 45, 45, 45, 45, 45, 45, 45, 45, 45, 425, 45, 45, 45, 45, 45, 45, 67, 67, 67, 67, 67, 1270, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1069, 67, 67, 67, 67, 67, 67, 97, 97, 97, 1350, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1524, 97, 97, 97, 97, 97, 97, 97, 1376, 0, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 1545, 45, 45, 45, 45, 45, 45, 45, 45, 45, 448, 45, 45, 45, 45, 67, 456, 67, 67, 67, 67, 67, 1573, 67, 67, 67, 67, 67, 67, 67, 67, 67, 67, 1247, 67, 67, 67, 67, 67, 1252, 97, 1725, 97, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1628, 97, 1630, 0, 0, 94242, 0, 0, 0, 2211840, 0, 1122304, 0, 0, 0, 0, 2158592, 2158731, 2158592, 2158592, 2158592, 3121152, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3022848, 2158592, 3047424, 2158592, 2158592, 2158592, 2158592, 3084288, 2158592, 2158592, 3117056, 2158592, 2158592, 2158592, 2158592, 2158592, 2158878, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2609152, 2158592, 2158592, 2207744, 0, 542, 0, 544, 0, 0, 2166784, 0, 0, 0, 550, 0, 0, 2158592, 2158592, 2691072, 2158592, 2719744, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2871296, 2158592, 2908160, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 0, 94242, 0, 0, 0, 2211840, 0, 0, 1134592, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 3190784, 2158592, 0, 0, 139, 0, 0, 0, 139, 0, 2371584, 2207744, 0, 0, 0, 0, 180224, 0, 2166784, 0, 0, 0, 0, 0, 286, 2158592, 2158592, 3174400, 3178496, 2158592, 0, 0, 0, 2158592, 2158592, 2158592, 2158592, 2158592, 2428928, 2158592, 2158592, 2158592, 1508, 2158592, 2912256, 2158592, 2158592, 2158592, 2981888, 2158592, 2158592, 2158592, 2158592, 3043328, 2158592, 2158592, 2158592, 2158592, 2158592, 2158592, 3162112, 67, 24850, 24850, 12564, 12564, 0, 0, 0, 0, 0, 53531, 53531, 0, 286, 97, 97, 97, 97, 97, 1119, 97, 97, 97, 97, 97, 97, 97, 97, 97, 97, 1509, 97, 97, 97, 97, 97, 97, 97, 97, 564, 97, 97, 97, 97, 97, 97, 97, 57889, 0, 0, 0, 0, 550, 0, 97, 97, 97, 97, 97, 97, 97, 97, 97, 561, 97, 97, 97, 97, 97, 97, 576, 97, 97, 139264, 139264, 139264, 139264, 139264, 139264, 139264, 139264, 139264, 139264, 139264, 139264, 0, 0, 139264, 0, 921, 29315, 0, 0, 926, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1811, 45, 67, 67, 67, 67, 67, 0, 2146304, 2146304, 0, 0, 0, 0, 2224128, 2224128, 2224128, 2232320, 2232320, 2232320, 2232320, 0, 0, 1301, 0, 0, 0, 0, 0, 1307, 0, 0, 0, 0, 0, 1313, 0, 0, 0, 0, 0, 0, 0, 97, 97, 1318, 97, 97, 97, 97, 97, 97, 1795, 97, 97, 45, 45, 45, 45, 45, 45, 45, 446, 45, 45, 45, 45, 45, 45, 67, 67, 2158592, 2146304, 0, 0, 0, 0, 0, 0, 0, 2211840, 0, 0, 0, 0, 2158592, 0, 921, 29315, 0, 924, 0, 0, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 1537, 45, 45, 45, 45
];

JSONiqTokenizer.EXPECTED =
[ 290, 300, 304, 353, 296, 309, 305, 319, 315, 324, 328, 352, 354, 334, 338, 330, 320, 345, 349, 293, 358, 362, 341, 366, 312, 370, 374, 378, 382, 386, 390, 394, 398, 526, 402, 428, 435, 509, 428, 428, 428, 428, 408, 428, 428, 428, 441, 428, 428, 428, 457, 428, 428, 639, 428, 428, 414, 428, 428, 428, 428, 428, 428, 428, 633, 419, 423, 933, 932, 427, 433, 648, 428, 439, 939, 995, 445, 676, 519, 450, 455, 756, 808, 827, 428, 461, 465, 821, 470, 469, 474, 481, 485, 477, 489, 493, 429, 912, 497, 503, 780, 779, 922, 781, 508, 833, 428, 513, 717, 504, 518, 523, 642, 428, 538, 544, 865, 864, 800, 550, 554, 558, 562, 566, 570, 574, 578, 582, 586, 593, 597, 630, 815, 814, 428, 646, 618, 451, 652, 612, 984, 657, 711, 653, 532, 662, 714, 529, 534, 533, 669, 861, 667, 673, 686, 690, 694, 698, 702, 705, 708, 729, 733, 738, 966, 428, 737, 636, 1005, 428, 963, 514, 965, 742, 764, 428, 748, 754, 499, 663, 760, 428, 763, 768, 723, 772, 723, 725, 776, 785, 789, 793, 428, 679, 797, 807, 812, 978, 977, 1000, 826, 819, 918, 428, 920, 803, 428, 825, 720, 682, 428, 831, 837, 844, 843, 848, 854, 858, 869, 873, 875, 879, 883, 887, 891, 895, 899, 903, 615, 990, 989, 428, 909, 750, 428, 916, 744, 428, 926, 589, 658, 931, 937, 905, 404, 410, 409, 850, 624, 943, 603, 947, 956, 960, 428, 428, 428, 540, 970, 974, 546, 927, 983, 982, 626, 428, 988, 952, 428, 994, 621, 446, 999, 950, 839, 451, 1004, 1009, 428, 1012, 600, 606, 1016, 609, 428, 428, 428, 428, 428, 415, 1020, 1024, 1028, 1086, 1031, 1091, 1091, 1047, 1081, 1138, 1109, 1216, 1050, 1036, 1040, 1086, 1086, 1086, 1086, 1059, 1063, 1069, 1086, 1087, 1091, 1091, 1092, 1073, 1065, 1108, 1091, 1091, 1091, 1119, 1124, 1139, 1079, 1075, 1085, 1086, 1086, 1086, 1088, 1091, 1063, 1053, 1061, 1115, 1063, 1105, 1086, 1086, 1091, 1091, 1032, 1123, 1064, 1129, 1140, 1128, 1159, 1086, 1086, 1152, 1091, 1091, 1091, 1096, 1091, 1133, 1074, 1137, 1144, 1062, 1151, 1086, 1156, 1099, 1102, 1147, 1163, 1170, 1102, 1186, 1152, 1091, 1111, 1174, 1055, 1088, 1110, 1178, 1166, 1090, 1205, 1185, 1108, 1190, 1194, 1089, 1198, 1181, 1202, 1209, 1043, 1213, 1220, 1224, 1228, 1232, 1236, 1250, 1689, 1612, 1270, 1270, 1245, 2021, 1786, 1270, 1270, 1270, 1246, 1270, 1679, 1270, 1270, 1270, 1258, 1637, 1605, 1277, 1636, 1282, 1535, 1914, 1287, 1292, 1270, 1270, 1270, 1270, 1242, 1758, 1298, 1270, 1270, 1257, 1270, 1309, 1313, 1270, 1270, 1262, 1270, 1318, 1270, 1270, 1270, 1278, 1917, 1270, 1270, 1270, 1283, 1576, 1918, 1270, 1270, 1269, 1270, 1857, 1270, 1270, 1643, 1343, 1270, 1453, 1336, 1597, 1270, 1595, 1270, 1593, 1496, 1347, 1614, 1598, 1359, 1367, 1373, 1239, 1270, 1265, 1355, 1264, 1270, 1353, 1360, 1362, 1378, 1384, 1363, 1361, 1753, 1390, 1396, 1502, 1405, 1270, 1270, 1270, 2068, 1418, 1270, 1270, 1270, 1349, 1439, 1270, 1270, 1270, 1509, 1447, 1270, 1270, 1270, 1543, 1457, 1270, 1270, 1270, 1575, 1270, 1739, 1468, 1270, 1270, 1907, 1270, 1270, 1705, 1598, 1270, 1270, 1270, 1706, 1270, 1475, 1642, 1270, 1270, 1270, 2080, 1385, 1479, 1270, 1270, 1270, 2086, 1658, 1270, 1270, 1470, 1484, 1270, 1764, 1768, 1270, 1766, 1270, 1716, 1490, 1270, 1979, 1406, 1737, 2002, 1501, 1735, 1803, 1664, 1495, 1500, 1514, 1507, 1513, 1518, 1524, 1532, 1518, 1541, 1547, 1548, 1809, 1552, 1559, 1563, 1567, 1270, 1270, 2016, 2027, 2046, 1270, 1722, 1599, 1573, 1721, 1581, 1270, 1270, 2028, 1270, 1270, 2032, 1270, 1270, 2084, 1270, 1270, 2091, 1270, 1283, 1625, 1270, 1283, 1976, 1270, 1288, 1609, 1270, 1288, 1630, 1270, 1294, 1270, 1270, 1599, 1462, 1270, 1621, 1586, 1270, 1301, 1520, 1270, 1270, 1748, 1270, 1270, 1781, 1270, 1270, 1740, 1452, 1435, 1604, 1270, 1270, 1305, 1919, 1618, 1270, 1270, 1270, 1647, 1635, 1270, 1270, 1270, 1681, 1648, 1270, 1270, 1270, 1727, 1270, 1676, 1270, 1270, 1314, 1662, 1697, 1270, 1695, 1270, 1414, 1325, 1270, 1270, 1821, 1270, 1270, 1822, 1862, 1270, 1686, 1270, 1939, 1270, 1693, 1270, 1703, 1407, 1410, 1270, 1413, 1671, 1409, 1412, 1408, 1751, 1670, 1411, 1751, 1671, 1672, 1699, 1776, 1710, 1270, 1421, 1641, 1270, 1314, 1652, 1270, 1380, 1451, 1270, 1270, 1861, 1270, 1270, 1865, 1270, 1801, 1270, 1270, 1714, 1270, 1600, 1270, 1720, 1599, 1726, 1744, 1270, 1270, 1270, 1732, 1270, 1762, 1270, 1270, 1321, 2006, 1727, 1780, 1270, 1270, 1328, 1994, 1270, 1728, 1270, 1270, 1332, 1300, 1785, 1270, 1270, 1900, 1270, 1270, 1270, 1773, 1790, 1270, 1270, 1796, 1270, 1866, 1270, 1864, 1801, 1840, 1848, 1270, 1425, 1270, 1270, 1270, 1374, 1816, 1816, 1842, 1815, 1841, 1807, 1840, 1849, 1807, 1815, 1813, 1839, 1769, 1833, 1826, 1270, 1471, 1485, 1270, 1270, 1927, 1931, 1832, 1270, 1270, 1270, 1856, 1792, 1838, 1270, 1270, 1338, 1591, 1270, 1582, 1929, 1270, 1270, 1342, 1270, 2008, 1863, 1270, 1270, 1270, 1857, 1392, 1930, 1270, 1270, 1443, 1270, 1270, 1870, 1270, 1270, 1528, 1270, 1270, 1920, 1862, 1270, 1270, 1270, 1877, 1270, 1270, 1537, 1270, 1885, 1270, 1270, 2074, 1893, 1270, 1273, 1270, 1486, 1668, 1270, 1386, 1480, 1270, 1270, 1271, 1898, 1270, 1272, 1642, 2039, 1270, 1904, 2054, 1828, 1270, 1889, 1889, 2056, 1888, 2055, 1911, 2054, 1924, 1937, 1880, 1881, 2057, 1428, 1873, 1943, 1947, 1951, 1955, 1959, 1270, 1817, 1971, 1964, 1270, 1970, 1270, 1270, 1555, 1270, 1270, 1990, 2027, 1270, 1503, 1491, 1400, 1253, 2000, 1270, 1270, 1574, 1853, 1270, 1270, 1369, 1432, 2012, 1270, 1270, 1270, 1894, 2020, 1270, 1270, 1270, 1966, 1292, 1682, 2021, 1270, 1270, 1577, 1313, 1270, 2026, 1270, 1933, 1932, 2033, 1834, 1270, 1527, 1270, 1270, 1628, 1270, 1464, 1270, 1464, 1843, 1797, 1270, 2037, 1270, 1569, 1757, 1270, 1270, 1270, 1744, 1270, 2043, 1401, 2062, 2052, 1270, 2061, 1270, 1587, 1847, 1270, 1270, 1894, 1631, 1270, 1270, 1270, 1982, 1655, 1270, 1270, 1270, 1986, 1270, 1460, 1270, 1270, 1270, 1996, 2066, 1270, 1270, 1270, 2008, 2072, 1270, 1270, 1270, 2048, 2078, 1270, 1270, 1960, 1270, 1270, 1972, 2022, 1270, 1270, 2090, 2102, 2113, 2095, 2099, 2169, 2110, 2176, 2670, 2117, 2121, 2129, 2295, 2133, 2133, 2133, 2988, 2310, 2166, 2173, 2249, 2322, 2180, 2234, 2295, 2133, 2287, 2210, 2189, 2139, 2203, 2290, 2152, 2162, 2290, 2219, 2290, 2290, 2214, 2295, 2290, 2310, 2290, 2307, 2290, 2290, 2290, 2290, 2218, 2290, 2320, 2323, 2195, 2233, 2201, 2206, 2290, 2290, 2290, 2224, 2290, 2308, 2290, 2290, 2158, 2290, 2232, 2295, 2295, 2295, 2295, 2296, 2133, 2133, 2133, 2133, 2190, 2133, 2189, 2238, 2290, 2219, 2290, 2311, 2290, 2290, 2290, 2291, 2268, 2295, 2297, 2133, 2133, 2133, 2289, 2290, 2309, 2290, 2290, 2307, 2133, 2988, 2278, 2283, 2205, 2290, 2290, 2290, 2307, 2309, 2290, 2290, 2290, 2309, 2277, 2190, 2282, 2204, 2157, 2290, 2290, 2290, 2310, 2290, 2290, 2310, 2308, 2290, 2290, 2292, 2295, 2295, 2294, 2295, 2295, 2295, 2297, 2191, 2207, 2290, 2290, 2293, 2295, 2295, 2133, 2287, 2290, 2290, 2295, 2295, 2295, 2290, 2306, 2290, 2312, 2209, 2290, 2312, 2154, 2208, 2306, 2312, 2156, 2213, 2295, 2295, 2156, 2220, 2295, 2295, 2295, 2133, 2289, 2209, 2306, 2313, 2290, 2213, 2295, 2133, 2290, 2304, 2311, 2297, 2133, 2133, 2288, 2208, 2211, 2312, 2209, 2311, 2290, 2214, 2155, 2214, 2296, 2133, 2134, 2138, 2143, 2302, 2290, 2214, 2987, 2317, 2220, 2298, 2212, 2327, 2327, 2327, 2335, 2345, 2349, 2353, 2361, 2796, 2935, 2370, 2250, 2125, 2148, 2250, 2197, 2536, 2250, 2250, 2980, 2493, 2918, 2512, 2250, 2374, 2250, 2250, 3001, 2907, 2550, 2250, 2250, 2250, 2197, 2250, 2763, 2250, 2250, 2228, 2249, 2250, 2761, 2250, 2250, 2250, 2250, 2182, 2836, 2577, 2425, 2250, 2250, 2250, 2251, 2426, 2250, 2250, 2250, 2252, 2443, 2250, 2250, 2250, 2253, 2440, 2444, 2250, 2250, 2365, 2918, 2463, 2448, 2454, 2250, 2250, 2250, 2264, 2735, 2739, 2465, 2450, 2541, 2738, 2464, 2449, 2455, 2250, 2250, 2250, 2262, 2466, 2472, 2456, 2250, 2250, 3001, 2928, 2464, 2470, 2454, 2250, 2250, 3002, 2908, 2250, 2736, 2463, 2476, 2272, 2247, 2250, 2250, 2377, 2680, 2490, 2271, 2246, 2250, 2250, 2146, 2248, 2250, 2250, 2384, 2605, 2521, 2250, 2250, 2537, 2509, 2250, 2537, 2522, 2250, 2250, 2227, 2250, 2250, 2227, 2227, 2249, 2250, 2250, 2385, 2564, 2520, 2250, 2250, 2250, 2383, 2537, 2530, 2250, 2250, 2386, 2607, 2529, 2250, 2250, 2250, 2398, 2606, 2540, 2537, 2250, 2250, 2391, 2818, 2539, 2537, 2250, 2539, 2548, 2250, 2250, 2250, 2405, 2549, 2250, 2250, 2250, 2427, 2250, 2250, 2250, 2429, 2250, 2250, 2250, 2460, 2554, 2559, 2576, 2250, 2251, 2338, 2503, 2531, 2555, 2560, 2577, 2855, 2250, 2861, 2570, 2587, 2577, 2250, 2251, 2704, 2502, 2594, 2566, 2572, 2589, 2593, 2565, 2571, 2588, 2385, 2606, 2610, 2574, 2571, 2575, 2250, 2250, 2250, 2461, 2609, 2573, 2577, 2250, 2252, 2256, 2260, 2250, 2250, 2865, 2250, 2598, 2575, 2250, 2250, 2397, 2619, 2614, 2397, 2604, 2608, 2600, 2606, 2614, 2496, 2250, 2250, 2614, 2805, 2250, 2250, 2250, 2498, 2628, 2250, 2250, 2250, 2531, 2639, 2250, 2250, 2250, 2537, 2776, 2780, 2250, 2250, 2250, 2532, 2549, 2540, 2779, 2250, 2250, 2403, 2250, 2250, 2777, 2404, 2250, 2427, 2427, 2778, 2250, 2250, 2409, 2263, 2775, 2578, 2780, 2250, 2254, 2972, 2250, 2250, 2250, 2775, 2779, 2250, 2263, 2250, 2250, 2364, 2933, 2649, 2663, 2250, 2250, 2419, 2787, 2775, 2417, 2250, 2775, 2415, 2581, 2428, 2580, 2250, 2357, 2241, 2245, 2581, 2579, 2250, 2579, 2578, 2578, 2250, 2580, 2661, 2578, 2250, 2250, 2420, 2768, 2674, 2250, 2250, 2250, 2541, 2461, 2465, 2471, 2675, 2250, 2250, 2250, 2542, 2684, 2250, 2250, 2250, 2544, 2331, 2685, 2250, 2250, 2427, 2462, 2273, 2249, 2250, 2250, 2250, 2376, 2744, 2689, 2250, 2250, 2250, 2582, 2706, 2504, 2691, 2250, 2375, 2250, 2250, 2124, 2147, 2705, 2503, 2690, 2250, 2376, 2679, 2330, 2339, 2504, 2698, 2250, 2377, 2257, 2261, 2250, 2250, 2250, 2699, 2250, 2250, 2250, 2583, 2426, 2697, 2577, 2250, 2250, 2250, 2490, 2250, 2703, 2710, 2714, 2249, 2339, 2712, 2247, 2250, 2378, 2258, 2250, 2398, 2620, 2615, 2722, 2248, 2250, 2250, 2427, 2650, 2723, 2249, 2250, 2250, 2430, 2250, 2250, 2428, 2262, 2340, 2247, 2250, 2404, 2250, 2250, 2355, 2929, 2243, 2498, 2341, 2247, 2250, 2412, 2251, 2395, 2431, 2729, 2250, 2250, 2499, 2724, 2250, 2250, 2430, 2427, 2733, 2248, 2250, 2250, 2500, 2718, 2249, 2428, 2428, 2250, 2430, 2946, 2949, 2250, 2250, 2541, 2624, 2743, 2250, 2250, 2250, 2657, 2675, 2744, 2250, 2250, 2250, 2693, 2792, 2748, 2753, 2758, 2250, 2427, 2635, 2404, 2250, 2250, 2399, 2606, 2598, 2250, 2749, 2754, 2759, 2419, 2767, 2773, 2250, 2428, 2250, 2250, 2539, 2250, 2760, 2250, 2250, 2250, 2737, 2784, 2788, 2250, 2250, 2541, 2634, 2629, 2250, 2250, 2250, 2516, 2262, 2786, 2773, 2250, 2429, 2250, 2429, 2792, 2250, 2250, 2250, 2762, 2878, 2250, 2250, 2250, 2763, 2250, 2957, 2250, 2250, 2543, 2105, 2954, 2250, 2250, 2250, 2803, 2250, 2956, 2250, 2250, 2633, 2639, 2250, 2952, 2250, 2250, 2655, 2427, 2950, 2250, 2250, 2950, 2250, 2250, 2250, 2807, 2800, 2250, 2250, 2250, 2832, 2515, 2811, 2250, 2250, 2693, 2850, 2516, 2812, 2250, 2250, 2250, 2864, 2692, 2250, 2250, 2250, 2951, 2250, 2250, 2250, 2805, 2106, 2250, 2250, 2250, 2953, 2250, 2817, 2823, 2827, 2250, 2461, 2486, 2455, 2250, 2832, 2822, 2826, 2250, 2250, 2250, 2955, 2250, 2250, 2257, 2822, 2826, 2250, 2524, 2249, 2861, 2537, 2183, 2480, 2250, 2524, 2839, 2250, 2524, 2880, 2184, 2481, 2250, 2524, 2851, 2250, 2250, 2482, 2250, 2250, 2250, 2968, 2836, 2577, 2250, 2250, 2693, 2878, 2250, 2844, 2838, 2250, 2538, 2382, 2390, 2250, 2849, 2577, 2250, 2541, 2435, 2465, 2478, 2456, 2250, 2250, 2250, 2257, 2250, 2693, 2857, 2250, 2542, 2818, 2824, 2828, 2250, 2250, 2250, 2958, 2933, 2250, 2856, 2250, 2250, 2728, 2250, 2524, 2249, 2524, 2523, 2874, 2645, 2525, 2872, 2642, 2869, 2869, 2869, 2644, 2250, 2250, 2975, 2978, 2250, 2250, 2250, 2984, 2806, 2885, 2250, 2250, 2735, 2436, 2807, 2886, 2250, 2250, 2250, 2992, 2890, 2895, 2900, 2250, 2634, 2780, 2250, 2253, 2501, 2505, 3001, 2891, 2896, 2901, 2252, 2906, 2910, 2825, 2912, 2917, 2250, 2250, 2735, 2462, 2911, 2916, 2250, 2250, 2775, 2651, 2922, 2916, 2250, 2250, 2816, 2822, 3002, 2929, 2923, 2917, 2252, 2927, 2909, 2825, 2243, 2918, 2250, 2250, 2250, 2998, 2366, 2902, 2250, 2250, 2250, 2993, 2958, 2933, 2250, 2250, 2250, 2250, 2804, 2250, 2250, 2843, 2837, 2250, 2693, 2645, 2250, 2667, 2250, 2250, 2421, 2769, 2250, 2962, 2250, 2250, 2848, 2839, 2250, 2250, 2855, 2405, 2963, 2250, 2250, 2250, 2255, 2259, 2250, 2250, 2876, 2794, 2256, 2261, 2250, 2250, 2881, 2185, 2984, 2250, 2250, 2250, 2939, 2943, 2251, 2994, 2250, 2250, 2967, 2260, 2250, 2998, 2250, 2250, 2250, 402653184, 554434560, 571736064, 545521856, 268451840, 335544320, 268693630, 512, 2048, 256, 1024, 1245184, 130023424, 268435456, -536870912, 0, 1024, 0, 1073741824, 0x80000000, 539754496, 542375936, 537133056, 4194304, 1048576, 268435456, 0, 134217728, 16777216, 0, 0, 64, 4096, 16384, 0, 33554432, 8388608, 192, 67108864, 67108864, 67108864, 67108864, 16, 32, 4, 0, 8192, 196608, 196608, 229376, 80, 4096, 16384, 131072, 67108864, 536870912, 1073741824, 24576, 24600, 24576, 24576, 2, 24576, 24576, 24576, 24584, 24592, 24576, 24578, 24576, 24578, 24576, 24576, 16, 512, 2048, 2048, 256, 0, 2048, 2048, 1073741824, 1073741824, 0, 0x80000000, 262144, 134217728, 0, 128, 196608, 1048576, 8388608, 33554432, 67108864, 67108864, 32, 32, 4, 4, 4096, 262144, 134217728, 0, 0, -1208205442, -1208205442, 8192, 131072, 131072, 4096, 4096, 4096, 4096, 24576, 24576, 24576, 8, 8, 24576, 24576, 16384, 16384, 16384, 24576, 24584, 24576, 24576, 24576, 16384, 24576, 536870912, 262144, 0, 0, 64, 131072, 536870912, 128, 128, 64, 16384, 16384, 16384, 4, 4096, 4096, 4096, 32768, 2097152, 8388608, 33554432, 67108864, 268435456, 536870912, 1073741824, 0, 0, 0, 0, 1, 2, 4, 8, 64, 128, 1024, 16384, 0, 0, 0, 2, 0, 0, 128, 16384, 16384, 16384, 32768, 131072, 4194304, 67108864, 536870912, 32, 32, 32, 32, 4, 4, 4, 4, 4, 4096, 67108864, 67108864, 67108864, 24576, 24576, 24576, 24576, 0, 16384, 16384, 16384, 16384, 67108864, 67108864, 8, 67108864, 24576, 8, 8, 8, 24576, 24576, 24576, 24578, 24576, 24576, 24576, 2, 2, 2, 67108864, 8, 8, 24576, 2048, 0x80000000, 536870912, 262144, 262144, 262144, 67108864, 8, 24576, 16384, 65536, 262144, 524288, 1048576, 67108864, 24576, 65538, 2, 4, 24, 512, 8192, 0, 0, 50, 805306370, 2098178, 2098179, 10, 130, 201851018, 10, 130, 25165826, 0, 0, 1, 64, 256, 512, -2083086386, 0, 65536, 0, 0, 64, 8388608, 33554432, 268435456, 1, 1, 1025, 2097153, 0, 25165824, 0, 0, 0, 3, 4, 8, 3584, 0, 0, 0, 6, 24, 32, 64, 58720256, 0, 0, 0, 8, 1, 1, 0, 0, 2, 4, 16, 32, 8388608, 16777216, 0, 0, 0, 15, 1995962612, 1995962612, 1995962613, 0, 0, 65536, 0, 0, 4096, 16777216, 0, 0, 2, 64, 128, 1024, 491520, 1995440128, 0, 0, 0, 16, 0, 0, 0, 24, 16, 224, 6144, 24576, 32768, 65536, 131072, 262144, 15728640, 33554432, 1946157056, 0, 0, 131072, 262144, 7340032, 8388608, 33554432, 67108864, 33554432, 67108864, 268435456, 1610612736, 0, 0, 4, 16, 96, 4096, 16384, 32768, 65536, 131072, 262144, 1048576, 262144, 1048576, 6291456, 8388608, 33554432, 67108864, 131072, 262144, 4194304, 8388608, 33554432, 67108864, 268435456, -1073741824, 0, 0, 32768, 65536, 131072, 4194304, 0, 16, 96, 4096, 32768, 8388608, 33554432, 0x80000000, 0, 0, 2, 24, 512, 8192, 65536, 524288, 2097152, 8388608, 134217728, 131072, 536870912, 1073741824, 0, 0, 524288, 0, 0, 252, 1246208, 130023424, 0, 64, 131072, 1073741824, 0, 0, 131072, 1048576, 0, 64, 131072, 0, 0, 0, 62, 1851200, -1208205442, 0, 0, 0, 64, 0, 0, 0, 4, 8, 240, 1024, 1851200, -1210056704, 0, 0, 0, 2048, 62, 16192, 262144, 1572864, 6291456, 6291456, 25165824, 100663296, 268435456, 536870912, 320, 512, 1024, 14336, 262144, 1572864, 262144, 1572864, 2097152, 4194304, 25165824, 33554432, 536870912, 0x80000000, 0, 0, 0, 4096, 0, 0, 0, 30964, 491520, 25165824, 33554432, 67108864, 536870912, 0x80000000, 0, 6, 24, 32, 320, 512, 14336, 1572864, 2097152, 25165824, 33554432, 536870912, 16, 32, 64, 256, 512, 1024, 14336, 1572864, 2097152, 4194304, 14336, 1572864, 2097152, 16777216, 33554432, 16, 64, 256, 512, 14336, 16, 64, 0, 6144, 8192, 1572864, 16777216, 33554432, 0, 0, 16, 64, 6144, 8192, 1048576, 8192, 1048576, 16777216, 0, 0, 1048576, 1048576, 0, 0, 0, 16, 64, 0, 0, 6144, 8192, 16, 4096, 0, 0, 3, 8764, 0, 4096, 0, 4096, 1048576, 16777216, -117611969, -117611969, -117611969, 0, 0, 2097152, 524288, 8764, 344064, -117964800, 0, 0, 4, 56, 512, 8192, 16384, 1048576, 2097152, -121634816, 0, 0, 2097152, 8388608, 402653184, -536870912, 0, 0, 0, 131072, 8388608, 134217728, 268435456, 1610612736, 0x80000000, 0, 0, 2, 4, 24, 32, 512, 8192, 512, 8192, 65536, 2097152, 8388608, 134217728, 268435456, 536870912, 2097152, 134217728, 268435456, 536870912, 24, 512, 8192, 268435456, 536870912, 1073741824, 24, 512, 536870912, 1073741824, 0, 24, 512, 0, 0, 4, 16, 96, 128, 4096, 16384, 3, 21952, 458752, 409993216, 0, 0, 1, 2, 192, 1280, 1280, 4096, 16384, 458752, 3145728, 3145728, 4194304, 402653184, 0, 0, 0, 16777216, 0, 0, 128, 1024, 4096, 458752, 3145728, 402653184, 3145728, 402653184, 0, 0, 16, 64, 4096, 1048576, 16777216, 0, 0, 0, 2, 64, 4096, 131072, 262144, 3145728, 402653184, 262144, 3145728, 268435456, 0, 0, 0, 32, 0, -137165572, -137165572, -137165572, 0, 0, 33554432, 0, 0, 0, 37827, 66125824, 130023424, -268435456, 0, 0, 0, 4, 8, 224, 1024, 196608, 1048576, 196608, 1048576, 4194304, 8388608, 50331648, 67108864, 268435456, -536870912, 0, 0, 0, 8, 224, 1024, 33554432, 67108864, 268435456, 1073741824, 0x80000000, 0, 0, 0, 196608, 1048576, 33554432, 67108864, 0, 131072, 1048576, 67108864, 1073741824, 0x80000000, 0, 0, 131072, 1048576, 1073741824, 0x80000000, 0, 131072, 1048576, 1073741824, 0, 0, 33554432, 268435456, 0, 1048576, 0, 1048576, 1048576, 0, 1048576, 0, 0, 131072, 262144, 3145728, 0, 0, 64, 128, 196608, 66125824, 872415232, 0, 0, 0, 64, 128, 4864, 32768, 65536, 65536, 1048576, 6291456, 8388608, 50331648, 50331648, 335544320, 536870912, 0, 0, 0, 64, 128, 768, 4096, 32768, 65536, 2097152, 4194304, 8388608, 50331648, 50331648, 67108864, 268435456, 536870912, 0, 0, 32768, 65536, 2097152, 8388608, 50331648, 64, 128, 256, 512, 4096, 32768, 33554432, 268435456, 536870912, 0, 1024, 2097152, 0, 1245184, 1245184, 1245184, 17615, 17615, 869583, 0, 0, 410473923, 410473923, 0, 0, 0, 2097152, 0, 0, 0, 3145728, 0, 0, 0, 8388608, 15, 1216, 16384, 0, 0, 0, 7, 8, 192, 1024, 64, 128, 16384, 0, 0, 938578883, 938578883, 0, 0, 0, 64, 256, 1, 4, 8, 16384, 67108864, 67108864, 67108864, 32, 0, 1, 4, 8, 0, 0, 0, 1, 4, 0, 1, 2, 64, 128
];

JSONiqTokenizer.TOKEN =
[
  "(0)",
  "ModuleDecl",
  "Annotation",
  "OptionDecl",
  "Operator",
  "Variable",
  "Tag",
  "EndTag",
  "PragmaContents",
  "DirCommentContents",
  "DirPIContents",
  "CDataSectionContents",
  "AttrTest",
  "Wildcard",
  "EQName",
  "IntegerLiteral",
  "DecimalLiteral",
  "DoubleLiteral",
  "PredefinedEntityRef",
  "'\"\"'",
  "EscapeApos",
  "QuotChar",
  "AposChar",
  "ElementContentChar",
  "QuotAttrContentChar",
  "AposAttrContentChar",
  "NCName",
  "QName",
  "S",
  "CharRef",
  "CommentContents",
  "DocTag",
  "DocCommentContents",
  "EOF",
  "'!'",
  "'\"'",
  "'#'",
  "'#)'",
  "'$$'",
  "''''",
  "'('",
  "'(#'",
  "'(:'",
  "'(:~'",
  "')'",
  "'*'",
  "'*'",
  "','",
  "'-->'",
  "'.'",
  "'/'",
  "'/>'",
  "':'",
  "':)'",
  "';'",
  "'<!--'",
  "'<![CDATA['",
  "'<?'",
  "'='",
  "'>'",
  "'?'",
  "'?>'",
  "'NaN'",
  "'['",
  "']'",
  "']]>'",
  "'after'",
  "'all'",
  "'allowing'",
  "'ancestor'",
  "'ancestor-or-self'",
  "'and'",
  "'any'",
  "'append'",
  "'array'",
  "'as'",
  "'ascending'",
  "'at'",
  "'attribute'",
  "'base-uri'",
  "'before'",
  "'boundary-space'",
  "'break'",
  "'by'",
  "'case'",
  "'cast'",
  "'castable'",
  "'catch'",
  "'check'",
  "'child'",
  "'collation'",
  "'collection'",
  "'comment'",
  "'constraint'",
  "'construction'",
  "'contains'",
  "'content'",
  "'context'",
  "'continue'",
  "'copy'",
  "'copy-namespaces'",
  "'count'",
  "'decimal-format'",
  "'decimal-separator'",
  "'declare'",
  "'default'",
  "'delete'",
  "'descendant'",
  "'descendant-or-self'",
  "'descending'",
  "'diacritics'",
  "'different'",
  "'digit'",
  "'distance'",
  "'div'",
  "'document'",
  "'document-node'",
  "'element'",
  "'else'",
  "'empty'",
  "'empty-sequence'",
  "'encoding'",
  "'end'",
  "'entire'",
  "'eq'",
  "'every'",
  "'exactly'",
  "'except'",
  "'exit'",
  "'external'",
  "'first'",
  "'following'",
  "'following-sibling'",
  "'for'",
  "'foreach'",
  "'foreign'",
  "'from'",
  "'ft-option'",
  "'ftand'",
  "'ftnot'",
  "'ftor'",
  "'function'",
  "'ge'",
  "'greatest'",
  "'group'",
  "'grouping-separator'",
  "'gt'",
  "'idiv'",
  "'if'",
  "'import'",
  "'in'",
  "'index'",
  "'infinity'",
  "'inherit'",
  "'insensitive'",
  "'insert'",
  "'instance'",
  "'integrity'",
  "'intersect'",
  "'into'",
  "'is'",
  "'item'",
  "'json'",
  "'json-item'",
  "'key'",
  "'language'",
  "'last'",
  "'lax'",
  "'le'",
  "'least'",
  "'let'",
  "'levels'",
  "'loop'",
  "'lowercase'",
  "'lt'",
  "'minus-sign'",
  "'mod'",
  "'modify'",
  "'module'",
  "'most'",
  "'namespace'",
  "'namespace-node'",
  "'ne'",
  "'next'",
  "'no'",
  "'no-inherit'",
  "'no-preserve'",
  "'node'",
  "'nodes'",
  "'not'",
  "'object'",
  "'occurs'",
  "'of'",
  "'on'",
  "'only'",
  "'option'",
  "'or'",
  "'order'",
  "'ordered'",
  "'ordering'",
  "'paragraph'",
  "'paragraphs'",
  "'parent'",
  "'pattern-separator'",
  "'per-mille'",
  "'percent'",
  "'phrase'",
  "'position'",
  "'preceding'",
  "'preceding-sibling'",
  "'preserve'",
  "'previous'",
  "'processing-instruction'",
  "'relationship'",
  "'rename'",
  "'replace'",
  "'return'",
  "'returning'",
  "'revalidation'",
  "'same'",
  "'satisfies'",
  "'schema'",
  "'schema-attribute'",
  "'schema-element'",
  "'score'",
  "'self'",
  "'sensitive'",
  "'sentence'",
  "'sentences'",
  "'skip'",
  "'sliding'",
  "'some'",
  "'stable'",
  "'start'",
  "'stemming'",
  "'stop'",
  "'strict'",
  "'strip'",
  "'structured-item'",
  "'switch'",
  "'text'",
  "'then'",
  "'thesaurus'",
  "'times'",
  "'to'",
  "'treat'",
  "'try'",
  "'tumbling'",
  "'type'",
  "'typeswitch'",
  "'union'",
  "'unique'",
  "'unordered'",
  "'updating'",
  "'uppercase'",
  "'using'",
  "'validate'",
  "'value'",
  "'variable'",
  "'version'",
  "'weight'",
  "'when'",
  "'where'",
  "'while'",
  "'wildcards'",
  "'window'",
  "'with'",
  "'without'",
  "'word'",
  "'words'",
  "'xquery'",
  "'zero-digit'",
  "'{'",
  "'{{'",
  "'|'",
  "'}'",
  "'}}'"
];
                                                            });
define('ace/mode/behaviour/xquery', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/mode/behaviour/cstyle', 'ace/mode/behaviour/xml', 'ace/token_iterator'], function(require, exports, module) {


  var oop = require("../../lib/oop");
  var Behaviour = require('../behaviour').Behaviour;
  var CstyleBehaviour = require('./cstyle').CstyleBehaviour;
  var XmlBehaviour = require("../behaviour/xml").XmlBehaviour;
  var TokenIterator = require("../../token_iterator").TokenIterator;

function hasType(token, type) {
    var hasType = true;
    var typeList = token.type.split('.');
    var needleList = type.split('.');
    needleList.forEach(function(needle){
        if (typeList.indexOf(needle) == -1) {
            hasType = false;
            return false;
        }
    });
    return hasType;
}
 
  var XQueryBehaviour = function () {
      
      this.inherit(CstyleBehaviour, ["braces", "parens", "string_dquotes"]); // Get string behaviour
      this.inherit(XmlBehaviour); // Get xml behaviour
      
      this.add("autoclosing", "insertion", function (state, action, editor, session, text) {
        if (text == '>') {
            var position = editor.getCursorPosition();
            var iterator = new TokenIterator(session, position.row, position.column);
            var token = iterator.getCurrentToken();
            var atCursor = false;
            var state = JSON.parse(state).pop();
            if ((token && token.value === '>') || state !== "StartTag") return;
            if (!token || !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/'))){
                do {
                    token = iterator.stepBackward();
                } while (token && (hasType(token, 'string') || hasType(token, 'keyword.operator') || hasType(token, 'entity.attribute-name') || hasType(token, 'text')));
            } else {
                atCursor = true;
            }
            var previous = iterator.stepBackward();
            if (!token || !hasType(token, 'meta.tag') || (previous !== null && previous.value.match('/'))) {
                return
            }
            var tag = token.value.substring(1);
            if (atCursor){
                var tag = tag.substring(0, position.column - token.start);
            }

            return {
               text: '>' + '</' + tag + '>',
               selection: [1, 1]
            }
        }
    });

  }
  oop.inherits(XQueryBehaviour, Behaviour);

  exports.XQueryBehaviour = XQueryBehaviour;
});

define('ace/mode/behaviour/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator', 'ace/lib/lang'], function(require, exports, module) {


var oop = require("../../lib/oop");
var Behaviour = require("../behaviour").Behaviour;
var TokenIterator = require("../../token_iterator").TokenIterator;
var lang = require("../../lib/lang");

var SAFE_INSERT_IN_TOKENS =
    ["text", "paren.rparen", "punctuation.operator"];
var SAFE_INSERT_BEFORE_TOKENS =
    ["text", "paren.rparen", "punctuation.operator", "comment"];


var autoInsertedBrackets = 0;
var autoInsertedRow = -1;
var autoInsertedLineEnd = "";
var maybeInsertedBrackets = 0;
var maybeInsertedRow = -1;
var maybeInsertedLineStart = "";
var maybeInsertedLineEnd = "";

var CstyleBehaviour = function () {
    
    CstyleBehaviour.isSaneInsertion = function(editor, session) {
        var cursor = editor.getCursorPosition();
        var iterator = new TokenIterator(session, cursor.row, cursor.column);
        if (!this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) {
            var iterator2 = new TokenIterator(session, cursor.row, cursor.column + 1);
            if (!this.$matchTokenType(iterator2.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS))
                return false;
        }
        iterator.stepForward();
        return iterator.getCurrentTokenRow() !== cursor.row ||
            this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_BEFORE_TOKENS);
    };
    
    CstyleBehaviour.$matchTokenType = function(token, types) {
        return types.indexOf(token.type || token) > -1;
    };
    
    CstyleBehaviour.recordAutoInsert = function(editor, session, bracket) {
        var cursor = editor.getCursorPosition();
        var line = session.doc.getLine(cursor.row);
        if (!this.isAutoInsertedClosing(cursor, line, autoInsertedLineEnd[0]))
            autoInsertedBrackets = 0;
        autoInsertedRow = cursor.row;
        autoInsertedLineEnd = bracket + line.substr(cursor.column);
        autoInsertedBrackets++;
    };
    
    CstyleBehaviour.recordMaybeInsert = function(editor, session, bracket) {
        var cursor = editor.getCursorPosition();
        var line = session.doc.getLine(cursor.row);
        if (!this.isMaybeInsertedClosing(cursor, line))
            maybeInsertedBrackets = 0;
        maybeInsertedRow = cursor.row;
        maybeInsertedLineStart = line.substr(0, cursor.column) + bracket;
        maybeInsertedLineEnd = line.substr(cursor.column);
        maybeInsertedBrackets++;
    };
    
    CstyleBehaviour.isAutoInsertedClosing = function(cursor, line, bracket) {
        return autoInsertedBrackets > 0 &&
            cursor.row === autoInsertedRow &&
            bracket === autoInsertedLineEnd[0] &&
            line.substr(cursor.column) === autoInsertedLineEnd;
    };
    
    CstyleBehaviour.isMaybeInsertedClosing = function(cursor, line) {
        return maybeInsertedBrackets > 0 &&
            cursor.row === maybeInsertedRow &&
            line.substr(cursor.column) === maybeInsertedLineEnd &&
            line.substr(0, cursor.column) == maybeInsertedLineStart;
    };
    
    CstyleBehaviour.popAutoInsertedClosing = function() {
        autoInsertedLineEnd = autoInsertedLineEnd.substr(1);
        autoInsertedBrackets--;
    };
    
    CstyleBehaviour.clearMaybeInsertedClosing = function() {
        maybeInsertedBrackets = 0;
        maybeInsertedRow = -1;
    };

    this.add("braces", "insertion", function (state, action, editor, session, text) {
        var cursor = editor.getCursorPosition();
        var line = session.doc.getLine(cursor.row);
        if (text == '{') {
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && selected !== "{" && editor.getWrapBehavioursEnabled()) {
                return {
                    text: '{' + selected + '}',
                    selection: false
                };
            } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                if (/[\]\}\)]/.test(line[cursor.column])) {
                    CstyleBehaviour.recordAutoInsert(editor, session, "}");
                    return {
                        text: '{}',
                        selection: [1, 1]
                    };
                } else {
                    CstyleBehaviour.recordMaybeInsert(editor, session, "{");
                    return {
                        text: '{',
                        selection: [1, 1]
                    };
                }
            }
        } else if (text == '}') {
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == '}') {
                var matching = session.$findOpeningBracket('}', {column: cursor.column + 1, row: cursor.row});
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                    CstyleBehaviour.popAutoInsertedClosing();
                    return {
                        text: '',
                        selection: [1, 1]
                    };
                }
            }
        } else if (text == "\n" || text == "\r\n") {
            var closing = "";
            if (CstyleBehaviour.isMaybeInsertedClosing(cursor, line)) {
                closing = lang.stringRepeat("}", maybeInsertedBrackets);
                CstyleBehaviour.clearMaybeInsertedClosing();
            }
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == '}' || closing !== "") {
                var openBracePos = session.findMatchingBracket({row: cursor.row, column: cursor.column+1}, '}');
                if (!openBracePos)
                     return null;

                var indent = this.getNextLineIndent(state, line.substring(0, cursor.column), session.getTabString());
                var next_indent = this.$getIndent(line);

                return {
                    text: '\n' + indent + '\n' + next_indent + closing,
                    selection: [1, indent.length, 1, indent.length]
                };
            }
        }
    });

    this.add("braces", "deletion", function (state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '{') {
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.end.column, range.end.column + 1);
            if (rightChar == '}') {
                range.end.column++;
                return range;
            } else {
                maybeInsertedBrackets--;
            }
        }
    });

    this.add("parens", "insertion", function (state, action, editor, session, text) {
        if (text == '(') {
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                return {
                    text: '(' + selected + ')',
                    selection: false
                };
            } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                CstyleBehaviour.recordAutoInsert(editor, session, ")");
                return {
                    text: '()',
                    selection: [1, 1]
                };
            }
        } else if (text == ')') {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == ')') {
                var matching = session.$findOpeningBracket(')', {column: cursor.column + 1, row: cursor.row});
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                    CstyleBehaviour.popAutoInsertedClosing();
                    return {
                        text: '',
                        selection: [1, 1]
                    };
                }
            }
        }
    });

    this.add("parens", "deletion", function (state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '(') {
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == ')') {
                range.end.column++;
                return range;
            }
        }
    });

    this.add("brackets", "insertion", function (state, action, editor, session, text) {
        if (text == '[') {
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && editor.getWrapBehavioursEnabled()) {
                return {
                    text: '[' + selected + ']',
                    selection: false
                };
            } else if (CstyleBehaviour.isSaneInsertion(editor, session)) {
                CstyleBehaviour.recordAutoInsert(editor, session, "]");
                return {
                    text: '[]',
                    selection: [1, 1]
                };
            }
        } else if (text == ']') {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == ']') {
                var matching = session.$findOpeningBracket(']', {column: cursor.column + 1, row: cursor.row});
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                    CstyleBehaviour.popAutoInsertedClosing();
                    return {
                        text: '',
                        selection: [1, 1]
                    };
                }
            }
        }
    });

    this.add("brackets", "deletion", function (state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '[') {
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == ']') {
                range.end.column++;
                return range;
            }
        }
    });

    this.add("string_dquotes", "insertion", function (state, action, editor, session, text) {
        if (text == '"' || text == "'") {
            var quote = text;
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) {
                return {
                    text: quote + selected + quote,
                    selection: false
                };
            } else {
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var leftChar = line.substring(cursor.column-1, cursor.column);
                if (leftChar == '\\') {
                    return null;
                }
                var tokens = session.getTokens(selection.start.row);
                var col = 0, token;
                var quotepos = -1; // Track whether we're inside an open quote.

                for (var x = 0; x < tokens.length; x++) {
                    token = tokens[x];
                    if (token.type == "string") {
                      quotepos = -1;
                    } else if (quotepos < 0) {
                      quotepos = token.value.indexOf(quote);
                    }
                    if ((token.value.length + col) > selection.start.column) {
                        break;
                    }
                    col += tokens[x].value.length;
                }
                if (!token || (quotepos < 0 && token.type !== "comment" && (token.type !== "string" || ((selection.start.column !== token.value.length+col-1) && token.value.lastIndexOf(quote) === token.value.length-1)))) {
                    if (!CstyleBehaviour.isSaneInsertion(editor, session))
                        return;
                    return {
                        text: quote + quote,
                        selection: [1,1]
                    };
                } else if (token && token.type === "string") {
                    var rightChar = line.substring(cursor.column, cursor.column + 1);
                    if (rightChar == quote) {
                        return {
                            text: '',
                            selection: [1, 1]
                        };
                    }
                }
            }
        }
    });

    this.add("string_dquotes", "deletion", function (state, action, editor, session, range) {
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && (selected == '"' || selected == "'")) {
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == selected) {
                range.end.column++;
                return range;
            }
        }
    });

};

oop.inherits(CstyleBehaviour, Behaviour);

exports.CstyleBehaviour = CstyleBehaviour;
});

define('ace/mode/behaviour/xml', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/mode/behaviour/cstyle', 'ace/token_iterator'], function(require, exports, module) {


var oop = require("../../lib/oop");
var Behaviour = require("../behaviour").Behaviour;
var CstyleBehaviour = require("./cstyle").CstyleBehaviour;
var TokenIterator = require("../../token_iterator").TokenIterator;

function hasType(token, type) {
    var tokenTypes = token.type.split('.');
    return type.split('.').every(function(type){
        return (tokenTypes.indexOf(type) !== -1);
    });
    return hasType;
}

var XmlBehaviour = function () {
    
    this.inherit(CstyleBehaviour, ["string_dquotes"]); // Get string behaviour
    
    this.add("autoclosing", "insertion", function (state, action, editor, session, text) {
        if (text == '>') {
            var position = editor.getCursorPosition();
            var iterator = new TokenIterator(session, position.row, position.column);
            var token = iterator.getCurrentToken();

            if (token && hasType(token, 'string') && iterator.getCurrentTokenColumn() + token.value.length > position.column)
                return;
            var atCursor = false;
            if (!token || !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/'))){
                do {
                    token = iterator.stepBackward();
                } while (token && (hasType(token, 'string') || hasType(token, 'keyword.operator') || hasType(token, 'entity.attribute-name') || hasType(token, 'text')));
            } else {
                atCursor = true;
            }
            if (!token || !hasType(token, 'meta.tag.name') || iterator.stepBackward().value.match('/')) {
                return;
            }
            var tag = token.value;
            if (atCursor){
                var tag = tag.substring(0, position.column - token.start);
            }

            return {
               text: '>' + '</' + tag + '>',
               selection: [1, 1]
            }
        }
    });

    this.add('autoindent', 'insertion', function (state, action, editor, session, text) {
        if (text == "\n") {
            var cursor = editor.getCursorPosition();
            var line = session.getLine(cursor.row);
            var rightChars = line.substring(cursor.column, cursor.column + 2);
            if (rightChars == '</') {
                var next_indent = this.$getIndent(line);
                var indent = next_indent + session.getTabString();

                return {
                    text: '\n' + indent + '\n' + next_indent,
                    selection: [1, indent.length, 1, indent.length]
                }
            }
        }
    });
    
}
oop.inherits(XmlBehaviour, Behaviour);

exports.XmlBehaviour = XmlBehaviour;
});

define('ace/mode/folding/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/range', 'ace/mode/folding/fold_mode'], function(require, exports, module) {


var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(commentRegex) {
    if (commentRegex) {
        this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
        );
        this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
        );
    }
};
oop.inherits(FoldMode, BaseFoldMode);

(function() {

    this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;

    this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) {
        var line = session.getLine(row);
        var match = line.match(this.foldingStartMarker);
        if (match) {
            var i = match.index;

            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);
                
            var range = session.getCommentFoldRange(row, i + match[0].length, 1);
            
            if (range && !range.isMultiLine()) {
                if (forceMultiline) {
                    range = this.getSectionRange(session, row);
                } else if (foldStyle != "all")
                    range = null;
            }
            
            return range;
        }

        if (foldStyle === "markbegin")
            return;

        var match = line.match(this.foldingStopMarker);
        if (match) {
            var i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
        }
    };
    
    this.getSectionRange = function(session, row) {
        var line = session.getLine(row);
        var startIndent = line.search(/\S/);
        var startRow = row;
        var startColumn = line.length;
        row = row + 1;
        var endRow = row;
        var maxRow = session.getLength();
        while (++row < maxRow) {
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            var subRange = this.getFoldWidgetRange(session, "all", row);
            
            if (subRange) {
                if (subRange.start.row <= startRow) {
                    break;
                } else if (subRange.isMultiLine()) {
                    row = subRange.end.row;
                } else if (startIndent == indent) {
                    break;
                }
            }
            endRow = row;
        }
        
        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    };

}).call(FoldMode.prototype);

});

define('ace/snippets', ['require', 'exports', 'module' , 'ace/lib/lang', 'ace/range', 'ace/keyboard/hash_handler', 'ace/tokenizer', 'ace/lib/dom'], function(require, exports, module) {

var lang = require("./lib/lang")
var Range = require("./range").Range
var HashHandler = require("./keyboard/hash_handler").HashHandler;
var Tokenizer = require("./tokenizer").Tokenizer;
var comparePoints = Range.comparePoints;

var SnippetManager = function() {
    this.snippetMap = {};
    this.snippetNameMap = {};
};

(function() {
    this.getTokenizer = function() {
        function TabstopToken(str, _, stack) {
            str = str.substr(1);
            if (/^\d+$/.test(str) && !stack.inFormatString)
                return [{tabstopId: parseInt(str, 10)}];
            return [{text: str}]
        }
        function escape(ch) {
            return "(?:[^\\\\" + ch + "]|\\\\.)";
        }
        SnippetManager.$tokenizer = new Tokenizer({
            start: [
                {regex: /:/, onMatch: function(val, state, stack) {
                    if (stack.length && stack[0].expectIf) {
                        stack[0].expectIf = false;
                        stack[0].elseBranch = stack[0];
                        return [stack[0]];
                    }
                    return ":";
                }},
                {regex: /\\./, onMatch: function(val, state, stack) {
                    var ch = val[1];
                    if (ch == "}" && stack.length) {
                        val = ch;
                    }else if ("`$\\".indexOf(ch) != -1) {
                        val = ch;
                    } else if (stack.inFormatString) {
                        if (ch == "n")
                            val = "\n";
                        else if (ch == "t")
                            val = "\n";
                        else if ("ulULE".indexOf(ch) != -1) {
                            val = {changeCase: ch, local: ch > "a"};
                        }
                    }

                    return [val];
                }},
                {regex: /}/, onMatch: function(val, state, stack) {
                    return [stack.length ? stack.shift() : val];
                }},
                {regex: /\$(?:\d+|\w+)/, onMatch: TabstopToken},
                {regex: /\$\{[\dA-Z_a-z]+/, onMatch: function(str, state, stack) {
                    var t = TabstopToken(str.substr(1), state, stack);
                    stack.unshift(t[0]);
                    return t;
                }, next: "snippetVar"},
                {regex: /\n/, token: "newline", merge: false}
            ],
            snippetVar: [
                {regex: "\\|" + escape("\\|") + "*\\|", onMatch: function(val, state, stack) {
                    stack[0].choices = val.slice(1, -1).split(",");
                }, next: "start"},
                {regex: "/(" + escape("/") + "+)/(?:(" + escape("/") + "*)/)(\\w*):?",
                 onMatch: function(val, state, stack) {
                    var ts = stack[0];
                    ts.fmtString = val;

                    val = this.splitRegex.exec(val);
                    ts.guard = val[1];
                    ts.fmt = val[2];
                    ts.flag = val[3];
                    return "";
                }, next: "start"},
                {regex: "`" + escape("`") + "*`", onMatch: function(val, state, stack) {
                    stack[0].code = val.splice(1, -1);
                    return "";
                }, next: "start"},
                {regex: "\\?", onMatch: function(val, state, stack) {
                    if (stack[0])
                        stack[0].expectIf = true;
                }, next: "start"},
                {regex: "([^:}\\\\]|\\\\.)*:?", token: "", next: "start"}
            ],
            formatString: [
                {regex: "/(" + escape("/") + "+)/", token: "regex"},
                {regex: "", onMatch: function(val, state, stack) {
                    stack.inFormatString = true;
                }, next: "start"}
            ]
        });
        SnippetManager.prototype.getTokenizer = function() {
            return SnippetManager.$tokenizer;
        }
        return SnippetManager.$tokenizer;
    };

    this.tokenizeTmSnippet = function(str, startState) {
        return this.getTokenizer().getLineTokens(str, startState).tokens.map(function(x) {
            return x.value || x;
        });
    };

    this.$getDefaultValue = function(editor, name) {
        if (/^[A-Z]\d+$/.test(name)) {
            var i = name.substr(1);
            return (this.variables[name[0] + "__"] || {})[i];
        }
        if (/^\d+$/.test(name)) {
            return (this.variables.__ || {})[name];
        }
        name = name.replace(/^TM_/, "");

        if (!editor)
            return;
        var s = editor.session;
        switch(name) {
            case "CURRENT_WORD":
                var r = s.getWordRange();
            case "SELECTION":
            case "SELECTED_TEXT":
                return s.getTextRange(r);
            case "CURRENT_LINE":
                return s.getLine(editor.getCursorPosition().row);
            case "PREV_LINE": // not possible in textmate
                return s.getLine(editor.getCursorPosition().row - 1);
            case "LINE_INDEX":
                return editor.getCursorPosition().column;
            case "LINE_NUMBER":
                return editor.getCursorPosition().row + 1;
            case "SOFT_TABS":
                return s.getUseSoftTabs() ? "YES" : "NO";
            case "TAB_SIZE":
                return s.getTabSize();
            case "FILENAME":
            case "FILEPATH":
                return "ace.ajax.org";
            case "FULLNAME":
                return "Ace";
        }
    };
    this.variables = {};
    this.getVariableValue = function(editor, varName) {
        if (this.variables.hasOwnProperty(varName))
            return this.variables[varName](editor, varName) || "";
        return this.$getDefaultValue(editor, varName) || "";
    };
    this.tmStrFormat = function(str, ch, editor) {
        var flag = ch.flag || "";
        var re = ch.guard;
        re = new RegExp(re, flag.replace(/[^gi]/, ""));
        var fmtTokens = this.tokenizeTmSnippet(ch.fmt, "formatString");
        var _self = this;
        var formatted = str.replace(re, function() {
            _self.variables.__ = arguments;
            var fmtParts = _self.resolveVariables(fmtTokens, editor);
            var gChangeCase = "E";
            for (var i  = 0; i < fmtParts.length; i++) {
                var ch = fmtParts[i];
                if (typeof ch == "object") {
                    fmtParts[i] = "";
                    if (ch.changeCase && ch.local) {
                        var next = fmtParts[i + 1];
                        if (next && typeof next == "string") {
                            if (ch.changeCase == "u")
                                fmtParts[i] = next[0].toUpperCase();
                            else
                                fmtParts[i] = next[0].toLowerCase();
                            fmtParts[i + 1] = next.substr(1);
                        }
                    } else if (ch.changeCase) {
                        gChangeCase = ch.changeCase;
                    }
                } else if (gChangeCase == "U") {
                    fmtParts[i] = ch.toUpperCase();
                } else if (gChangeCase == "L") {
                    fmtParts[i] = ch.toLowerCase();
                }
            }
            return fmtParts.join("");
        });
        this.variables.__ = null;
        return formatted;
    };

    this.resolveVariables = function(snippet, editor) {
        var result = [];
        for (var i = 0; i < snippet.length; i++) {
            var ch = snippet[i];
            if (typeof ch == "string") {
                result.push(ch);
            } else if (typeof ch != "object") {
                continue;
            } else if (ch.skip) {
                gotoNext(ch);
            } else if (ch.processed < i) {
                continue;
            } else if (ch.text) {
                var value = this.getVariableValue(editor, ch.text);
                if (value && ch.fmtString)
                    value = this.tmStrFormat(value, ch);
                ch.processed = i;
                if (ch.expectIf == null) {
                    if (value) {
                        result.push(value);
                        gotoNext(ch);
                    }
                } else {
                    if (value) {
                        ch.skip = ch.elseBranch;
                    } else
                        gotoNext(ch);
                }
            } else if (ch.tabstopId != null) {
                result.push(ch);
            } else if (ch.changeCase != null) {
                result.push(ch);
            }
        }
        function gotoNext(ch) {
            var i1 = snippet.indexOf(ch, i + 1);
            if (i1 != -1)
                i = i1;
        }
        return result;
    };

    this.insertSnippet = function(editor, snippetText) {
        var cursor = editor.getCursorPosition();
        var line = editor.session.getLine(cursor.row);
        var indentString = line.match(/^\s*/)[0];
        var tabString = editor.session.getTabString();

        var tokens = this.tokenizeTmSnippet(snippetText);
        tokens = this.resolveVariables(tokens, editor);
        tokens = tokens.map(function(x) {
            if (x == "\n")
                return x + indentString;
            if (typeof x == "string")
                return x.replace(/\t/g, tabString);
            return x;
        });
        var tabstops = [];
        tokens.forEach(function(p, i) {
            if (typeof p != "object")
                return;
            var id = p.tabstopId;
            var ts = tabstops[id];
            if (!ts) {
                ts = tabstops[id] = [];
                ts.index = id;
                ts.value = "";
            }
            if (ts.indexOf(p) !== -1)
                return;
            ts.push(p);
            var i1 = tokens.indexOf(p, i + 1);
            if (i1 === -1)
                return;

            var value = tokens.slice(i + 1, i1);
            var isNested = value.some(function(t) {return typeof t === "object"});          
            if (isNested && !ts.value) {
                ts.value = value;
            } else if (value.length && (!ts.value || typeof ts.value !== "string")) {
                ts.value = value.join("");
            }
        });
        tabstops.forEach(function(ts) {ts.length = 0});
        var expanding = {};
        function copyValue(val) {
            var copy = []
            for (var i = 0; i < val.length; i++) {
                var p = val[i];
                if (typeof p == "object") {
                    if (expanding[p.tabstopId])
                        continue;
                    var j = val.lastIndexOf(p, i - 1);
                    p = copy[j] || {tabstopId: p.tabstopId};
                }
                copy[i] = p;
            }
            return copy;
        }
        for (var i = 0; i < tokens.length; i++) {
            var p = tokens[i];
            if (typeof p != "object")
                continue;
            var id = p.tabstopId;
            var i1 = tokens.indexOf(p, i + 1);
            if (expanding[id] == p) { 
                expanding[id] = null;
                continue;
            }
            
            var ts = tabstops[id];
            var arg = typeof ts.value == "string" ? [ts.value] : copyValue(ts.value);
            arg.unshift(i + 1, Math.max(0, i1 - i));
            arg.push(p);
            expanding[id] = p;
            tokens.splice.apply(tokens, arg);

            if (ts.indexOf(p) === -1)
                ts.push(p);
        };
        var row = 0, column = 0;
        var text = "";
        tokens.forEach(function(t) {
            if (typeof t === "string") {
                if (t[0] === "\n"){
                    column = t.length - 1;
                    row ++;
                } else
                    column += t.length;
                text += t;
            } else {
                if (!t.start)
                    t.start = {row: row, column: column};
                else
                    t.end = {row: row, column: column};
            }
        });
        var range = editor.getSelectionRange();
        var end = editor.session.replace(range, text);

        var tabstopManager = new TabstopManager(editor);
        tabstopManager.addTabstops(tabstops, range.start, end);
        tabstopManager.tabNext();
    };

    this.$getScope = function(editor) {
        var scope = editor.session.$mode.$id || "";
        scope = scope.split("/").pop();
        if (scope === "html" || scope === "php") {
            if (scope === "php") 
                scope = "html";
            var c = editor.getCursorPosition()
            var state = editor.session.getState(c.row);
            if (typeof state === "object") {
                state = state[0];
            }
            if (state.substring) {
                if (state.substring(0, 3) == "js-")
                    scope = "javascript";
                else if (state.substring(0, 4) == "css-")
                    scope = "css";
                else if (state.substring(0, 4) == "php-")
                    scope = "php";
            }
        }
        
        return scope;
    };

    this.expandWithTab = function(editor) {
        var cursor = editor.getCursorPosition();
        var line = editor.session.getLine(cursor.row);
        var before = line.substring(0, cursor.column);
        var after = line.substr(cursor.column);

        var scope = this.$getScope(editor);
        var snippetMap = this.snippetMap;
        var snippet;
        [scope, "_"].some(function(scope) {
            var snippets = snippetMap[scope];
            if (snippets)
                snippet = this.findMatchingSnippet(snippets, before, after);
            return !!snippet;
        }, this);
        if (!snippet)
            return false;

        editor.session.doc.removeInLine(cursor.row,
            cursor.column - snippet.replaceBefore.length,
            cursor.column + snippet.replaceAfter.length
        );

        this.variables.M__ = snippet.matchBefore;
        this.variables.T__ = snippet.matchAfter;
        this.insertSnippet(editor, snippet.content);

        this.variables.M__ = this.variables.T__ = null;
        return true;
    };

    this.findMatchingSnippet = function(snippetList, before, after) {
        for (var i = snippetList.length; i--;) {
            var s = snippetList[i];
            if (s.startRe && !s.startRe.test(before))
                continue;
            if (s.endRe && !s.endRe.test(after))
                continue;
            if (!s.startRe && !s.endRe)
                continue;

            s.matchBefore = s.startRe ? s.startRe.exec(before) : [""];
            s.matchAfter = s.endRe ? s.endRe.exec(after) : [""];
            s.replaceBefore = s.triggerRe ? s.triggerRe.exec(before)[0] : "";
            s.replaceAfter = s.endTriggerRe ? s.endTriggerRe.exec(after)[0] : "";
            return s;
        }
    };

    this.snippetMap = {};
    this.snippetNameMap = {};
    this.register = function(snippets, scope) {
        var snippetMap = this.snippetMap;
        var snippetNameMap = this.snippetNameMap;
        var self = this;
        function wrapRegexp(src) {
            if (src && !/^\^?\(.*\)\$?$|^\\b$/.test(src))
                src = "(?:" + src + ")"

            return src || "";
        }
        function guardedRegexp(re, guard, opening) {
            re = wrapRegexp(re);
            guard = wrapRegexp(guard);
            if (opening) {
                re = guard + re;
                if (re && re[re.length - 1] != "$")
                    re = re + "$";
            } else {
                re = re + guard;
                if (re && re[0] != "^")
                    re = "^" + re;
            }
            return new RegExp(re);
        }

        function addSnippet(s) {
            if (!s.scope)
                s.scope = scope || "_";
            scope = s.scope
            if (!snippetMap[scope]) {
                snippetMap[scope] = [];
                snippetNameMap[scope] = {};
            }

            var map = snippetNameMap[scope];
            if (s.name) {
                var old = map[s.name];
                if (old)
                    self.unregister(old);
                map[s.name] = s;
            }
            snippetMap[scope].push(s);

            if (s.tabTrigger && !s.trigger) {
                if (!s.guard && /^\w/.test(s.tabTrigger))
                    s.guard = "\\b";
                s.trigger = lang.escapeRegExp(s.tabTrigger);
            }

            s.startRe = guardedRegexp(s.trigger, s.guard, true);
            s.triggerRe = new RegExp(s.trigger, "", true);

            s.endRe = guardedRegexp(s.endTrigger, s.endGuard, true);
            s.endTriggerRe = new RegExp(s.endTrigger, "", true);
        };

        if (snippets.content)
            addSnippet(snippets);
        else if (Array.isArray(snippets))
            snippets.forEach(addSnippet);
    };
    this.unregister = function(snippets, scope) {
        var snippetMap = this.snippetMap;
        var snippetNameMap = this.snippetNameMap;

        function removeSnippet(s) {
            var nameMap = snippetNameMap[s.scope||scope];
            if (nameMap && nameMap[s.name]) {
                delete nameMap[s.name];
                var map = snippetMap[s.scope||scope];
                var i = map && map.indexOf(s);
                if (i >= 0)
                    map.splice(i, 1);
            }
        }
        if (snippets.content)
            removeSnippet(snippets);
        else if (Array.isArray(snippets))
            snippets.forEach(removeSnippet);
    };
    this.parseSnippetFile = function(str) {
        str = str.replace(/\r/g, "");
        var list = [], snippet = {};
        var re = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm;
        var m;
        while (m = re.exec(str)) {
            if (m[1]) {
                try {
                    snippet = JSON.parse(m[1])
                    list.push(snippet);
                } catch (e) {}
            } if (m[4]) {
                snippet.content = m[4].replace(/^\t/gm, "");
                list.push(snippet);
                snippet = {};
            } else {
                var key = m[2], val = m[3];
                if (key == "regex") {
                    var guardRe = /\/((?:[^\/\\]|\\.)*)|$/g;
                    snippet.guard = guardRe.exec(val)[1];
                    snippet.trigger = guardRe.exec(val)[1];
                    snippet.endTrigger = guardRe.exec(val)[1];
                    snippet.endGuard = guardRe.exec(val)[1];
                } else if (key == "snippet") {
                    snippet.tabTrigger = val.match(/^\S*/)[0];
                    if (!snippet.name)
                        snippet.name = val;
                } else {
                    snippet[key] = val;
                }
            }
        }
        return list;
    };
    this.getSnippetByName = function(name, editor) {
        var scope = editor && this.$getScope(editor);
        var snippetMap = this.snippetNameMap;
        var snippet;
        [scope, "_"].some(function(scope) {
            var snippets = snippetMap[scope];
            if (snippets)
                snippet = snippets[name];
            return !!snippet;
        }, this);
        return snippet;
    };

}).call(SnippetManager.prototype);


var TabstopManager = function(editor) {
    if (editor.tabstopManager)
        return editor.tabstopManager;
    editor.tabstopManager = this;
    this.$onChange = this.onChange.bind(this);
    this.$onChangeSelection = lang.delayedCall(this.onChangeSelection.bind(this)).schedule;
    this.$onChangeSession = this.onChangeSession.bind(this);
    this.$onAfterExec = this.onAfterExec.bind(this);
    this.attach(editor);
};
(function() {
    this.attach = function(editor) {
        this.index = -1;
        this.ranges = [];
        this.tabstops = [];
        this.selectedTabstop = null;

        this.editor = editor;
        this.editor.on("change", this.$onChange);
        this.editor.on("changeSelection", this.$onChangeSelection);
        this.editor.on("changeSession", this.$onChangeSession);
        this.editor.commands.on("afterExec", this.$onAfterExec);
        this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
    };
    this.detach = function() {
        this.tabstops.forEach(this.removeTabstopMarkers, this);
        this.ranges = null;
        this.tabstops = null;
        this.selectedTabstop = null;
        this.editor.removeListener("change", this.$onChange);
        this.editor.removeListener("changeSelection", this.$onChangeSelection);
        this.editor.removeListener("changeSession", this.$onChangeSession);
        this.editor.commands.removeListener("afterExec", this.$onAfterExec);
        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        this.editor.tabstopManager = null;
        this.editor = null;
    };

    this.onChange = function(e) {
        var changeRange = e.data.range;
        var isRemove = e.data.action[0] == "r";
        var start = changeRange.start;
        var end = changeRange.end;
        var startRow = start.row;
        var endRow = end.row;
        var lineDif = endRow - startRow;
        var colDiff = end.column - start.column;

        if (isRemove) {
            lineDif = -lineDif;
            colDiff = -colDiff;
        }
        if (!this.$inChange && isRemove) {
            var ts = this.selectedTabstop;
            var changedOutside = !ts.some(function(r) {
                return comparePoints(r.start, start) <= 0 && comparePoints(r.end, end) >= 0;
            });
            if (changedOutside)
                return this.detach();
        }
        var ranges = this.ranges;
        for (var i = 0; i < ranges.length; i++) {
            var r = ranges[i];
            if (r.end.row < start.row)
                continue;

            if (comparePoints(start, r.start) < 0 && comparePoints(end, r.end) > 0) {
                this.removeRange(r);
                i--;
                continue;
            }

            if (r.start.row == startRow && r.start.column > start.column)
                r.start.column += colDiff;
            if (r.end.row == startRow && r.end.column >= start.column)
                r.end.column += colDiff;
            if (r.start.row >= startRow)
                r.start.row += lineDif;
            if (r.end.row >= startRow)
                r.end.row += lineDif;

            if (comparePoints(r.start, r.end) > 0)
                this.removeRange(r);
        }
        if (!ranges.length)
            this.detach();
    };
    this.updateLinkedFields = function() {
        var ts = this.selectedTabstop;
        if (!ts.hasLinkedRanges)
            return;
        this.$inChange = true;
        var session = this.editor.session;
        var text = session.getTextRange(ts.firstNonLinked);
        for (var i = ts.length; i--;) {
            var range = ts[i];
            if (!range.linked)
                continue;
            var fmt = exports.snippetManager.tmStrFormat(text, range.original)
            session.replace(range, fmt);
        }
        this.$inChange = false;
    };
    this.onAfterExec = function(e) {
        if (e.command && !e.command.readOnly)
            this.updateLinkedFields();
    };
    this.onChangeSelection = function() {
        if (!this.editor)
            return
        var lead = this.editor.selection.lead;
        var anchor = this.editor.selection.anchor;
        var isEmpty = this.editor.selection.isEmpty();
        for (var i = this.ranges.length; i--;) {
            if (this.ranges[i].linked)
                continue;
            var containsLead = this.ranges[i].contains(lead.row, lead.column);
            var containsAnchor = isEmpty || this.ranges[i].contains(anchor.row, anchor.column);
            if (containsLead && containsAnchor)
                return;
        }
        this.detach();
    };
    this.onChangeSession = function() {
        this.detach();
    };
    this.tabNext = function(dir) {
        var max = this.tabstops.length - 1;
        var index = this.index + (dir || 1);
        index = Math.min(Math.max(index, 0), max);
        this.selectTabstop(index);
        if (index == max)
            this.detach();
    };
    this.selectTabstop = function(index) {
        var ts = this.tabstops[this.index];
        if (ts)
            this.addTabstopMarkers(ts);
        this.index = index;
        ts = this.tabstops[this.index];
        if (!ts || !ts.length)
            return;
        
        this.selectedTabstop = ts;
        if (!this.editor.inVirtualSelectionMode) {        
            var sel = this.editor.multiSelect;
            sel.toSingleRange(ts.firstNonLinked.clone());
            for (var i = ts.length; i--;) {
                if (ts.hasLinkedRanges && ts[i].linked)
                    continue;
                sel.addRange(ts[i].clone(), true);
            }
        } else {
            this.editor.selection.setRange(ts.firstNonLinked);
        }
        
        this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
    };
    this.addTabstops = function(tabstops, start, end) {
        if (!tabstops[0]) {
            var p = Range.fromPoints(end, end);
            moveRelative(p.start, start);
            moveRelative(p.end, start);
            tabstops[0] = [p];
            tabstops[0].index = 0;
        }

        var i = this.index;
        var arg = [i, 0];
        var ranges = this.ranges;
        var editor = this.editor;
        tabstops.forEach(function(ts) {
            for (var i = ts.length; i--;) {
                var p = ts[i];
                var range = Range.fromPoints(p.start, p.end || p.start);
                movePoint(range.start, start);
                movePoint(range.end, start);
                range.original = p;
                range.tabstop = ts;
                ranges.push(range);
                ts[i] = range;
                if (p.fmtString) {
                    range.linked = true;
                    ts.hasLinkedRanges = true;
                } else if (!ts.firstNonLinked)
                    ts.firstNonLinked = range;
            }
            if (!ts.firstNonLinked)
                ts.hasLinkedRanges = false;
            arg.push(ts);
            this.addTabstopMarkers(ts);
        }, this);
        arg.push(arg.splice(2, 1)[0]);
        this.tabstops.splice.apply(this.tabstops, arg);
    };

    this.addTabstopMarkers = function(ts) {
        var session = this.editor.session;
        ts.forEach(function(range) {
            if  (!range.markerId)
                range.markerId = session.addMarker(range, "ace_snippet-marker", "text");
        });
    };
    this.removeTabstopMarkers = function(ts) {
        var session = this.editor.session;
        ts.forEach(function(range) {
            session.removeMarker(range.markerId);
            range.markerId = null;
        });
    };
    this.removeRange = function(range) {
        var i = range.tabstop.indexOf(range);
        range.tabstop.splice(i, 1);
        i = this.ranges.indexOf(range);
        this.ranges.splice(i, 1);
        this.editor.session.removeMarker(range.markerId);
    };

    this.keyboardHandler = new HashHandler();
    this.keyboardHandler.bindKeys({
        "Tab": function(ed) {
            ed.tabstopManager.tabNext(1);
        },
        "Shift-Tab": function(ed) {
            ed.tabstopManager.tabNext(-1);
        },
        "Esc": function(ed) {
            ed.tabstopManager.detach();
        },
        "Return": function(ed) {
            return false;
        }
    });
}).call(TabstopManager.prototype);


var movePoint = function(point, diff) {
    if (point.row == 0)
        point.column += diff.column;
    point.row += diff.row;
};

var moveRelative = function(point, start) {
    if (point.row == start.row)
        point.column -= start.column;
    point.row -= start.row;
};


require("./lib/dom").importCssString("\
.ace_snippet-marker {\
    -moz-box-sizing: border-box;\
    box-sizing: border-box;\
    background: rgba(194, 193, 208, 0.09);\
    border: 1px dotted rgba(211, 208, 235, 0.62);\
    position: absolute;\
}");

exports.snippetManager = new SnippetManager();


});
