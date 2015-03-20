# hubot-pingdom-tools

Pingdom Tools for Hubot

## Installation

In your hubot repository, run:

`npm install hubot-pingdom-tools --save`

Then add **hubot-pingdom-tools** to your `external-scripts.json`:

```json
["hubot-pingdom-tools"]
```

## Configuration

`pingdom-tools` requires no further configuration to work.

Pingdom have API endpoints for this service but it's not clear whether they expect usage to be authenticated, so at this point there is no configuration required.

## Example interactions

Ask Hubot to initiate a Full Page Report on a site. Hubot will poll Pingdom and reply when the report is prepared.

```
Chris> hubot is github.com fast?
hubot> Full page report: http://fpt.pingdom.com/#!/J4FMr/github.com
       Pagespeed score 90, faster than 81% of sites.
       976791 bytes in 1464 ms.
```

## Development

Fork this repository, and clone it locally. To start using with an existing hubot for testing:

* Run `npm install` in hubot-pingdom-tools repository
* Run `npm link` in hubot-pingdom-tools repository
* Run `npm link hubot-pingdom-tools` in your hubot directory
* NOTE: if you are using something like [nodenv](https://github.com/wfarr/nodenv) or similar, make sure your `npm link` from the same node version
