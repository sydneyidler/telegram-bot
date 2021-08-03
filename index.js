require("dotenv").config();

const axios = require("axios");
const db = require("./db");
const { Composer } = require('micro-bot')
const QuickChart = require("quickchart-js");

const bot = new Composer()

const commands = {
  list: ["list", "lst"],
  exchange: "exchange",
  history: "history",
};

bot.command(commands.list, async (ctx) => {
  const URL = `http://apilayer.net/api/live?access_key=${process.env.EXCHANGE_RATE_API_KEY}&source=USD`;

  let { timestamp, quotes } = await db.currencies.getCurrencies();
  const differenceInTime =
    (new Date() - new Date(timestamp)) / 1000 / 60;
  let isTimePassed = differenceInTime > 10;

  console.log(differenceInTime)
  if (isTimePassed) {
    const response = await axios.get(URL);
    quotes = response.data.quotes;
    db.currencies.updateCurrencies(quotes, Date.now());
  }

  let table = "";
  let row = "";

  for (const currency in quotes) {
    row = currency.slice(-3) + ": " + quotes[currency].toFixed(2) + "\n";
    table += row;
  }

  ctx.replyWithHTML("<pre>" + table + "</pre>");
});

bot.command(commands.exchange, async (ctx) => {
  const { text } = ctx.message;

  const amount = text.match(/\d+/)[0];
  const [firstCurrency, secondCurrency] = text.match(/[A-Z]+/g);

  const URL = `http://apilayer.net/api/live?access_key=${process.env.EXCHANGE_RATE_API_KEY}&source=USD&currencies=${firstCurrency},${secondCurrency}`;
  const response = await axios.get(URL);

  if (!response.data.success) {
    ctx.reply("Error");
    return;
  }

  const result =
    (response.data.quotes["USD" + secondCurrency] /
      response.data.quotes["USD" + firstCurrency]) *
    amount;

  ctx.reply(result.toFixed(2));
});

bot.command(commands.history, async (ctx) => {
  const myChart = new QuickChart();
  myChart.setConfig({
    type: "bar",
    data: {
      labels: ["01.08", "02.08"],
      datasets: [{ label: "CAD", data: [5, 7] }],
    },
  });

  ctx.replyWithPhoto(myChart.getUrl());
});

module.exports = bot;
