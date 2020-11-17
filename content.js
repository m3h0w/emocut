if (window == top) {
  window.addEventListener('keydown', doKeyPress, false); //add the keyboard handler
}

HTMLInputElement.prototype.insertAtCaret = function (text) {
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
};

const replaceMap = {
  sun: '☀️',
  sci: '✂️',
};

let textState = '';
let triggered = false;

const resetState = () => {
  console.log('removed event listener');

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
      e.target.insertAtCaret(replaceMap[triggerString]);
      resetState();
      return;
    }
  });
};

trigger_key = 'e';
function doKeyPress(e) {
  console.log('KEY PRESS!', e);
  if (triggered) {
    e.preventDefault();
  }

  if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === trigger_key.toLowerCase()) {
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

console.log('FOREGROUND');
