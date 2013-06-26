/**
 * "Thread Libary" for JavaScript.
 *
 * Credits to MeiKatz <https://github.com/MeiKatz> for this great idea and the previous code base.
 * This is a (almost complete) rewrite in TypeScript.
 */
module TL {
    export class ThreadError {
        private msg: string;

        constructor(msg: string) {
            this.msg = msg;
        }

        public toString() {
            return "ThreadError: " + this.msg;
        }
    }

    export enum ThreadStatus {
        UNINITIALIZED,
        CREATED,
        RUNNING,
        TERMINATED,

        ERROR
    }

    export class Thread {
        /**
         * Counter for already created threads. Will be incremented on each Thread's construction.
         */
        private static lastThreadId = -1;
        
        private id: number;
        private status: ThreadStatus = ThreadStatus.UNINITIALIZED;
        private url;
        private worker: Worker;

        /**
         * @param {function} func Pass a function if you want to directly initialize and run the thread.
         */
        constructor(func?: () => any) {
            if (typeof func == "function") {
                this.setFunction(func);
                this.run();
            }

            Thread.lastThreadId++;
            this.id = Thread.lastThreadId;
        }

        /**
         * Sets the thread's function.
         * @param {function} func The function.
         */
        public setFunction(func: () => any) {
            if (typeof func != "function") {
                throw new ThreadError("The supplied argument is not a function");
            }

            var rawFuncCode = func.toString();
            var funcBody = func.toString().substring(rawFuncCode.indexOf("{") + 1, rawFuncCode.lastIndexOf("}"));

            var code = [
                'this.addEventListener("message", function(evt) {',
                    'var ret = (' + rawFuncCode + ').call(evt.target, evt.data);',
                    'this.postMessage(ret);',
                '}, false);'
            ].join("");

            if (this.url) {
                (<any> window).URL.revokeObjectURL(this.url);
            }
            this.url = (<any> window).URL.createObjectURL(new Blob([code], { "type": "application/javascript" }));
            this.status = ThreadStatus.CREATED;
        }

        public run() {
            this.worker = new Worker(this.url);
            this.status = ThreadStatus.RUNNING;

            var $this = this;
            this.worker.addEventListener("error", function (evt: any) {
                $this.kill();
                $this.status = ThreadStatus.ERROR;
                throw new ThreadError("Thread terminated with error \"" + evt.message + "\"");
            }, false);
        }

        /**
         * Sends data to the thread's function.
         * @param {object} data Any data you want.
         * @param {function} callback A callback function whichs gets passed the returned value from the thread (as its first argument).
         */
        public send(data: any, callback: (ret: any) => any) {
            if (this.status != ThreadStatus.RUNNING) {
                return false;
            }

            var thread = this;
            var worker = this.worker;

            if (typeof callback == "function") {
                var wrapperCallback = function (evt) {
                    callback.call(thread, evt.data);
                    worker.removeEventListener("message", wrapperCallback, false);
                };
                worker.addEventListener("message", wrapperCallback, false);
            }

            worker.postMessage(data);
        }

        public kill() {
            if (this.status != ThreadStatus.RUNNING) {
                return false;
            }

            this.worker.terminate();
            (<any> window).URL.revokeObjectURL(this.url);
            this.status = ThreadStatus.TERMINATED;

            return true;
        }

        public getStatus() {
            return this.status;
        }

        public getId() {
            return this.id;
        }
    }

    /**
     * Evaluates whether the needed implementations for this library are supported.
     */
    export var isSupported = !!(
        (<any> window).URL &&
        (<any> window).URL.createObjectURL &&
        (<any> window).URL.revokeObjectURL &&
        (<any> window).Blob &&
        (<any> window).URL &&
        (<any> window).Worker
    );
}