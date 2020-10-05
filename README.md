# smart-glob

`smart-glob` is the only nodejs glob searcher that does not recurse inside every directory it finds

This is useful when you want to ignore certain folders from being scanned like `node_modules`

There is also a `globFromGit` that uses git cache to discover files in constant time, it takes on average 50ms on any code base

In [bump-version](https://github.com/remorses/bump-version) github action i reduced the glob search time form 50 seconds down to 13 seconds

```
npm i smart-glob
```

## usage

```js
import { glob, globFromGit } from 'smart-glob'

const files = await glob('**', {
    gitignore: true, // add the ignore from the .gitignore in current path
    filesOnly: true,
    ignore: ['node_modules'],
})

const paths = await globWithGit(path.resolve('./tests/**.ts'), {
    cwd: './someFolder',
    // ignore patterns in gitignore
    gitignore: true,
    // output paths are absolute paths
    absolute: true,
    // ignore certain directories
    ignoreGlobs: ['**/dir/**'],
})
```

## Benchmark

Here is a benchmark with other globs solutions run on this package folder ignoring the `node_modules` directory

You can find this benchmark in the `/tests` folder

```
benchmarks

tiny-glob: 157.726ms
    ✓ tiny-glob (158ms)
fast-glob: 8.392ms
    ✓ fast-glob
globby: 7.855ms
    ✓ globby
glob: 391.656ms
    ✓ glob (392ms)
smart-glob: 3.261ms
    ✓ smart-glob
```
