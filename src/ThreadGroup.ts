/// <reference path="Thread.ts" />

/**
 * Declares the class "ThreadGroup" for managing a group of "Thread" objects.
 * 
 * @license See LICENSE file.
 */
module TL {
    /**
     * Represents a group of multiple threads.
      */
    export class ThreadGroup {
        /**
         * The threads.
         */
        private threads: Thread[] = [];

        public add(thread: Thread);
        public add(threads: Thread[]);

        /**
         * Adds a new thread or multiple threads.
         * @param {object|Array} thread Either a Thread object or an array containing multiple ones.
         */
        public add(thread) {
            if (thread instanceof Array) {
                for (var i in thread) {
                    this.add(thread[i]);
                }
            }

            else if (thread instanceof Thread) {
                this.threads[thread.id] = thread;
            }
        }

        /**
         * Sends data to all threads.
         * @param {object} data Any data you want.
         * @param {function} callback  A callback function which gets passed to each Threads.send() function.
         */
        public send(data, callback?: (thread: Thread, returnVal: any) => any) {
            this.each(function (thread: Thread) {
                thread.send(data, function (returnVal) {
                    callback(thread, returnVal);
                });
            });
        }

        /**
         * Applies a function to all threads.
         * @param {function} callback A callback function accepting a Thread object.
         */
        public each(callback: (t: Thread) => any) {
            for (var i in this.threads) {
                callback(this.threads[i]);
            }
        }
    }
}