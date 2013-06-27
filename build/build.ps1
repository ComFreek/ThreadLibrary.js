tsc --out out/all.js ../src/Thread.ts ../src/ThreadGroup.ts
tsc --out out/Thread.js ../src/Thread.ts
tsc --out out/ThreadGroup.js ../src/ThreadGroup.ts

java -jar ClosureCompiler/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js out/all.js --js_output_file out/all.min.js