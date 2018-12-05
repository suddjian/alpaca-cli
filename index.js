#!/usr/bin/env node
'use strict'

const Conf = require('conf')
const commandLineCommands = require('command-line-commands')
const minimistOpts = require('minimist-options')
const parseArgs = require('minimist')
const joi = require('joi')
const Alpaca = require('@alpacahq/alpaca-trade-api')

const config = new Conf({ configName: 'alpacacli' })

function getAlpaca () {
  const keyId = config.get('keyId')
  const secretKey = config.get('secretKey')
  if (!keyId || !secretKey) throw new Error("No alpaca configuration found.\nSee 'alpaca help configure' for more information.")
  return new Alpaca({
    keyId,
    secretKey,
    paper: config.get('mode') === 'paper',
    baseUrl: config.get('baseUrl')
  })
}

const validCommands = [
  null, // alias for 'help'
  'report',
  'buy',
  'sell',
  'configure',
  'help',
]

const BUY_USAGE = `alpaca buy [quantity] <symbol>
  [--type=<market|limit|stop|stop_limit>]
  [--time-in-force=<day|gtc|opg|ioc>]
  [--limit-price=<number>]
  [--stop-price=<number>]`

const SELL_USAGE = `alpaca sell [quantity] <symbol>
  [--type=<market|limit|stop|stop_limit>]
  [--time-in-force=<day|gtc|opg|ioc>]
  [--limit-price=<number>]
  [--stop-price=<number>]`

const REPORT_USAGE = `'report' is not yet implemented! :(

Code contributions are welcome!`

const CONFIGURE_USAGE = `alpaca configure [--id=<key-id>] [--secret=<secret-key>] [--mode=<paper|live>]

Get your api key at https://alpaca.markets.

'paper' mode switches on paper trading. 'live' is the default, and uses real money.`

const HELP = `Usage:
alpaca <command>

commands:
  configure   configure your alpaca cli installation
  buy         buy a stock
  sell        sell a stock
  report      display a report of your current portfolio

Run 'alpaca help <command>' for help with a specific command.
`

const HELP_DETAILS = {
  configure: CONFIGURE_USAGE,
  buy: BUY_USAGE + '\n\nBuys a stock',
  sell: SELL_USAGE + '\n\nSells a stock',
  report: REPORT_USAGE,
  help: HELP,
}

const orderOptions = minimistOpts({
  type: {
    type: 'string',
    default: 'market',
  },
  'time-in-force': {
    type: 'string',
    default: 'gtc',
  },
  'limit-price': { type: 'number' },
  'stop-price': { type: 'number' },
  'client-order-id': { type: 'string' },
})

const orderSchema = {
  _: joi.any().optional(),
  type: joi.only('market', 'limit', 'stop', 'stop_limit').required(),
  'time-in-force': joi.only('day', 'gtc', 'opg', 'ioc').required(),
  'limit-price': joi.number().optional(),
  'stop-price': joi.number().optional(),
  'client-order-id': joi.string().optional()
}

const order = (side, usage) => async ({
  _,
  type,
  ['time-in-force']: time_in_force,
  ['limit-price']: limit_price,
  ['stop-price']: stop_price,
  ['client-order-id']: client_order_id,
}) => {
  const alpaca = getAlpaca()
  let [qty, symbol] = _
  if (!symbol && typeof qty === 'string') {
    symbol = qty
    qty = 1
  } else if (!qty || !symbol) {
    throw new Error('Usage: ' + usage)
  }

  const order = await alpaca.createOrder({
    symbol, qty, side, type, time_in_force, limit_price, stop_price, client_order_id
  })
  console.log(order)
}

const cli = {
  configure: {
    options: minimistOpts({
      id: { type: 'string' },
      secret: { type: 'string' },
      mode: { type: 'string' },
      'base-url': { type: 'string' },
    }),
    schema: {
      _: joi.any().optional(),
      id: joi.string().optional(),
      secret: joi.string().optional(),
      mode: joi.only('paper', 'live').optional(),
      'base-url': joi.string().optional(),
    },
    fn: configure
  },

  buy: {
    options: orderOptions,
    schema: orderSchema,
    fn: order('buy', BUY_USAGE),
  },

  sell: {
    options: orderOptions,
    schema: orderSchema,
    fn: order('sell', SELL_USAGE),
  },

  report: {
    options: minimistOpts({}),
    fn: report,
  },

  help: {
    options: minimistOpts({}),
    fn: help,
  },
}

function configure (args) {
  if (args.id) config.set('keyId', args.id)
  if (args.secret) config.set('secretKey', args.secret)
  if (args.mode) config.set('mode', args.mode)
  if (args['base-url']) config.set('baseUrl', args['base-url'])

  console.log('configured ' + Object.keys(args)
    .filter(key => key !== '_')
    .join(', ')
  )
}

function report () {
  console.log('`report` command not yet implemented :(')
}

function help (args) {
  const [command] = args._

  if (command) {
    if (!HELP_DETAILS[command]) {
      throw new Error(`'${command}' is not an alpaca command. See 'alpaca help'`)
    }
    console.log(HELP_DETAILS[command])
  } else {
    console.log(HELP)
  }
}

!async function () {
  try {
    const { command, argv } = commandLineCommands(validCommands)
    const action = cli[command] || cli.help

    const parsedArgs = parseArgs(argv, action.options)
    if (action.schema) assertSchema(parsedArgs, action.schema)
    await action.fn(parsedArgs)
  } catch (err) {
    console.error(err.message)
  }
}()


function assertSchema (value, schema) {
  const result = joi.validate(value, schema, {
    abortEarly: false,
  })
  if (result.error) {
    const message = result.error.details
      .map(detail => detail.message)
      .join('\n')
    throw new Error(message)
  }
  return result.value
}
