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

## 2023-04-02

Hmm, let's simplify *irc-framework's* types: all in index.d.ts and use only whatever is client-side API!

Middleware types are confusing. Figure it out.

Continue: IrcClient.rawString()

## 2023-08-13

I linked *irc-framework's* types symbolically with `npm link`. It installs it as a global module so that I can use the types while developing them.

TODO: Variadic tuple types for IrcClient.whois()

## 2023-09-05

Options constructor parameter as {nick: <nick>} is overwritten. Fix: use either constructor or connect method to pass options.

## 2023-10-11

Back to tinkering. Let's just send it, get a working POC. Migrated to Bun to test new dev things. It might be a great alternative to Node/Jest/nodemon bundle for such a small project.

HLTV RSS would be nice: a channel subcribes into the news, bot polls the RSS file once in a while, and sends a message when a new news item is available.

## 2023-10-15

Of the rails, again. Now working on auto cmd authorization for Qnet. Next: admin commands (quit). Got this when exiting the program forcefully:

`{"level":"info","message":{"command":"irc error","event":{"error":"irc","reason":"Your host is trying to (re)connect too fast -- throttled"}},"module":"logPlugin","timestamp":"2023-10-14T22:45:26.251Z"}`

So let's get it go down gracefully, so the server is happy, too.

## 2023-10-23

TODO: clear timers before shutdown

Done.