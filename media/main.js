//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const oldState = vscode.getState() || { colors: [] };

  /** @type {Array<{ value: string }>} */
  let colors = oldState.colors;

  updateColorList(colors);

  // @ts-ignore
  document.querySelector('.add-color-button').addEventListener('click', () => {
    requestNewMessage();
  });

  // @ts-ignore
  document.querySelector('.clear-colors-button').addEventListener('click', () => {
    colors = [];
    updateColorList(colors);
  });

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', event => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case 'newMessage':
        {
          addColor(message.value);
          break;
        }
      case 'clearMessages':
        {
          colors = [];
          updateColorList(colors);
          break;
        }

    }
  });

  /**
   * @param {Array<{ value: string }>} messages
   */
  function updateColorList(messages) {
    const ul = document.querySelector('.message-list');
    // @ts-ignore
    ul.textContent = '';
    for (const message of messages) {
      const li = document.createElement('li');
      li.className = 'message-entry';
      li.addEventListener('click', () => {
        onMessageClicked(message.value);
      });

      const input = document.createElement('input');
      input.className = 'message-input';
      input.type = 'text';
      input.value = message.value;
      input.addEventListener('change', (e) => {
        // @ts-ignore
        const value = e.target.value;
        if (!value) {
          // Treat empty value as delete
          messages.splice(messages.indexOf(message), 1);
        } else {
          message.value = value;
        }
        updateColorList(messages);
      });
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

  function addColor(m = 'test') {
    // request new message to vscode etension
    colors.push({ value: m });
    updateColorList(colors);
  }

  function requestNewMessage() {
    // request new message to vscode etension
    vscode.postMessage({ type: 'newMessageRequest' });
  }
}());

