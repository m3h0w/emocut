chrome.runtime.onMessage.addListener(function (request, sender) {
  console.log('RECEIVED MESSAGE!', { request }, { sender });
  //   chrome.tabs.update(sender.tab.id, { url: request.redirect });
});

console.log('BACKGROUND');
