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

## 2023-03-22
Made `veikka.spec.ts` and `veikka.ispec.ts` to separate unit and integration tests. `connect()` and ts-jest ESM still needed.

## 2023-03-23
ESM support ok. Don't know if it's necessary, really, if I don't need to transform anything. Anyhow, there is a template for `connect()` method as an integration test. *Irc-framework* though connects synchronously and need to figure out how to test it.

## 2023-03-24
`connect()` integration test we can test with a listener which

1) changes some state on the instance object on connection
2) disconnects when it's done
3) after disconnection, we can check the changed state

*Winston's* `colorize` format doesn't seem to work properly. Might me a misconfiguration.

Did some initial work on middlewares. MiddlewareRegister a bit too mucho aka over-engineering?

## 2023-03-26

Getting a child logger is in place now. One middleware works.

RegistrationEvent and PrivMsgEvent are defined. They should be defined in their right own files, though. `commands/handlers/` or somewhere.
