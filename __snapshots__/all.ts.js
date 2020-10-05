exports['globFromGit with ignore 1'] = []

exports['globFromGit glob relative paths with \'tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globFromGit glob relative paths with \'**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globFromGit glob relative paths with \'./tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globFromGit glob relative paths with \'abs tests/**/*.txt\' 1'] = [
  "tests/dir/exampleFile.txt",
  "tests/dir/subDir/example/file.txt",
  "tests/dir/subDir/file.txt"
]

exports['globFromGit with gitignore 1'] = []
