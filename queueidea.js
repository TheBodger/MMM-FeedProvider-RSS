
exports.queue = function (queuename) {

    this.queue = [];
    this.queue_started = false;
    this.queue_busy = false;
    this.queuename = queuename;

    this.addtoqueue = function(aprocess) {

        this.queue.push(aprocess); // add to end of array

    }

    this.endqueue = function () {
        this.queue = [];
        this.queue_busy = false;
        this.queue_started = false;
        clearInterval(self.processor);
    }

    this.startqueue = function (interval) {

        var self = this;

        if (this.queue_started) { return; } //queue allready running so we ignore it

        this.queue_started = true;

        this.processor = setInterval(function () {

            if (self.queue.length > 0) {
                if (!self.queue_busy) {
                    self.queue_busy = true;
                    self.queue.shift()(); // get the start of the array (fifo)
                }
            }
            else {
                self.queue_started = false;
                clearInterval(self.processor);
            }
            
        }, interval);

    }

    this.processended = function () {
        this.queue_busy = false;
    }

}

