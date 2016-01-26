# virtualos

## Description
This is an experimental module for the [Monkey programming language](https://github.com/blitz-research/monkey), meant to provide an alternative frontend (And implementation) of '[os](https://github.com/blitz-research/monkey/tree/develop/modules/os)'. Most notably, this provides an implementation for JavaScript based targets. For example, the HTML5 target, and the unofficial '[jstool](https://github.com/Regal-Internet-Brothers/jstool-target-monkey)' target (Including supported derivatives).

### Features:
* Full API compatibility with the official '[os](https://regal-internet-brothers.github.io/monkey/docs/Modules_os.html)' module.
* Compatibility with the '[brl](https://regal-internet-brothers.github.io/monkey/docs/Modules_brl.html)' module's '[os](https://regal-internet-brothers.github.io/monkey/docs/Modules_os.html)' equivalents.
* Support for multiple backends. (C++, JavaScript, etc; several configuration options)
* Usable as a 1-1 replacement for '[os](https://regal-internet-brothers.github.io/monkey/docs/Modules_os.html)' when provided with Monkey's official "[os.cpp](https://github.com/blitz-research/monkey/blob/develop/modules/os/native/os.cpp)" file.
* Fully working file-system based on HTML5's file-storage and ECMA Script's object mechanics.
* Stable file-path semantics. (Used heavily in [WebCC](https://github.com/Regal-Internet-Brothers/webcc-monkey#webcc-monkey))
* Configurable behavior for '[Execute](https://regal-internet-brothers.github.io/monkey/docs/Modules_brl.process.html#Execute)'. (User-defined; native code)
* Format-independent file-storage. (Abstraction layer)
* Persistent storage between executions. (HTML5 file storage; [demo available](https://github.com/Regal-Internet-Brothers/virtualos/blob/master/Examples/save_and_load/save_and_load.monkey))
* Optional experimental and/or unsafe extensions; storage mechanics, file downloads, etc.
* Support for "virtual directory structures" using [this tool](https://github.com/ImmutableOctet/monkey-tools/blob/master/Virtual_Directory_Generator/Virtual_Directory_Generator.monkey).
* Self-contained; no external module requirements unless requested.
* Native conversion routines between (Binary) strings, base64, and raw ArrayBuffers.

## Purpose and Current Usage
This is still an experimental product. *Some behavior is untested* (JS codebase), and may perform differently from BRL's implementation. Use this module at your own risk.

This was created in tandem with the ['WebCC' project](https://github.com/Regal-Internet-Brothers/webcc-monkey#webcc-monkey), an on-going port of Monkey's compiler to modern web browsers. That project is primarily powered by this module, so therefore, any changes made to this module need to behave with that compiler.

Because this needs to be used with 'WebCC', dependencies to unofficial modules, such as 'regal', will remain optional.

### TODO:
* Optimize storage performance with JavaScript: Properties vs. Relational Lookups.
