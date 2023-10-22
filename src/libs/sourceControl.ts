import * as vscode from 'vscode';
import * as fs from 'fs';
import { openAITest } from './openai';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



export class SourceControlProvider {
  sourceControl: any;
  // customButton: HTMLButtonElement;
  // customButton: HTMLButtonElement;

  constructor() {
    // enable webview
    this.sourceControl = vscode.scm.createSourceControl('my-source-control', 'Automit');
    if (!this.sourceControl) {
      throw new Error('Failed to create source control.');
    }
    this.sourceControl.quickDiffProvider = this as any;

    // this.customButton = document.createElement('button');
    // this.customButton.textContent = 'Custom Button';
    // this.customButton.className = 'custom-button'; // Add a custom CSS class if needed

    // // Attach a click event handler to the button
    // this.customButton.addEventListener('click', () => {
    //   // Handle button click event
    //   vscode.commands.executeCommand('extension.mySourceControlCommand');
    // });

    // // Append the button to the source control view
    // this.sourceControl.root = this.customButton;
  }


  get label() {
    return 'Automit';
  }

  async provideOriginalResource(uri: String) {
    return uri;
  }

  async quickDiff(uri: String) {
    // Implement quick diff logic if needed
    return null;
  }

  registerCommands() {
    const button = document.createElement('button');
    button.className = 'blue-button'; // Apply the custom CSS class
    button.textContent = 'My Blue Button';

    // Define a command that will be triggered by the button
    button.addEventListener('click', () => {
      vscode.commands.executeCommand('extension.mySourceControlCommand');
    });

    // Append the button to the source control provider's view
    this.sourceControl.root = button;
    // Define a command that will be triggered by the new button

    let sourceControlButton = vscode.commands.registerCommand('automit.sourceControlCommand', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		const diff = await getDiff();
		if(diff !== undefined){
			// check if diff is empty
			if(diff.length === 0){
				vscode.window.showInformationMessage('No changes to commit');
				return;
			}
			let comp = await openAITest(diff);

			// ask user if they want to commit with the given message
			// if yes, commit
			// if no, do nothing

			vscode.window.showInformationMessage(`Commit with message: "${comp.choices[0].message.content}"?`, 'Yes', 'No').then((selection) => {
				if(selection === 'Yes'){
					addAllFiles();
					autoCommit(comp.choices[0].message.content as string);
				}
			});

		}

	});

    // Register the command
    this.sourceControl.commands = [sourceControlButton];
  }

  dispose() {
    // Clean up resources if needed
  }
}

export function addAllFiles() {
  // Get the file's URI and open a terminal
  let terminal;
  if(vscode.window.activeTerminal){
    terminal = vscode.window.activeTerminal;
  }
  else{
    terminal = vscode.window.createTerminal('Git Commit');
  }

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
    terminal.sendText(`git commit -m "${message}"`);
    terminal.show();
  } else {
    vscode.window.showWarningMessage('Open a file to commit.');
  }
}




export async function getDiff(): Promise<String | undefined> {
  // addAllFiles();
  let terminal;

  if (vscode.window.activeTerminal) {
    terminal = vscode.window.activeTerminal;
  } else {
    terminal = vscode.window.createTerminal('OpenAI');
  }

  terminal.sendText(`git diff > dif`);

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

