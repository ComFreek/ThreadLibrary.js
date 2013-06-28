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
                'var send = function (data) { this.postMessage({data: data}); };',
                'this.addEventListener("message", function(evt) {',
                    'var ret = (' + rawFuncCode + ').call(evt.target, evt.data);',
                    'this.postMessage({data: ret, finished: true});',
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
                $this.destroy();
                $this.status = ThreadStatus.ERROR;
                throw new ThreadError("Thread terminated with error \"" + evt.message + "\"");
            }, false);
        }

        /**
         * Sends data to the thread's function.
         * @param {object} data Any data you want.
         * @param {function} prgCallback A callback function whichs gets passed the returned value from the thread (as its first argument).
         *                               This function will also get passed a boolean indicating whether the function has finished or is still executing, as second argument if you don't pass an end callback.
         * @param {function} endCallback An optional callback function which gets called when the thread's function returns.
         */
        public send(data: any, prgCallback: (ret: any, finished?: boolean) => any, endCallback?: (ret: any) => any) {
            if (this.status != ThreadStatus.RUNNING) {
                return false;
            }

            var $thread = this;
            var worker = this.worker;

            if (typeof prgCallback == "function") {
                var wrapperCallback = function (evt) {
                    if (evt.data["finished"]) {
                        if (endCallback) {
                            endCallback.call($thread, evt.data.data);
                        }
                        else {
                            prgCallback.call($thread, evt.data.data, true);
                        }
                        worker.removeEventListener("message", wrapperCallback, false);
                    }
                    else {
                        prgCallback.call($thread, evt.data.data, false);
                    }
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
            this.status = ThreadStatus.TERMINATED;

            return true;
        }

        public destroy() {
            this.kill();

            if (this.url !== null) {
                (<any> window).URL.revokeObjectURL(this.url);
                this.url = null;
            }

            this.status = ThreadStatus.TERMINATED;
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

window["TL"] = TL;