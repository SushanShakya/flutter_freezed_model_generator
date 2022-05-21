import * as vscode from 'vscode';
import { generateFreezedClass } from './templates/freezed_class';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("extension.freezedClass", generateFreezedClass),
	)
}

export function deactivate() { }
