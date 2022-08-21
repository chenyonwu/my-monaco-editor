let escapable =
    /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
  keyable = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/,
  gap,
  indent,
  meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    "'": "\\'",
    '\\': '\\\\',
  },
  rep;

export function beautifyJs(object, options = {}) {
  const space = options.space || 2,
    dropQuotesOnKeys = options.dropQuotesOnKeys == false ? false : true,
    dropQuotesOnNumbers = options.dropQuotesOnNumbers || false,
    inlineShortArrays = options.inlineShortArrays || false,
    inlineShortArraysDepth = options.inlineShortArraysDepth || 1,
    quoteType = options.quoteType || 'single',
    minify = options.minify || false;

  if (dropQuotesOnNumbers) walkObjectAndDropQuotesOnNumbers(object);

  let result = stringify(object, null, minify ? undefined : space, dropQuotesOnKeys, quoteType);

  if (inlineShortArrays && !minify) {
    let newResult = inlineShortArraysInResult(result);

    if (inlineShortArraysDepth > 1) {
      for (let i = 1; i < inlineShortArraysDepth; i++) {
        result = newResult;
        newResult = inlineShortArraysInResult(result);

        if (newResult == result) break;
      }
    }
    result = newResult;
  }

  return result;
}

function walkObjectAndDropQuotesOnNumbers(object) {
  if (!isObject(object)) return;

  let keys = Object.keys(object);

  if (!keys) return;

  keys.forEach(function (key) {
    let value = object[key];
    if (typeof value == 'string') {
      let number = value - 0;
      object[key] = isNaN(number) ? value : number;
    } else if (isObject(value) || Array.isArray(value)) {
      walkObjectAndDropQuotesOnNumbers(value);
    }
  });
}

function isObject(o) {
  return o && typeof o == 'object';
}

function inlineShortArraysInResult(result, width) {
  width || (width = 80);

  if (typeof width != 'number' || width < 20) {
    throw "Invalid width '" + width + "'. Expecting number equal or larger than 20.";
  }

  let list = result.split('\n'),
    i = 0,
    start = null,
    content = [];

  while (i < list.length) {
    let startMatch = !!list[i].match(/\[/),
      endMatch = !!list[i].match(/\],?/);

    if (startMatch && !endMatch) {
      content = [list[i]];
      start = i;
    } else if (endMatch && !startMatch && start) {
      content.push((list[i] || '').trim());

      let inline = content.join(' ');

      if (inline.length < width) {
        list.splice(start, i - start + 1, inline);
        i = start;
      }

      start = null;
      content = [];
    } else {
      if (start) content.push((list[i] || '').trim());
    }
    i += 1;
  }

  return list.join('\n');
}

function stringify(value, replacer, space, dropQuotesOnKeys, quoteType) {
  let i;

  gap = '';
  indent = '';

  if (typeof space === 'number') {
    for (i = 0; i < space; i += 1) {
      indent += ' ';
    }
  } else if (typeof space === 'string') {
    indent = space;
  }

  rep = replacer;

  if (
    replacer &&
    typeof replacer !== 'function' &&
    (typeof replacer !== 'object' || typeof replacer.length !== 'number')
  ) {
    throw new Error('JSON.stringify');
  }

  return str('', { '': value }, dropQuotesOnKeys, quoteType);
}

function str(key, holder, dropQuotesOnKeys, quoteType) {
  let i,
    k,
    v,
    length,
    mind = gap,
    partial,
    value = holder[key];

  if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
    value = value.toJSON(key);
  }

  if (typeof rep === 'function') {
    value = rep.call(holder, key, value);
  }

  switch (typeof value) {
    case 'function':
      return value;
    case 'string':
      return quote(value, quoteType);
    case 'number':
      return isFinite(value) ? String(value) : 'null';
    case 'boolean':
    case 'null':
      return String(value);
    case 'object':
      if (!value) {
        return 'null';
      }

      gap += indent;
      partial = [];

      if (Object.prototype.toString.apply(value) === '[object Array]') {
        length = value.length;

        for (i = 0; i < length; i += 1) {
          partial[i] = str(i, value, dropQuotesOnKeys, quoteType) || 'null';
        }

        v =
          partial.length === 0
            ? '[]'
            : gap
            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
            : '[' + partial.join(',') + ']';
        gap = mind;

        return v;
      }

      if (rep && typeof rep === 'object') {
        length = rep.length;

        for (i = 0; i < length; i += 1) {
          if (typeof rep[i] === 'string') {
            k = rep[i];
            v = str(k, value, dropQuotesOnKeys, quoteType);

            if (v) {
              partial.push(
                (dropQuotesOnKeys ? condQuoteKey(k, quoteType) : quote(k, quoteType)) +
                  (gap ? ': ' : ':') +
                  v,
              );
            }
          }
        }
      } else {
        for (k in value) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            v = str(k, value, dropQuotesOnKeys, quoteType);

            if (v) {
              partial.push(
                (dropQuotesOnKeys ? condQuoteKey(k, quoteType) : quote(k, quoteType)) +
                  (gap ? ': ' : ':') +
                  v,
              );
            }
          }
        }
      }

      v =
        partial.length === 0
          ? '{}'
          : gap
          ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
          : '{' + partial.join(',') + '}';
      gap = mind;

      return v;
  }
}

function quote(string, quoteType) {
  escapable.lastIndex = 0;

  let surroundingQuote = '"';

  if (quoteType === 'single') {
    surroundingQuote = "'";
  }

  return escapable.test(string)
    ? surroundingQuote +
        string.replace(escapable, function (a) {
          let c = meta[a];
          return typeof c === 'string'
            ? c
            : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) +
        surroundingQuote
    : surroundingQuote + string + surroundingQuote;
}

function condQuoteKey(string, quoteType) {
  return keyable.test(string) ? string : quote(string, quoteType);
}
