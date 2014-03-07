# js helper

EXPERIMENTAL !!! open to discussion

SECURITY !!! this helper uses javascript ```eval/Function```, it is dangerous to use it with untrusted/not compiled templates

This is very universal helper inspired by [jstemplate](https://code.google.com/p/google-jstemplate/wiki/TemplateProcessingInstructionReference).

Different functionality is executed based on first parameter used.

Value of all parameters is JavaScript expression. It is compiled and executed with access to JavaScript global, dust global and current scope data.
The ```this``` keyword in expression is current ```chunk```. Expression is wrapped with ```with (ctx_.global) with (data_) with (loopData_)```
so you have access to global and scope data without prefixing them. To access the data explicitly you may use ```ctx_```, ```data_``` or ```loopData_``` variables in expression.

Special variable ```$this``` (different as this!) is the same as ```data_``` and ```contex.stack.head```. Other dust helpers use "." instead of $this variable.

The for parameter adds to context ```$key```, ```$value``` and ```$type``` variables, their meaning is the same as in @iterate helper.

## Definitions

```
{@js expr="<JS expression>" /}
{@js for="<JS expression>"}{$key}-{$value} of type {$type}{/js}
{@js if="<JS expression>"}evaluated to true{:else}evaluated to false{/js}
{@js switch="<JS expression>"}
{:a}
if result was a
{:b}
if result was b
{:else}
if defined, any result different from a and b will render this line
{/js}
```

## Example

See tests in ```js-*-test.js``` files for more examples and usage possibilities.

```
              Data: { today: new Date(), title: "Famous People", names: [{ "name": "Larry", "age": 20 },{ "name": "Curly", "age": 30 },{ "name": "Moe", "age": 40 }] }

              {title} - {@js expr="moment(today).format('dd.MM.YYYY')" /}
              <ul>
                {#names}
                  <li>{@js expr="'-'+name"/}</li>{~n}
                {/names}
              </ul>

              Use @js-for
              <ul>
                 {@js for="names"}
                    <li>{$value.name} {@js expr="10+$value.age"/}</li>{~n}
                 {/js}
              </ul>

              Output:
              Famous People
              -Larry
              -Curly
              -Moe

              Use @js-for
              Larry 30
              Curly 40
              Moe 50
```

## Usage
Depends on dustjs-helpers module to be loaded first since it requires tap helper.

In node.js:
require('dustmotes-js');

In browser:
If not using require, load the JS some other way and call it with the dust object. As noted earlier,
dustjs-helpers must be loaded earlier.

