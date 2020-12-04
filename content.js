if (window == top) {
  window.addEventListener('keydown', doKeyPress, false); //add the keyboard handler
}

function insertAtEndDiv(text) {
  this.appendChild(document.createTextNode(text));
  this.normalize();
  moveCaret(window, 1);
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

const onKeyDown = (e) => {
  e.preventDefault();
  const key = e.key;
  textState = `${textState}${key}`;
  console.log({ textState });
  Object.keys(replaceMap).forEach((triggerString) => {
    if (textState.includes(triggerString)) {
      const emoji = replaceMap[triggerString];

      let targetElement = e.target;

      const currentSelectionNode = getCurrentSelection().baseNode;
      if (currentSelectionNode) {
        if (currentSelectionNode.nodeType !== Node.TEXT_NODE) {
          targetElement = currentSelectionNode;
        } else {
          if (currentSelectionNode.parentNode) {
            targetElement = currentSelectionNode.parentNode;
          }
        }
      } else {
        deepestChild = findDeepestChild(targetElement).parent;
        console.log({ targetElement }, { deepestChild }, `equal? ${targetElement === deepestChild}`);
        if (deepestChild && deepestChild !== targetElement) {
          targetElement = deepestChild;
        }
      }

      console.log(e.target);
      console.log({ currentSelectionNode });
      console.log({ targetElement });
      targetElement.insertAtCaret(emoji);
      targetElement.dispatchEvent(new InputEvent('input', { data: emoji, bubbles: true }));
      targetElement.normalize();

      resetState();
      return;
    }
  });
};

trigger_key = '\\';
function doKeyPress(e) {
  if (triggered) {
    e.preventDefault();
  }

  if (e.altKey && e.key.toLowerCase() === trigger_key.toLowerCase()) {
    console.log('click');
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
