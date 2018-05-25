(function() {
        const symbol = "BTC/USD";
        const exchangeName = "bitfinex";

		var Class =  class Main {
            constructor(logger, pairTraderFactory, performanceAnalyzerFactory) {
                this.logger = logger;
                this.trader = pairTraderFactory
                    .use("exchangeName", exchangeName)
                    .use("symbol", symbol)
                    .use("currencyAvailable", 100000)//968)
                    .get();

                this.performanceAnalyzer = performanceAnalyzerFactory
                    .use("trader", this.trader)
                    .get();
            }

            execute() {
            //IExecutable
                // this.trader.watch(this.check);
                this.check(this.trader);
            }

            async check(trader) {
                await trader.buy(10);
                await trader.buy(5);
                await trader.sell(5);
                await trader.sell(20);
                await trader.buy(10);
                await trader.sell(10);
                // await trader.close();
                await trader.buy(5);
                await trader.buy(10);
                await trader.sell(10);
                await trader.buy(5);
                await trader.sell(5);
                await trader.sell(7);

                this.logger.info(await this.performanceAnalyzer.getEvaluation());
                // await trader.close();
            }
		};

        Class.$inject = ["logger", "pairTraderFactory", "performanceAnalyzerFactory"];
		module.exports = Class;
})();
