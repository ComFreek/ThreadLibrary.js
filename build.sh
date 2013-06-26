#!/bin/sh
tsc --out build/all.js src/Thread.ts src/ThreadGroup.ts
tsc --out build/Thread.js src/Thread.ts
tsc --out build/ThreadGroup.js src/ThreadGroup.ts