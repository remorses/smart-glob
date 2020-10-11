exports['globFromGit with ignore 1'] = []

exports['globFromGit with gitignore 1'] = []

exports['glob normal glob relative paths with \'./tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['glob normal glob relative paths with \'**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['glob normal glob relative paths with \'tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGit glob relative paths with \'./tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGit glob relative paths with \'**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGit glob relative paths with \'tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGit glob relative paths with \'absolute tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGitSync glob relative paths with \'./tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGitSync glob relative paths with \'**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGitSync glob relative paths with \'tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globWithGitSync glob relative paths with \'absolute tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['glob normal glob relative paths with \'absolute tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globSync normal sync glob relative paths with \'./tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globSync normal sync glob relative paths with \'**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globSync normal sync glob relative paths with \'tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globSync normal sync glob relative paths with \'absolute tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['glob non glob files globWithGit \'./tests/dir\' 1'] = []

exports['glob non glob files glob \'./tests/dir\' 1'] = []

exports['glob non glob files globWithGit \'./tests/dir/exampleFile.txt\' 1'] = [
  "tests/dir/exampleFile.txt"
]

exports['glob non glob files glob \'./tests/dir/exampleFile.txt\' 1'] = [
  "tests/dir/exampleFile.txt"
]

exports['globWithGit glob relative paths with \'tests/dir/subDir/**\' 1'] = [
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]
