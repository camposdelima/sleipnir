(function() {
    var Class = class Timer {            
        constructor(logger) {
            this.logger = logger;
        }
        
        async delay(duration) {
            this.logger.silly("waiting "+duration+" milliseconds.");
            return await new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, duration);
            });
        }

        async scheduleLoop(interval, task) {
            await task();
            await this.delay(interval);
            this.scheduleLoop(interval, task);
        }


    };

    Class.$inject = ["logger"];
    module.exports = Class;
})();