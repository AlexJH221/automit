import * as vscode from 'vscode';
export function getAPIKey(context: vscode.ExtensionContext) {
  // Get the API key from the global state
  const apiKey = context.globalState.get('automit.apiKey') as string;
  return apiKey;
}

export async function saveAPIKey(context: vscode.ExtensionContext,apiKey: string) {
  // Save the API key to the global state
  await context.globalState.update('automit.apiKey', apiKey);
}


export async function promptForAPIKey(context: vscode.ExtensionContext){
  const apiKey = await vscode.window.showInputBox({
    placeHolder: 'Enter your API key',
    ignoreFocusOut: true,
  });

  if(apiKey){
    await saveAPIKey(context, apiKey);
  }
  return apiKey;
}
