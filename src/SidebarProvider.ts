import * as vscode from "vscode";


export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {

    return `<!DOCTYPE html>
      <html>
      <head>
          <style>
              /* Style for the button */
              .button {
                  display: inline-block;
                  padding: 8px 16px;
                  background-color: #007ACC; /* Blue color */
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
              }

              /* Hover effect */
              .button:hover {
                  background-color: #005D99; /* Darker blue on hover */
              }
          </style>
      </head>
      <body>
          <button class="button">Blue Button</button>
      </body>
      </html>
`;
  }
}
