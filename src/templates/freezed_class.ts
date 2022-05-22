import { privateEncrypt } from "crypto";
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

function extractJSON(json: string): object | null {
    try {
        return JSON.parse(json);
    } catch (e) {
        return null;
    }
}

function getDartDataType(key: string, x: any): string {
    var type = typeof x;
    if (type === 'string') {
        if (checkDate(x)) {
            return 'DateTime';
        }
        return "String";
    }
    if (type === 'number') {
        if (checkFloating(x)) {
            return 'double';
        }
        return 'int';
    }
    if (type === 'boolean') {
        return 'bool';
    }
    if (type === 'object') {
        if (Array.isArray(x)) {
            let listType: string = (x.length === 0) ? 'dynamic' : extractListType(key, x[0]);
            return `List<${listType}>`;
        } else {
            return getNewClassName(key);
        }
    }
    return 'dynamic';
}


function getFirstLetterCapital(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
function getUpperCamelCase(snakeCase: string): string {
    let names = snakeCase.split("_");
    let capitalized = names.map((v, i) => {
        return getFirstLetterCapital(v);
    })
    return capitalized.join("")
}

function getNewClassName(key: string): string {
    return getFirstLetterCapital(getUpperCamelCase(key));
}

function extractListType(key: string, x: any): string {
    if (typeof x === 'object') {
        if (Array.isArray(x)) {
            let listType: string = extractListType(key, x[0]);
            return `List<${listType}>`;
        } else {
            return getNewClassName(key);
        }
    }
    if (typeof x === 'string') {
        return 'String';
    }

    if (typeof x === 'number') {
        if (checkFloating(x)) {
            return 'double';
        }
        return 'int';
    }
    return 'dynamic';
}

function checkDate(x: string): boolean {
    let res = Date.parse(x);
    return !Number.isNaN(res)
}

function checkFloating(x: number): boolean {
    if (Math.round(x) === x) {
        return false;
    }
    return true;
}

export function extractFields(data: any) {
    var fields: string[] = [];
    let key: keyof typeof data;
    for (key in data) {
        var variableType: string = getDartDataType(key, data[key])
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

function isMap(x: any): boolean {
    if (typeof x === 'object') {
        if (Array.isArray(x)) {
            return false;
        }
        return true;
    }
    return false;
}

function isList(x: any): boolean {
    if (typeof x === 'object') {
        if (Array.isArray(x)) {
            return true;
        }
        return false;
    }
    return false;
}

function hasMapDescendents(x: Array<any>): boolean {
    if (x.length === 0) return false;
    if (typeof x[0] === 'object') {
        if (Array.isArray(x[0])) {
            return hasMapDescendents(x[0]);
        } else {
            return true;
        }
    }
    return false;
}

function getFirstMapDescendent(x: Array<object>): object {
    if (Array.isArray(x[0])) {
        return getFirstMapDescendent(x[0]);
    } else {
        return x[0];
    }
}

export function getAllClasses(className: string, json: any): Array<string> {
    let fields: string = extractFields(json);
    let defaultTemplate = getClassTemplate(className, fields);
    let extraTemplates: Array<string> = []
    let key: keyof typeof json
    for (key in json) {
        if (isMap(json[key])) {
            extraTemplates = [...extraTemplates, ...getAllClasses(getNewClassName(key), json[key])]
        }
        if (isList(json[key])) {
            if (hasMapDescendents(json[key])) {
                let descendent: object = getFirstMapDescendent(json[key]);
                extraTemplates = [...extraTemplates, ...getAllClasses(getNewClassName(key), descendent)]
            }
        }

    }
    return [defaultTemplate, ...extraTemplates];
}

async function getFreezedClass(className: string, fileName: string): Promise<string> {
    try {
        let content: string = await getContentFromClipboard();
        let contentJson: object | null = extractJSON(content);
        if (contentJson === null) throw 'Invalid JSON';
        let headers: string = getHeaders(fileName);
        let classTemplate = getAllClasses(className, contentJson);
        let result = `${headers}\n\n${classTemplate.join('\n\n')}`;
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