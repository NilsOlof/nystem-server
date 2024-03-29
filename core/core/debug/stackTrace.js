/*
 * sourcemapped-stacktrace.js
 * created by James Salter <iteration@gmail.com> (2014)
 *
 * https://github.com/novocaine/sourcemapped-stacktrace
 *
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/*global define */

// note we only include source-map-consumer, not the whole source-map library,
// which includes gear for generating source maps that we don't need
define(["source-map/lib/source-map-consumer"], function(source_map_consumer) {
  const global_mapForUri = {};

  /**
   * Re-map entries in a stacktrace using sourcemaps if available.
   *
   * @param {Array} stack - Array of strings from the browser's stack
   *                        representation. Currently only Chrome
   *                        format is supported.
   * @param {function} done - Callback invoked with the transformed stacktrace
   *                          (an Array of Strings) passed as the first
   *                          argument
   * @param {Object} [opts] - Optional options object.
   * @param {Function} [opts.filter] - Filter function applied to each stackTrace line.
   *                                   Lines which do not pass the filter won't be processesd.
   * @param {boolean} [opts.cacheGlobally] - Whether to cache sourcemaps globally across multiple calls.
   */
  const mapStackTrace = function(stack, done, opts) {
    const lines;
    const line;
    const mapForUri = {};
    const rows = {};
    const fields;
    const uri;
    const expected_fields;
    const regex;
    const skip_lines;

    const fetcher = new Fetcher(function() {
      const result = processSourceMaps(lines, rows, fetcher.mapForUri);
      done(result);
    }, opts);

    if (isChromeOrEdge() || isIE11Plus()) {
      regex = /^ +at.+\((.*):([0-9]+):([0-9]+)/;
      expected_fields = 4;
      // (skip first line containing exception message)
      skip_lines = 1;
    } else if (isFirefox() || isSafari()) {
      regex = /@(.*):([0-9]+):([0-9]+)/;
      expected_fields = 4;
      skip_lines = 0;
    } else {
      throw new Error("unknown browser :(");
    }

    lines = stack.split("\n").slice(skip_lines);

    for (let i = 0; i < lines.length; i++) {
      line = lines[i];
      if (opts && opts.filter && !opts.filter(line)) continue;

      fields = line.match(regex);
      if (fields && fields.length === expected_fields) {
        rows[i] = fields;
        uri = fields[1];
        if (!uri.match(/<anonymous>/)) {
          fetcher.fetchScript(uri);
        }
      }
    }

    // if opts.cacheGlobally set, all maps could have been cached already,
    // thus we need to call done callback right away
    if (fetcher.sem === 0) {
      fetcher.done(fetcher.mapForUri);
    }
  };

  const isChromeOrEdge = function() {
    return navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
  };

  const isFirefox = function() {
    return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  };

  const isSafari = function() {
    return navigator.userAgent.toLowerCase().indexOf("safari") > -1;
  };

  const isIE11Plus = function() {
    return document.documentMode && document.documentMode >= 11;
  };

  const Fetcher = function(done, opts) {
    this.sem = 0;
    this.mapForUri = opts && opts.cacheGlobally ? global_mapForUri : {};
    this.done = done;
  };

  Fetcher.prototype.fetchScript = function(uri) {
    if (!(uri in this.mapForUri)) {
      this.sem++;
      this.mapForUri[uri] = null;
    } else {
      return;
    }

    const xhr = createXMLHTTPObject();
    const that = this;
    xhr.onreadystatechange = function(e) {
      that.onScriptLoad.call(that, e, uri);
    };
    xhr.open("GET", uri, true);
    xhr.send();
  };

  const absUrlRegex = new RegExp("^(?:[a-z]+:)?//", "i");

  Fetcher.prototype.onScriptLoad = function(e, uri) {
    if (e.target.readyState !== 4) {
      return;
    }

    if (
      e.target.status === 200 ||
      (uri.slice(0, 7) === "file://" && e.target.status === 0)
    ) {
      // find .map in file.
      //
      // attempt to find it at the very end of the file, but tolerate trailing
      // whitespace inserted by some packers.
      const match = e.target.responseText.match(
        "//# [s]ourceMappingURL=(.*)[\\s]*$",
        "m"
      );
      if (match && match.length === 2) {
        // get the map
        const mapUri = match[1];

        const embeddedSourceMap = mapUri.match(
          "data:application/json;(charset=[^;]+;)?base64,(.*)"
        );

        if (embeddedSourceMap && embeddedSourceMap[2]) {
          this.mapForUri[uri] = new source_map_consumer.SourceMapConsumer(
            atob(embeddedSourceMap[2])
          );
          this.done(this.mapForUri);
        } else {
          if (!absUrlRegex.test(mapUri)) {
            // relative url; according to sourcemaps spec is 'source origin'
            const origin;
            const lastSlash = uri.lastIndexOf("/");
            if (lastSlash !== -1) {
              origin = uri.slice(0, lastSlash + 1);
              mapUri = origin + mapUri;
              // note if lastSlash === -1, actual script uri has no slash
              // somehow, so no way to use it as a prefix... we give up and try
              // as absolute
            }
          }

          const xhrMap = createXMLHTTPObject();
          const that = this;
          xhrMap.onreadystatechange = function() {
            if (xhrMap.readyState === 4) {
              that.sem--;
              if (
                xhrMap.status === 200 ||
                (mapUri.slice(0, 7) === "file://" && xhrMap.status === 0)
              ) {
                that.mapForUri[uri] = new source_map_consumer.SourceMapConsumer(
                  xhrMap.responseText
                );
              }
              if (that.sem === 0) {
                that.done(that.mapForUri);
              }
            }
          };

          xhrMap.open("GET", mapUri, true);
          xhrMap.send();
        }
      } else {
        // no map
        this.sem--;
      }
    } else {
      // HTTP error fetching uri of the script
      this.sem--;
    }

    if (this.sem === 0) {
      this.done(this.mapForUri);
    }
  };

  const processSourceMaps = function(lines, rows, mapForUri) {
    const result = [];
    const map;
    for (let i = 0; i < lines.length; i++) {
      const row = rows[i];
      if (row) {
        const uri = row[1];
        const line = parseInt(row[2], 10);
        const column = parseInt(row[3], 10);
        map = mapForUri[uri];

        if (map) {
          // we think we have a map for that uri. call source-map library
          const origPos = map.originalPositionFor({ line: line, column: column });
          result.push(
            formatOriginalPosition(
              origPos.source,
              origPos.line,
              origPos.column,
              origPos.name || origName(lines[i])
            )
          );
        } else {
          // we can't find a map for that url, but we parsed the row.
          // reformat unchanged line for consistency with the sourcemapped
          // lines.
          result.push(
            formatOriginalPosition(uri, line, column, origName(lines[i]))
          );
        }
      } else {
        // we weren't able to parse the row, push back what we were given
        result.push(lines[i]);
      }
    }

    return result;
  };

  function origName(origLine) {
    const match = String(origLine).match(
      isChromeOrEdge() || isIE11Plus() ? / +at +([^ ]*).*/ : /([^@]*)@.*/
    );
    return match && match[1];
  }

  const formatOriginalPosition = function(source, line, column, name) {
    // mimic chrome's format
    return (
      "    at " +
      (name ? name : "(unknown)") +
      " (" +
      source +
      ":" +
      line +
      ":" +
      column +
      ")"
    );
  };

  // xmlhttprequest boilerplate
  const XMLHttpFactories = [
    function() {
      return new XMLHttpRequest();
    },
    function() {
      return new ActiveXObject("Msxml2.XMLHTTP");
    },
    function() {
      return new ActiveXObject("Msxml3.XMLHTTP");
    },
    function() {
      return new ActiveXObject("Microsoft.XMLHTTP");
    }
  ];

  function createXMLHTTPObject() {
    const xmlhttp = false;
    for (let i = 0; i < XMLHttpFactories.length; i++) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }

  return {
    mapStackTrace: mapStackTrace
  };
});
