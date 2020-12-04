console.log('POPUP SCRIPT');

let emojiDiv;
let addEmojiButton;
emojiDiv = document.getElementById('emojis');
addEmojiButton = document.getElementById('addemoji');
console.log({ emojiDiv, addEmojiButton });

// const saveDefaultEmojis = async () => {
//   await saveEmoji('1', 'sun', '☀️');
//   await saveEmoji('2', 'hea', '❤️');
// };

const newEmojiDiv = async (id, eShort, eVal) => {
  console.log('Creating new emoji div');
  //   let emojiObj = await getEmoji(id);
  //   console.log('e', emojiObj);

  //   if (!emojiObj) {
  //     saveEmoji(id, '', '');
  //   }
  //   emojiObj = await getEmoji(id);
  //   console.log('e', emojiObj);

  const div = document.createElement('div');
  div.id = id;
  const h = document.createElement('h4');
  h.innerText = '---';
  const i1 = document.createElement('input');
  i1.value = eShort;
  i1.onchange = async (e) => {
    const emojiObj = await getEmoji(id);
    let emoji = '';
    if (emojiObj && emojiObj.emoji) {
      emoji = emojiObj.emoji;
    }
    await saveEmoji(id, e.target.value, emoji);
    console.log(getEmojis());
  };
  const i2 = document.createElement('input');
  i2.value = eVal;
  i2.onchange = async (e) => {
    const emojiObj = await getEmoji(id);
    let short = '';
    if (emojiObj && emojiObj.short) {
      short = emojiObj.short;
    }
    await saveEmoji(id, short, e.target.value);
    console.log(getEmojis());
  };
  div.appendChild(h);
  div.appendChild(i1);
  div.appendChild(i2);
  return div;
};

const loadEmojisFromSettings = async () => {
  const emojis = await getEmojis();
  console.log('emojis loaded', emojis);
  if (emojis && Object.keys(emojis).length) {
    Object.keys(emojis).forEach(async (emojiId, i) => {
      const emojiObj = emojis[emojiId];
      const d = await newEmojiDiv(String(emojiId), emojiObj.short, emojiObj.emoji);
      console.log('d', d);
      emojiDiv.appendChild(d);
    });
  }
};

async function addEmoji() {
  console.log('add emoji');
  const emojis = await getEmojis();
  let emojiCount = 0;
  if (emojis) {
    emojiCount = Object.keys(emojis).length;
  }
  const d = await newEmojiDiv(String(emojiCount + 1));
  console.log('d', d);
  emojiDiv.appendChild(d);
}

const saveAndLoadEmojis = async () => {
  //   await saveDefaultEmojis();
  //   await clearEmojis();
  await loadEmojisFromSettings();
};
saveAndLoadEmojis();
addEmojiButton.addEventListener('click', addEmoji);
