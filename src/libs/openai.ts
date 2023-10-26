import * as vscode from 'vscode';
import OpenAI from "openai";
import { ChatCompletion } from 'openai/resources';
import { getAPIKey } from './helpers';
import { getDiff } from './sourceControl';


export async function openAITest(context: vscode.ExtensionContext, diff: String): Promise<ChatCompletion> {
  const apiKey = await getAPIKey(context);
  const openai = new OpenAI({ apiKey: apiKey });

  const completion = await openai.chat.completions.create({
    messages: [{ role: "assistant", content: `write a git commit message for this diff thats between 50-100 charecters long with the format "<category>: <message>" where categor can be either "feat" for a new feature, "ref" for refactoring, "fix" for fixing a bug : ${diff}` }],
    model: "gpt-3.5-turbo",
  });

  
  return completion;
}

export async function generateMessage(context: vscode.ExtensionContext): Promise<ChatCompletion> {
  const diff = await getDiff();
  const apiKey = await getAPIKey(context);
  const openai = new OpenAI({ apiKey: apiKey });

  const completion = await openai.chat.completions.create({
    messages: [{ role: "assistant", content: `write a git commit message for this diff thats between 50-100 charecters long with the format "<category>: <message>" where categor can be either "feat" for a new feature, "ref" for refactoring, "fix" for fixing a bug : ${diff}` }],
    model: "gpt-3.5-turbo",
  });

  
  return completion;
}
