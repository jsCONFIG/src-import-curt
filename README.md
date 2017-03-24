src-import-curt
==========

[![srcImport](http://img.shields.io/npm/v/src-import-curt.svg)](https://www.npmjs.org/package/src-import-curt)
[![srcImport](http://img.shields.io/npm/dm/src-import-curt.svg)](https://www.npmjs.org/package/src-import-curt)

source combine for gulp

# example
## Normal
```
gulp.task('src-import', function () {
  gulp.src(['devFile.js'])
    .pipe(imports())
    .pipe(gulp.dest('./dest'));
});
```

devFile.js
```
imports('./test1.js');
var b = function () {
  console.log('Hello src-import');
};
```
or

devFile2.js
```
var test1 = imports('./test1.js');
var b = function () {
  console.log('Hello src-import');
};
```


# options

- opt.keyword

  default:`imports`

- opt.encoding
  
  default: 'utf-8'

- opt.smart

  default: `true`, Set `true` to let `var a = imports('./b');` available.

- opt.basedir

  `basedir` for combine.

# changelog V0.0.6

- Gather temporary handler for `smart`;