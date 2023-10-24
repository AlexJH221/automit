import * as vscode from 'vscode';
import OpenAI from "openai";
import { ChatCompletion } from 'openai/resources';
import { getAPIKey } from './sourceControl';


// do not hardcode api key
// prompt user for api key and store it in the global state


export async function openAITest(context: vscode.ExtensionContext, diff: String): Promise<ChatCompletion> {
  const apiKey = await getAPIKey(context);
  const openai = new OpenAI({ apiKey: apiKey });

  
  const outputChannel = vscode.window.createOutputChannel('OpenAI Output Channel');
  let terminal;
  if (vscode.window.activeTerminal) {
    terminal = vscode.window.activeTerminal;
  }
  else {
    terminal = vscode.window.createTerminal('OpenAI');
  }

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: `write a git commit message for this diff thats between 50-75 charecters long with the format "<category>: <message>" where categor can be either "feat" for a new feature, "ref" for refactoring, "fix" for fixing a bug : ${diff}` }],
    model: "gpt-3.5-turbo",
  });

  
  // terminal.sendText(`${JSON.stringify(completion.choices[0])}`, false);
  // outputChannel.appendLine(`${JSON.stringify(completion.choices[0])}`);
  // outputChannel.show();

  return completion;
}
