(function() {
        const symbol = "BTC/USD";
        const exchangeName = "bitfinex";

		var Class =  class Main {
            constructor(logger, pairTraderFactory) {
                this.logger = logger;
                this.trader = pairTraderFactory
                    .use("exchangeName", exchangeName)
                    .use("symbol", symbol)
                    .use("currencyAvailable", 100000)//968)
                    .get();
            }

            execute() {
            //IExecutable
                // this.trader.watch(this.check);
                this.check(this.trader);
            }

            async check(trader) {
                // var price = await trader.getLastPrice();
                // console.log(price);
                // if(price > 12000)
                //     trader.buy(1);

                console.log(await trader.getPortfolio());
                // console.log(await trader.getFees());


                // await trader.sell(10);
                // await trader.close();
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
                await trader.sell(5);

                console.log(trader.totalVolume);
                // await trader.close();
            }
		};

        Class.$inject = ["logger", "pairTraderFactory"];
		module.exports = Class;
})();
