# @sys/std-server
Standard system libraries for running within a (non-browser) server environment.

Surfaces and augments, with server specific modules, the "[@sys/std](https://jsr.io/@sys)" module which in turn surfaces the deno "[@std libs](https://jsr.io/@std)" module(s).


### System Namespace:

- [`jsr: @sys/std`](https://jsr.io/@sys/std)
- [`jsr: @sys/std-server`](https://jsr.io/@sys/std-server)


#### Example

```ts
import { Fs } from '@sys/std-server';
```