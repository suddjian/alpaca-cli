# Alpaca CLI

Manage your Alpaca portfolio from the comfort of your terminal!

Good when you want to trade inconspicuously (at work, at school, in a boring meeting),
or if you're just a nerd like me.

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed,
and then run:

```sh
npm install -g alpaca-cli
```

This will add the `alpaca` command to your terminal.

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
