ThreadLibrary.js
================

Library for creating simple threads (web workers) directly out of JavaScript functions without external files.

## Quick sample
```
<script src="build/all.js"></script>

<script>
  var squareThread = new TL.Thread(function (number) {
    return number * number;
  });
  
  squareThread.send(5, function (result) {
    alert(result); // will alert "25"
  });
</script>
```

How to build
=============
1. Install [TypeScript](http://www.typescriptlang.org/) if you haven't already:
```
npm install -g typescript
```
<br />
You can also use the Visual Studio 2012 plugin from [Microsoft Download Center](http://www.microsoft.com/en-us/download/details.aspx?id=34790)

2. Execute `build/build.ps1` (on Windows) or `build/build.sh` (\*nix)

3. Try out the samples and enjoy.


Author
========
[@comfreek](http://twitter.com/comfreek)

Credits
========
I got the idea from [MeiKatz](https://github.com/MeiKatz) and his similar project: [JavaScript-Thread](https://github.com/MeiKatz/javascript-thread).
