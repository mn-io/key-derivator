# Key Derivator

Tool for creating unique passwords, which can be re-generated from anywhere

More information about the basic idea can be found here: https://en.wikipedia.org/wiki/Key_derivation_function


## Implementation details
* Using PBKDF2 for hashing
* Hashs are translated into "readable" passwords by certain range of characters provided in `public/config.json`

##
* Code is executed within client's browser and no server interaction is needed. Therefore we can just serve static files
* Client App is based on ReactJS
* Hashbox with full test coverage and basic self-test on each app start.


## Screenshot
![Screenshot](https://raw.githubusercontent.com/mn-io/key-derivator/master/screenshot.png)


## Status

[![CircleCI](https://circleci.com/gh/mn-io/key-derivator/tree/master.svg?style=svg)](https://circleci.com/gh/mn-io/key-derivator/tree/master)

[![codecov](https://codecov.io/gh/mn-io/key-derivator/branch/master/graph/badge.svg)](https://codecov.io/gh/mn-io/key-derivator)

[![Dependencies Status](https://david-dm.org/mn-io/key-derivator/status.svg)](https://david-dm.org/mn-io/key-derivator)

[![devDependencies Status](https://david-dm.org/mn-io/key-derivator/dev-status.svg)](https://david-dm.org/mn-io/key-derivator?type=dev)


## Security

A quick check on the character output shows that there are very equaly distributed.
The difference of character likelihood to the mean is less than 0.1%.

`npm run test src\services\HashBoxDistirbution.spec.ts` and take a look at the `console.log`.

Test idea based on https://donjon.ledger.com/kaspersky-password-manager/

## To Dos

- Refactoring: variable names, use state destruction
- Increase test coverage for non criticial code
- cache config in localStorage
- update dependencies
