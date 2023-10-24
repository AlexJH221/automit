// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SourceControlProvider, addAllFiles, autoCommit, getDiff, getAPIKey, saveAPIKey, autoPush } from './libs/sourceControl';
import { openAITest } from './libs/openai';
import { openWebView } from './libs/webview';
import { SidebarProvider } from './SidebarProvider';
import { get } from 'http';


async function promptForAPIKey() {
  const apiKey = await vscode.window.showInputBox({
    prompt: 'Please enter your API key',
    placeHolder: 'API key',
  });
  return apiKey;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// prompt user for api key and store it in the global state
	context.globalState.setKeysForSync(['automit.apiKey']);

	// check if api key is already saved
	let key = getAPIKey(context);

	  if (!key) {
    vscode.window.showInformationMessage('No API key found. Please enter your API key.');

    promptForAPIKey().then((apiKey) => {
      if (apiKey) {
        // Save the API key.
        saveAPIKey(context, apiKey);

        vscode.window.showInformationMessage('API key saved successfully.');
      } else {
        vscode.window.showWarningMessage('API key was not provided.');
      }
    });
  }

	// init webview
	// openWebView();
	// const controller = new SourceControlProvider();
	// controller.registerCommands();
	let disposable = vscode.commands.registerCommand('automit.automit', async () => {


		// const sidebarProvider = new SidebarProvider(context.extensionUri);
		// context.subscriptions.push(
		// 	vscode.window.registerWebviewViewProvider(
		// 		"automit-sidebar",
		// 		sidebarProvider
		// 	)
		// );
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		const diff = await getDiff();
		if(diff !== undefined){
			// check if diff is empty
			if(diff.length === 0){
				vscode.window.showInformationMessage('No changes to commit');
				return;
			}
			let comp = await openAITest(context, diff);

			// ask user if they want to commit with the given message
			// if yes, commit
			// if no, do nothing

			vscode.window.showInformationMessage(`Commit with message: "${comp.choices[0].message.content}"?`, 'Yes', 'No').then((selection) => {
				if(selection === 'Yes'){
					addAllFiles();
					autoCommit(comp.choices[0].message.content as string);
					// autoPush();
				}
				else{
					//show an input box to get the commit message
					vscode.window.showInputBox({
						placeHolder: "Commit Message",
						prompt: "Enter a commit message",
						value: comp.choices[0].message.content as string,
						validateInput: (text) => {
							if(text.length > 75){
								return 'Commit message must be less than 75 characters';
							}
							else if(text.length < 20){
								return 'Commit message must be greater than 20 characters';
							}
							else{
								return null;
							}
						}
					}).then((message) => {
						if(message !== undefined){
							addAllFiles();
							autoCommit(message);
						}
					});
				}
			});

		}

	});

	context.subscriptions.push(disposable);
	// context.subscriptions.push(controller);
}

// This method is called when your extension is deactivated
export function deactivate() {}
