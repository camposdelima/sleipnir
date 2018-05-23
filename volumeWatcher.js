(function() {
        const exchangeName = 'bitfinex';
        const symbol ='BTC/USD';
        const delay = 5000;

		var Class =  class VolumeWatcher {            
            constructor(logger, exchangeBuilder, timer, calendarFactory) {
                this.logger = logger;   
                this.exchange =  exchangeBuilder.build(exchangeName);
                this.timer = timer;
                this.calendarFactory = calendarFactory;
            }

            //IExecutable
            execute() {
                this.timer.scheduleLoop(delay, () => this.watch());
                // this.watch();
            }

            async watch() {
                var warmup = 25;
                
                //console.log(ticker);
                var since = this.calendarFactory.get().subtract(warmup, 'minutes').valueOf();
                var minutes = await this.exchange.fetchOHLCV (symbol, '1m', since, warmup);
                var ticker = await this.exchange.fetchTicker(symbol); 
                // var thirtyMinute = await this.exchange.fetchOHLCV        (symbol, '30m');
                
                // console.log(minutes);

                // var times = minutes.map(minute => this.calendarFactory.get(minute[0]));
                // console.log(times);

                var volumes = minutes.map(minute => minute[5]);
                var lastVolume = volumes[volumes.length-1];
                var avgVolume = (volumes.reduce((p, s) => p+s))/volumes.length;
                console.log({"lastVolume": lastVolume, "avgVolume": avgVolume});

                var prices = minutes.map(minute => minute[4]);

                //console.log(prices);

                var lastPrice = prices[prices.length-1];
                var avgPrice = (prices.reduce((p, s) => p+s))/prices.length;
                console.log({"lastPrice": lastPrice, "avgPrice": avgPrice});

                this.logger.debug({'price': ticker.last});

            }
		};  
  
        Class.$inject = ["logger", "exchangeBuilder", "timer", "calendarFactory"];
		module.exports = Class;
})();
