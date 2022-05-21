import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it	
import * as vscode from 'vscode';
import { generateFreezedClass } from '../../templates/freezed_class';
// import * as myExtension from '../../extension';
import { getClassTemplate, extractFields, getHeaders } from '../../templates/freezed_class';

suite('Freezed Class Tests', () => {
	test('getFreezedClass() Test', () => {
		let s: string = getClassTemplate('HelloWorld', '');
		let req: string = `class HelloWorld with _$HelloWorld {
\tconst factory HelloWorld({

\t}) = _HelloWorld;

\tfactory HelloWorld.fromJson(Map<String, dynamic> json) => _$HelloWorldFromJson(json);
}`;
		assert.strictEqual(s, req);
	});

	test('extractFields() Test', () => {
		extractFields(`{
			"sushan" : "shakya",
			"hey": 1,
			"Hi" : 10.5,
			"o": "2022-05-21T13:55:59.443",
			"a": false
		}`)
	})

	test('getHeaders() Test', () => {
		let s: string = getHeaders('respone_task')
		console.log(s)
	})

});
