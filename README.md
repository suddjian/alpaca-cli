# Alpaca CLI

Manage your Alpaca portfolio from the comfort of your terminal!

Good when you want to trade inconspicuously (at work, at school, in a boring meeting),
or if you're just a nerd like me.

## Warning

_You_ are responsible for your Alpaca account,
and for using this software responsibly.
Make sure that you know what a command will do before you run it.
This tool is currently being developed only for my own personal use and amusement,
and is distributed in the hope that others might find it interesting.
It does not come with safety features and has no guarantees of correctness.

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed,
and then run:

```sh
npm install -g alpaca-cli
```

This will install the `alpaca` command globally.

Get an api key from https://alpaca.markets, and configure your alpaca cli:

```sh
alpaca configure --id=<key-id> --secret=<secret-key>
```

## Usage

```sh
alpaca <command>

commands:
  configure   configure your alpaca cli installation
  buy         buy a stock
  sell        sell a stock
  report      display a report of your current portfolio
```

Run `alpaca help <command>` for help with a specific command.
