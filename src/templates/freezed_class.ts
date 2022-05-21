import { writeFileSync } from "fs";
import * as vscode from "vscode";

export function getClassTemplate(name: string, fields: string): string {
    return `class ${name} with _\$${name} {
\tconst factory ${name}({
${fields}
\t}) = _${name};

\tfactory ${name}.fromJson(Map<String, dynamic> json) => _\$${name}FromJson(json);
}`
}

export function getHeaders(fileName: string) {
    return `import 'package:freezed_annotation/freezed_annotation.dart'; 

part '${fileName}.freezed.dart';
part '${fileName}.g.dart';`;
}

async function getContentFromClipboard(): Promise<string> {
    try {
        let content = await vscode.env.clipboard.readText();
        return content;
    } catch (e) {
        throw "Could not get clipboard contents";
    }
}

function getFieldTemplate(variableName: string, variableType: string): string {
    return `${variableType}? ${variableName},`;
}

function extractJSON(json: string): any | null {
    try {
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

function getDartDataType(x: any): string {
    var type = typeof x;
    if (type === 'string') {
        if (checkDate(x)) {
            return 'DateTime';
        }
        return "String";
    }
    if (type === 'number') {
        return checkNumber(x);
    }
    if (type === 'boolean') {
        return 'bool';
    }
    return 'dynamic';
}

function checkDate(x: string): boolean {
    try {
        new Date(x);
    } catch (e) {
        return false;
    }
    return true;
}

function checkNumber(x: number): string {
    if (Math.round(x) === x) {
        return 'int';
    }
    return 'double';
}

export function extractFields(json: string) {
    var data: any | null = extractJSON(json);
    if (data === null) throw '';
    var fields: string[] = [];
    let key: keyof typeof data;
    for (key in data) {
        var variableType: string = getDartDataType(data[key])
        var template: string = getFieldTemplate(key, variableType)
        fields.push(template)
    }
    return fields.join('\n')
}

async function getInput(prompt: string): Promise<string> {
    let name = await vscode.window.showInputBox({
        "prompt": prompt
    });
    if (typeof name === 'undefined') throw 'Invalid Input';
    return name;
}

async function getFreezedClass(className: string, fileName: string): Promise<string> {
    try {
        let content: string = await getContentFromClipboard();
        let headers: string = getHeaders(fileName);
        let fields: string = extractFields(content);
        let classTemplate = getClassTemplate(className, fields);
        let result = `${headers}\n\n${classTemplate}`;
        return result;
    } catch (e) {
        throw e as string;
    }
}

export async function generateFreezedClass(uri: vscode.Uri) {
    try {
        // [full_path] is the path where we generate the file into.
        let full_path: string;

        // Check for when user invokes command from Ctrl + Shift + p
        if (typeof uri == "undefined") {
            throw "Please use command from explorer !";
        } else {
            full_path = uri.fsPath;
        }
        let className: string = await getInput("Enter class name : ");
        let fileName: string = await getInput("Enter filename : ");
        let filePath = `${full_path}\\${fileName}.dart`;
        let res: string = await getFreezedClass(className, fileName);
        writeFileSync(filePath, res, {
            "flag": "w+"
        })
    } catch (e) {
        vscode.window.showErrorMessage(e as string);
    }
}