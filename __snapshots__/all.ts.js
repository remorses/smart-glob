exports['globFromGit with ignore 1'] = []

exports['globFromGit glob with \'./tests/**/*.txt\' 1'] = [
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/exampleFile.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/example/file.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/file.txt"
]

exports['globFromGit glob with \'tests/**/*.txt\' 1'] = [
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/exampleFile.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/example/file.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/file.txt"
]

exports['globFromGit glob with \'**/*.txt\' 1'] = [
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/exampleFile.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/example/file.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/file.txt"
]

exports['globFromGit glob with \'/Users/morse/Documents/GitHub/smartglob/tests/**/*.txt\' 1'] = [
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/exampleFile.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/example/file.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/file.txt"
]

exports['globFromGit glob relative paths with \'./tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globFromGit glob relative paths with \'**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globFromGit glob relative paths with \'tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globFromGit glob relative paths with \'/Users/morse/Documents/GitHub/smartglob/tests/**/*.txt\' 1'] = [
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/exampleFile.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/example/file.txt",
  "/Users/morse/Documents/GitHub/smartglob/tests/dir/subDir/file.txt"
]
