//using "mocha -w performanceAnalyzerTest.js"

var chai = require('chai');
var sinon = require('sinon');
var expect = chai.expect; // we are using the "expect" style of Chai
var Exchange = require('./../exchange/papertrade/exchange');
var Trader = require('./../trader');
var PerformanceAnalyzer = require('./../performanceAnalyzer');
// var Logger = {info: (s)=>{console.log(s);}, debug:(s)=> {console.log(s);}};
var Logger = {info: ()=>{}, debug:()=> {}};
Exchange = sinon.createStubInstance(Exchange);
Exchange.fetchTicker.returns({"last": 1000});
Exchange.getFees.returns({"trading": {"maker": 0.001}});


var ExchangeBuilder = new (require("./../exchange/papertrade/exchangeBuilder"))(Logger, Exchange);
var Symbol = "BTC/USD";
var currencyAvailable = 10000;
var trader = new Trader(Logger, ExchangeBuilder, null, null, null, Symbol,currencyAvailable);

// logger, exchangeBuilder, timer, calendarFactory, exchangeName, symbol, currencyAvailable


describe('PerformanceAnalyzer', function() {
  var performanceAnalyzer = null;

  beforeEach(function() {
    performanceAnalyzer = new PerformanceAnalyzer(Logger, trader);
  });

  it('should know how total value of portfolio.', async function() {
    expect(performanceAnalyzer.getSummary().).to.notNull();
  });
});
