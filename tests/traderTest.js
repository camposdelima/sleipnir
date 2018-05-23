//using "mocha -w traderTest.js"

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Exchange = require('./../exchange/papertrade/exchange');
var Trader = require('./../trader');
// var Logger = {info: (s)=>{console.log(s);}, debug:(s)=> {console.log(s);}};
var Logger = {info: ()=>{}, debug:()=> {}};
Exchange = sinon.createStubInstance(Exchange);
Exchange.fetchTicker.returns({"last": 1000});
Exchange.getFees.returns({"trading": {"maker": 0.001}});


var ExchangeBuilder = new (require("./../exchange/papertrade/exchangeBuilder"))(Logger, Exchange);
var Symbol = "BTC/USD";
var currencyAvailable = 10000;

// logger, exchangeBuilder, timer, calendarFactory, exchangeName, symbol, currencyAvailable


describe('Trader', function() {
  var trader = null;

  beforeEach(function() {
    trader = new Trader(Logger, ExchangeBuilder, null, null, null, Symbol,currencyAvailable);
  });

  it('should have clean portfolio', async function() {
    expect(trader.portfolio.currency).to.eq(currencyAvailable);
    expect(trader.portfolio.asset).to.eq(0);
    expect(trader.portfolio.custody).to.eq(0);
  });

  it('should buy', async function() {
      await trader.buy(10);
      expect((await trader.getPortfolio()).asset).to.eq(10);
      expect((await trader.getPortfolio()).currency).to.eq(-10);
  });

  it('should buy twice', async function() {
    await trader.buy(10);
    await trader.buy(7);
    expect((await trader.getPortfolio()).asset).to.eq(17);
    expect((await trader.getPortfolio()).currency).to.eq(-7017);
  });


  it('should close buy', async function() {
    await trader.buy(10);
    await trader.close();
    expect((await trader.getPortfolio()).asset).to.eq(0);
    expect((await trader.getPortfolio()).currency).to.eq(9980);
  });

  it('should sell', async function() {
      await trader.sell(10);
      expect((await trader.getPortfolio()).asset).to.eq(-10);
      expect((await trader.getPortfolio()).currency).to.eq(9990);
      expect((await trader.getPortfolio()).custody).to.eq(10000);
  });

  it('should close sell', async function() {
    await trader.sell(10);
    await trader.close();
    expect((await trader.getPortfolio()).asset).to.eq(0);
    expect((await trader.getPortfolio()).currency).to.eq(9980);
    expect((await trader.getPortfolio()).custody).to.eq(0);
  });

  it('should sell twice', async function() {
    await trader.sell(12);
    await trader.sell(6);
    expect((await trader.getPortfolio()).asset).to.eq(-18);
    expect((await trader.getPortfolio()).currency).to.eq(9982);
    expect((await trader.getPortfolio()).custody).to.eq(18000);
  });

  it('should buy and sell some', async function() {
    await trader.buy(10);
    await trader.sell(6);
    expect((await trader.getPortfolio()).asset).to.eq(4);
    expect((await trader.getPortfolio()).currency).to.eq(5984);
  });

  it('should sell and buy some', async function() {
    await trader.sell(10);
    await trader.buy(3);
    expect((await trader.getPortfolio()).asset).to.eq(-7);
    expect((await trader.getPortfolio()).currency).to.eq(9990);
    expect((await trader.getPortfolio()).custody).to.eq(6997);
  });

  it('should long and reverse to short', async function() {
    await trader.buy(10);
    await trader.sell(20);
    expect((await trader.getPortfolio()).asset).to.eq(-10);
    expect((await trader.getPortfolio()).currency).to.eq(9970);
    expect((await trader.getPortfolio()).custody).to.eq(10000);
  });

  it('should short and reverse to long', async function() {
    await trader.sell(10);
    await trader.buy(20);
    expect((await trader.getPortfolio()).asset).to.eq(10);
    expect((await trader.getPortfolio()).currency).to.eq(-30);
    expect((await trader.getPortfolio()).custody).to.eq(0);
  });


});
