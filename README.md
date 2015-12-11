# virtualos

## Description
This is an experimental module for the [Monkey programming language](https://github.com/blitz-research/monkey), meant to provide an alternative frontend (And implementation) of '[os](https://github.com/blitz-research/monkey/tree/develop/modules/os)'. Most notably, this provides an implementation for JavaScript based targets. For example, the HTML5 target, and the unofficial '[jstool](https://github.com/Regal-Internet-Brothers/jstool-target-monkey)' target (Including supported derivatives).

## Purpose and Current Usage
This is not a finished product. Some behavior is untested, and subject to changes internally. **Do not use this module yet**.

This was created in tandem with the ['WebCC' project](http://regal-internet-brothers.github.io/webcc), an on-going port of Monkey's compiler to web browsers. The project is primarily powered by this module, so therefore, any changes made to this module need to behave with that compiler.

Because this needs to be used with 'WebCC', dependencies to unofficial modules, such as 'regal', must be optional.

### TODO:
* Optimize custom-storage performance for JS; sub-properties.
