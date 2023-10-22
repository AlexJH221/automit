// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { autoCommit, getDiff } from './libs/sourceControl';
import { openAITest } from './libs/openai';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('automit.helloWorld', async () => {
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

			autoCommit(comp.choices[0].message.content as string);

		}

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
