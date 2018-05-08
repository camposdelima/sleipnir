(function() {

    var Class = function factory(winston) {
        return new winston.Logger({
            transports: [
                new winston.transports.Console(
                    {
                        'timestamp':true
                        ,'level': 'debug'
                    }
                )
            ]
        });
    };

    Class.$inject = ["winston"];
    module.exports = Class;
})();
