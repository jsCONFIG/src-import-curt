src-import-curt
==========

[![srcImport](http://img.shields.io/npm/v/src-import-curt.svg)](https://www.npmjs.org/package/src-import-curt)
[![srcImport](http://img.shields.io/npm/dm/src-import-curt.svg)](https://www.npmjs.org/package/src-import-curt)

Roughly merge files for gulp.

# Install
```
npm install src-import-curt
```

# Example

```
var imports = require('src-import-curt');
var gulpRename = require('gulp-rename');
gulp.task('src-import', function () {
  gulp.src(['devFile.js'])
    .pipe(imports())
    .pipe(gulpRename('bundle.js'))
    .pipe(gulp.dest('./dest'));
});
```

devFile.js

```
imports('./test1.js')
var b = function () {
  console.log('Hello src-import');
};
```

test1.js

```
var test1 = function () {
    console.log('Hello test1');
    imports('./part.js')
};
```

part.js

```
console.log('code from part.js');
```

and `bundle.js` will be:

```
var test1 = function () {
    console.log('Hello test1');
    console.log('code from part.js');
};
var b = function () {
  console.log('Hello src-import');
};
```


# options

- opt.keyword

  default:`imports`

- opt.basedir

  `basedir` for combine.

# ChangeLog V0.0.4

* Fix code resolve error;