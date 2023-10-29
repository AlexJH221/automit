import * as vscode from 'vscode';
import { generateMessage, openAITest } from './openai';

export default class AutomitCommitView implements vscode.WebviewViewProvider {

	public static readonly viewType = 'automit.commitView';

	private _view?: vscode.WebviewView;
    private context: vscode.ExtensionContext;

	constructor(
		private readonly _extensionUri: vscode.Uri, context: vscode.ExtensionContext
	) { 
        this.context = context;
    }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'generateCommitMessage':
					{
						// vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
                        generateMessage(this.context).then((completion) => {
                            vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`${completion.choices[0].message.content}`));
                        });
						break;
					}
				case 'newMessageRequest':
					{
						// notification that a new message was added
						let message = (await generateMessage(this.context)).choices[0].message.content;
						// vscode.window.showInformationMessage(`New message requested: ${message}`);
						this._view?.webview.postMessage({ type: 'newMessage', value: message });
					}
					break;
				case 'messageSelected':
					{
						// notification that a message was selected
						vscode.window.showInformationMessage(`Message selected: ${data.value}`);
						// let terminal = vscode.window.activeTerminal;
						// terminal?.sendText(`git commit -m "${data.value}"`);
						// terminal?.show();
						break;
					}
					break;
				default:
					break;
			}
		});
	}

	


	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <!--
        Use a content security policy to only allow loading styles from our extension directory,
        and only allow scripts that have a specific nonce.
        (See the 'webview-sample' extension sample for img-src content security policy examples)
    -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link href="${styleResetUri}" rel="stylesheet">
    <link href="${styleVSCodeUri}" rel="stylesheet">
    <link href="${styleMainUri}" rel="stylesheet">


    <title>Messages</title>
    </head>
    <body>
        <ul class="message-list">
        </ul>

        <button class="commit-message-button">Commit Message</button>
        <button class="clear-messages-button">Clear Messages</button>


        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>
`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
