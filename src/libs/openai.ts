import * as vscode from 'vscode';
import OpenAI from "openai";
import { ChatCompletion } from 'openai/resources';
const openai = new OpenAI({ apiKey: "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" });

export async function openAITest(diff: String): Promise<ChatCompletion> {
  const outputChannel = vscode.window.createOutputChannel('OpenAI Output Channel');
  let terminal;
  if (vscode.window.activeTerminal) {
    terminal = vscode.window.activeTerminal;
  }
  else {
    terminal = vscode.window.createTerminal('OpenAI');
  }

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: `write a git commit message for this diff thats between 50-75 charecters long: ${diff}` }],
    model: "gpt-3.5-turbo",
  });


  // terminal.sendText(`${JSON.stringify(completion.choices[0])}`, false);
  // outputChannel.appendLine(`${JSON.stringify(completion.choices[0])}`);
  // outputChannel.show();

  return completion;
}
