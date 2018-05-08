//using "mocha -w traderTest.js"

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Exchange = require('./../exchange/papertrade/exchange');
var Trader = require('./../trader');
// var Logger = {info: (s)=>{console.log(s);}, debug:(s)=> {console.log(s);}};
var Logger = {info: ()=>{}, debug:()=> {}};
Exchange = sinon.createStubInstance(Exchange);
Exchange.fetchTicker.returns({"last": 100});
Exchange.getFees.returns({"trading": {"maker": 0.001}});


var ExchangeBuilder = new (require("./../exchange/papertrade/exchangeBuilder"))(Logger, Exchange);
var Symbol = "BTC/USD";
var currencyAvailable = 1000;

// logger, exchangeBuilder, timer, calendarFactory, exchangeName, symbol, currencyAvailable


describe('Trader', function() {
  var trader = null;
  
  beforeEach(function() {
    trader = new Trader(Logger, ExchangeBuilder, null, null, null, Symbol,currencyAvailable);
  });

  it('should have currency available', async function() {    
    expect(trader.portfolio.currency).to.eq(currencyAvailable);
  });
  
  it('should buy', async function() {   
      expect((await trader.getPortfolio()).asset).to.eq(0);
      await trader.buy(10);
      expect((await trader.getPortfolio()).asset).to.at.above(0);
  });

  it('should close buy', async function() { 
    expect((await trader.getPortfolio()).asset).to.eq(0);
    await trader.buy(10);
    expect((await trader.getPortfolio()).asset).to.at.above(0);
    await trader.sell(trader.portfolio.asset);
    expect((await trader.getPortfolio()).asset).to.eq(0);
  });


});