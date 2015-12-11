# virtualos

## Description
This is a highly experimental module for the [Monkey programming language](https://github.com/blitz-research/monkey), meant to provide an alternative implementation of '[os](https://github.com/blitz-research/monkey/tree/develop/modules/os)'. Most notably, this provides an implementation for JavaScript based targets. For example, the HTML5 target, or the unofficial '[jstool](https://github.com/Regal-Internet-Brothers/jstool-target-monkey)' target (And derivatives).

## Purpose and Current Usage
This is not a finished product in any sense of the word. Behavior is untested, and subject to major changes internally. **Do not use this module yet**.

This was created in tandem with the ['WebCC' project](http://regal-internet-brothers.github.io/webcc), an on-going port of Monkey's compiler to web browsers. The project is primarily powered by this module, so therefore, any changes made to this module need to behave with that compiler.

Because this needs to be used with 'WebCC', dependencies to unofficial modules, such as 'regal', must be optional.

## Roadmap:
* Change the JS virtual file-system to use 'ArrayBuffer' for long-term storage, rather than strings.

### TODO:
* Move to 'ArrayBuffer' internally.
* Change empty file symbols into a unified object identifier.
* Represent directory meta-data with 'null' (Or similar; migrate away from custom directory storage).
* Change conversions and temporary uses of strings where applicable.
