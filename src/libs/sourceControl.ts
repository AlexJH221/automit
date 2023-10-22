import * as vscode from 'vscode';
import fetch from 'node-fetch';
import * as fs from 'fs';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



export function addAllFiles() {
  // Get the file's URI and open a terminal
  const terminal = vscode.window.createTerminal('Git Add');

  // Run the Git commit command in the terminal
  terminal.sendText(`git add -A`);
  terminal.show();
}


export function autoCommit(message: string) {
  // Get the currently active text editor
  const editor = vscode.window.activeTextEditor;
 
  if (editor) {
    // Check if the current file is saved
    if (editor.document.isDirty) {
      vscode.window.showWarningMessage('Please save the file before committing.');
      return;
    }

    // Get the file's URI and open a terminal
    const fileUri = editor.document.uri;
    const terminal = vscode.window.createTerminal('Git Commit');

    // Run the Git commit command in the terminal
    // terminal.sendText(`git commit -m "Auto commit: ${fileUri.fsPath}"`);
    addAllFiles();
    terminal.sendText(`git commit -m "${message}"`);
    terminal.show();
  } else {
    vscode.window.showWarningMessage('Open a file to commit.');
  }
}



// export async function getDiff() {
//   let terminal;
//   if (vscode.window.activeTerminal) {
//     terminal = vscode.window.activeTerminal;
//   }
//   else {
//     terminal = vscode.window.createTerminal('OpenAI');
//   }
//   terminal.sendText(`git diff >> dif `);

//   const filePath = vscode.workspace.rootPath + '/dif';

//   console.log("dif path: ", filePath);

//   if (!fs.existsSync(filePath)) {
//     vscode.window.showErrorMessage('The diff file does not exist.');
//     return;
//   }

//   // Read the contents of the .diff file
//   fs.promises.readFile(filePath, 'utf8')
//     .then(data => {
//       const diffContents = data.toString();
//       //show the contents of the diff file in the output channel
//       vscode.window.showInformationMessage(diffContents);
//       // Now you have the .diff file contents in the 'diffContents' variable
//       // You can use or manipulate this data as needed.
//     })
//     .catch(error => {
//       vscode.window.showErrorMessage('Error reading the .diff file: ' + error.message);
//     });

//     //clean up code
//   terminal.sendText(`rm dif`);
// }




export async function getDiff(): Promise<String | undefined> {
  let terminal;

  if (vscode.window.activeTerminal) {
    terminal = vscode.window.activeTerminal;
  } else {
    terminal = vscode.window.createTerminal('OpenAI');
  }

  terminal.sendText(`git diff >> dif`);

  const filePath = vscode.workspace.rootPath + '/dif';

  console.log("dif path: ", filePath);

  // Check if the .diff file exists and wait for it to be created
  while (!fs.existsSync(filePath)) {
    await sleep(1000); // Wait for 1 second before checking again
  }

  // At this point, the .diff file exists and is ready to be read
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const diffContents = data.toString();
    vscode.window.showInformationMessage(diffContents);
    // You now have the .diff file contents in the 'diffContents' variable.
    // You can use or manipulate this data as needed.

    // Clean up: Remove the .diff file
    terminal.sendText(`rm dif`);
    return diffContents;
  } catch (error: any) {
    vscode.window.showErrorMessage('Error reading the .diff file: ' + error.message);
  }
}

