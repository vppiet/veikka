# Development Log

## 2023-03-06
In *irc-framework* types, cannot re-export class type. IntelliSense doesn't recognize it.

## 2023-03-11
Let's use `dts-gen` for generating initial types for *irc-framework*. Result: very rough with a alot of types being `any`. Back to manual typing. Export doesn't still work as intended.

## 2023-03-13
Needed to set `typeRoots` and `paths` to include *irc-framework* types.

## 2023-03-20
What to do next... Defining `DEFAULT_OPTIONS`, perhaps. And test it. Should we have `port` and `host` defined by default? Doesn't seem necessary. Maybe just act as a wrapper for *irc-framework's* connect and give the opportunity to pass them as an additional parameters. Also ts-jest ESM support should be done.

## 2023-03-21
Done: DEFAULT_OPTIONS. Next time `VeikkaConnectionOptions` and `connect()`. ts-jest ESM support still lacking...
