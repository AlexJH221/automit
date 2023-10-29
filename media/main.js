//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { colors: [] };

  /** @type {Array<{ value: string , selected: boolean}>} */
  let colors = oldState.colors;

  updateMessagesList(colors);

  // @ts-ignore
  document.querySelector('.commit-message-button').addEventListener('click', () => {
    requestNewMessage();
  });

  // @ts-ignore
  document.querySelector('.clear-messages-button').addEventListener('click', () => {
    colors = [];
    updateMessagesList(colors);
  });

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case 'newMessage':
        {
          addMessage(message.value);
          break;
        }
      case 'clearMessages':
        {
          colors = [];
          updateMessagesList(colors);
          break;
        }

    }
  });

  /**
   * @param {Array<{ value: string , selected: boolean}>} messages
   */
  function updateMessagesList(messages) {
    const ul = document.querySelector('.message-list');
    // @ts-ignore
    ul.textContent = '';
    for (const message of messages) {
      const li = document.createElement('li');
      li.className = 'message-entry';
      li.addEventListener('click', (el) => {
        onMessageClicked(message.value);
        //get all the li elements
        const lis = document.querySelectorAll('.message-entry');
        //remove the selected class from each
        lis.forEach((li) => {
          li.classList.remove('selected');
        });
        //add the selected class to the clicked li
        li.classList.toggle('selected');
      1});

      const input = document.createElement('p');
      input.className = 'message-input';
      input.innerHTML = message.value;
      
      li.appendChild(input);

      // @ts-ignore
      ul.appendChild(li);
    }

    // Update the saved state
    vscode.setState({ colors: colors });
  }

  /** 
   * @param {string} m
   */
  // @ts-ignore
  function onMessageClicked(m) {
    vscode.postMessage({ type: 'messageSelected', value: m});
  }

  /**
   * @returns string
   */
  // @ts-ignore
  function getNewCalicoColor() {
    const colors = ['020202', 'f1eeee', 'a85b20', 'daab70', 'efcb99'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function addMessage(m = 'test') {
    // request new message to vscode etension
    colors.push({ value: m , selected: false});
    updateMessagesList(colors);
  }

  function requestNewMessage() {
    // request new message to vscode etension
    vscode.postMessage({ type: 'newMessageRequest' });
  }
}());

