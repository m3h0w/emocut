function findDeepestChild(parent) {
  var result = { depth: 0, element: parent };

  [].slice.call(parent.childNodes).forEach(function (child) {
    var childResult = findDeepestChild(child);
    if (childResult.depth + 1 > result.depth) {
      result = {
        depth: 1 + childResult.depth,
        element: childResult.element,
        parent: childResult.element.parentNode,
      };
    }
  });

  return result;
}

function getFirstParentDiv(el) {
  if (!el.parentNode) {
    return;
  }

  const parent = el.parentNode;
  if (parent.tagName == 'DIV') {
    return parent;
  } else {
    return getParentDiv(parent);
  }
}

function getCurrentSelection() {
  if (window.getSelection) {
    return window.getSelection();
  } else if (document.selection) {
    return document.selection;
  }
  return;
}

function moveCaret(win, charCount) {
  console.log('moving caret', charCount);
  var sel, range;
  if (win.getSelection) {
    // IE9+ and other browsers
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var textNode = sel.focusNode;
      var newOffset = sel.focusOffset + charCount;
      sel.collapse(textNode, Math.min(textNode.length, newOffset));
    }
  } else if ((sel = win.document.selection)) {
    // IE <= 8
    if (sel.type != 'Control') {
      range = sel.createRange();
      range.move('character', charCount);
      range.select();
    }
  }
}

function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  if (typeof window.getSelection != 'undefined') {
    var range = window.getSelection().getRangeAt(0);
    var preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  } else if (typeof document.selection != 'undefined' && document.selection.type != 'Control') {
    var textRange = document.selection.createRange();
    var preCaretTextRange = document.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint('EndToEnd', textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}
