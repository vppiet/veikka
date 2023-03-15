# Development Log

## 2023-03-06
In *irc-framework* types, cannot re-export class type. IntelliSense doesn't recognize it.

## 2023-03-11
Let's use `dts-gen` for generating initial types for *irc-framework*. Result: very rough with a alot of types being `any`. Back to manual typing. Export doesn't still work as intended.

## 2023-03-13
Needed to set `typeRoots` and `paths` to include *irc-framework* types.
