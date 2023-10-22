import * as vscode from 'vscode';

export function openWebView() {
    const panel = vscode.window.createWebviewPanel(
        'myWebView', // Unique ID
        'My WebView', // Title
        vscode.ViewColumn.One, // Column to show the panel in
        {
            enableScripts: true, // Enable JavaScript
        }
    );

    // Read the HTML content from your file and set it as WebView content
    const webViewContent = 
        `<!Doctype html> \
        <html lang="en"> \
        <head>\
            <meta charset="UTF-8">\
            <title>My First WebView</title>\
        </head>\
        <body>\
            <h1>Hello World!</h1>\
        </body>\
        </html>`
        panel.webview.html = webViewContent;
}

