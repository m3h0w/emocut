if (window == top) {
  window.addEventListener('keydown', doKeyPress, false); //add the keyboard handler
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

// node = document.getElementById('element');

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

function setCaret(el, offset) {
  var range = document.createRange();
  var sel = window.getSelection();

  range.setStart(el, offset);
  range.collapse(true);

  sel.removeAllRanges();
  sel.addRange(range);
}

function selectionToEnd() {
  let selection = getCurrentSelection();
  console.log('modifying selection', { selection });
  selection.modify('extend', 'forward', 'paragraph');
  // selection.collapseToEnd();
  console.log('modified', { selection });
}

function getCurrentSelection() {
  if (window.getSelection) {
    return window.getSelection();
  } else if (document.selection) {
    return document.selection;
  }
  return;
}

function insertAtEndDiv(text) {
  // var sel, range;
  // if (window.getSelection) {
  // sel = window.getSelection();
  // range = sel.getRangeAt(0);
  // range.deleteContents();
  this.appendChild(document.createTextNode(text));
  this.normalize();
  moveCaret(window, 1);
  // range.collapse();
  // } else if (document.selection && document.selection.createRange) {
  //   document.selection.createRange().text = text;
  // }
}

function insertAtCaretDiv(text) {
  const node = this;
  cursorPos = getCaretCharacterOffsetWithin(node);
  allContents = node.innerText;
  contentsBeforeCursor = allContents.substring(0, cursorPos);
  contentsAfterCursor = allContents.substring(cursorPos, allContents.length);
  node.innerHTML = '';
  node.appendChild(document.createTextNode(contentsBeforeCursor));
  node.appendChild(document.createTextNode(text));
  node.appendChild(document.createTextNode(contentsAfterCursor));
  node.normalize();

  const baseOffset = getCurrentSelection().baseOffset;
  console.log(cursorPos, baseOffset);
  if (getCurrentSelection().baseOffset === 0 && cursorPos === 0) {
    moveCaret(window, 1);
  } else {
    moveCaret(window, cursorPos + 1);
  }
}

function pasteHtmlAtCaret(html) {
  var sel, range;
  if (window.getSelection) {
    // IE9 and non-IE
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();

      // Range.createContextualFragment() would be useful here but is
      // only relatively recently standardized and is not supported in
      // some browsers (IE9, for one)
      var el = document.createElement('div');
      el.innerHTML = html;
      var frag = document.createDocumentFragment(),
        node,
        lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      // Preserve the selection
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  } else if (document.selection && document.selection.type != 'Control') {
    // IE < 9
    document.selection.createRange().pasteHTML(html);
  }
}

function insertTextAtCursor(text) {
  let selection = window.getSelection();
  let range = selection.getRangeAt(0);
  range.deleteContents();
  let node = document.createTextNode(text);
  range.insertNode(node);

  for (let position = 0; position != text.length; position++) {
    selection.modify('move', 'right', 'character');
  }
}

function insertAtCaretInput(text) {
  text = text || '';
  if (document.selection) {
    // IE
    this.focus();
    var sel = document.selection.createRange();
    sel.text = text;
  } else if (this.selectionStart || this.selectionStart === 0) {
    // Others
    var startPos = this.selectionStart;
    var endPos = this.selectionEnd;
    this.value = this.value.substring(0, startPos) + text + this.value.substring(endPos, this.value.length);
    this.selectionStart = startPos + text.length;
    this.selectionEnd = startPos + text.length;
  } else {
    this.value += text;
  }
}

HTMLInputElement.prototype.insertAtCaret = insertAtCaretInput;
HTMLSpanElement.prototype.insertAtCaret = insertAtCaretDiv;
HTMLDivElement.prototype.insertAtCaret = insertAtCaretDiv;

const replaceMap = {
  sun: '☀️',
  sci: '✂️',
  hea: '❤️',
  fir: '🔥',
  ups: '🙃',
  fun: '🙃',
};

let textState = '';
let triggered = false;

const resetState = () => {
  textState = '';
  triggered = false;
  document.activeElement.removeEventListener('keyup', onKeyDown);
};

function deepest(subMenu) {
  return [].slice.call(subMenu.childNodes).reduce(
    function (deepest, el) {
      for (var d = 0, e = el; e !== subMenu; d++, e = e.parentNode);
      return d > deepest.d ? { d: d, el: el } : deepest;
    },
    { d: 0, el: subMenu }
  ).el;
}

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

function moveCursorToEnd(el) {
  if (typeof el.selectionStart == 'number') {
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange != 'undefined') {
    el.focus();
    var range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

function getParentDiv(el) {
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

const emojiElements = {};

const onKeyDown = (e) => {
  e.preventDefault();
  const key = e.key;
  textState = `${textState}${key}`;
  console.log({ textState });
  Object.keys(replaceMap).forEach((triggerString) => {
    if (textState.includes(triggerString)) {
      const emoji = replaceMap[triggerString];

      // console.log(e.target);
      // console.log(findDeepestChild(e.target).element);
      // console.log(findDeepestChild(e.target).parent);
      // console.log(getParentDiv(findDeepestChild(e.target).parent));

      let targetElement = e.target;
      let child;
      let parentDiv;

      console.log(getCurrentSelection());
      console.log(getCurrentSelection().baseNode);
      console.log(getCurrentSelection().baseNode.parentNode);

      if (getCurrentSelection().baseNode.parentNode) {
        targetElement = getCurrentSelection().baseNode.parentNode;
      } else {
        deepestChild = findDeepestChild(targetElement).parent;
        console.log({ targetElement }, { deepestChild }, `equal? ${targetElement === deepestChild}`);
        if (deepestChild && deepestChild !== targetElement) {
          targetElement = deepestChild;
        }
      }
      console.log('targeting', { targetElement });
      targetElement.insertAtCaret(emoji);
      targetElement.dispatchEvent(new InputEvent('input', { data: emoji, bubbles: true }));
      targetElement.normalize();
      // if (!targetElement.insertAtCaret) {
      //   targetElement = findDeepestChild(e.target).parent;
      //   child = findDeepestChild(e.target).element;
      //   parentDiv = getParentDiv(targetElement);
      //   console.log('in', parentDiv);
      //   console.log({ targetElement }, { parentDiv });
      // }
      // if (!targetElement.insertAtCaret) {
      //   alert('Sorry, Emoticut failed at inserting the emoji :(');
      //   resetState();
      //   return;
      // }

      // console.log('out', parentDiv, parentDiv.innerHtml);
      // console.log(findDeepestChild(parentDiv.lastChild).element, findDeepestChild(parentDiv.lastChild).parent);
      // const target = findDeepestChild(parentDiv.lastChild).parent;
      // target.insertAtCaret(emoji);
      // findDeepestChild(parentDiv.lastChild).element.nodeValue = `${
      //   findDeepestChild(parentDiv.lastChild).element.nodeValue
      // }${emoji}`;
      // target.normalize();
      // targetElement.insertAtCaret(' ');
      // console.log('setting offset', prevSelectionOffset);
      // setTimeout(() => moveCursorToEnd(parentDiv), 1000);
      // setTimeout(() => {
      //   getCurrentSelection().selectAllChildren(parentDiv);
      //   getCurrentSelection().collapseToEnd();
      // }, 1000);

      resetState();
      return;
    }
  });
};

const fbAriaLabels = [
  'Smileys & People',
  'Animals & Nature',
  'Food & Drink',
  'Activities',
  'Travel & Places',
  'Objects',
  'Symbols',
  'Flags',
];

function clickEmojiElement() {
  let emojiEl = document.querySelectorAll('div[aria-label="Emoji"]').item(0);
  if (!emojiEl) {
    emojiEl = document.querySelectorAll('div[aria-label="Choose an emoji"]').item(0);
  }
  console.log('clicling emoji el', emojiEl);
  emojiEl.click();
}

function clickCategoriesAndCloseEmoji() {
  const catEls = fbAriaLabels.map((label) => {
    const categoryEl = document.querySelectorAll(`a[aria-label="${label}"]`).item(0);
    return categoryEl;
  });
  if (!catEls[0]) {
    return false;
  }

  catEls.forEach((el) => el.click());
  setTimeout(() => {
    Object.keys(replaceMap).forEach((triggerString) => {
      const emoji = replaceMap[triggerString];
      emojiElements[triggerString] = document.querySelectorAll(`img[alt="${emoji}"]`).item(0);
      console.log({ emojiElements });
    });
    setTimeout(() => {
      clickEmojiElement();
    }, 5000);
  }, 5000);
  return true;
}

trigger_key = '\\';
function doKeyPress(e) {
  // console.log('KEY PRESS!!!', e);
  if (triggered) {
    e.preventDefault();
  }

  if (e.altKey && e.key.toLowerCase() === trigger_key.toLowerCase()) {
    console.log('ENGAGING');
    clickEmojiElement();
    setTimeout(() => {
      const success = clickCategoriesAndCloseEmoji();
      if (!success) {
        setTimeout(() => {
          clickCategoriesAndCloseEmoji();
        }, 5000);
      }
    }, 5000);
  }

  if (e.ctrlKey && e.key.toLowerCase() === trigger_key.toLowerCase()) {
    if (!triggered) {
      console.log('added event listener');
      textState = '';
      triggered = true;
      e.preventDefault();
      document.activeElement.addEventListener('keyup', onKeyDown);
      return;
    } else {
      resetState();
    }
  }
}

// console.log('FOREGROUND');
