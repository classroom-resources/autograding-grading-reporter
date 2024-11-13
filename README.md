## GitHub Classroom Autograding Reporter

### Overview
**GitHub Classroom Autograding Reporter** is a plugin for GitHub Classroom's Autograder. Use it to report the results of the test execution to students and GitHub Classroom.

### Key Features
- **Automatic Grading**: Test student code submissions and provide immediate feedback.
- **Customizable Test Setup**: Define pre-test setup commands and specific testing commands.
- **Flexible Output Comparison**: Supports multiple methods to compare the stdout output.
- **Timeout Control**: Limit the runtime of tests to prevent excessive resource usage.

### Environment Variables

| Env Name | Description | Required |
|----------|-------------|----------|
| [RUNNER-ID]_RESULTS | The name is equal to the ID of the runner in all capitals followed by `_RESULTS` and the value is the result output from the runner. | Yes |

### Inputs

| Input Name | Description | Required |
|------------|-------------|----------|
| `runners` | A comma separated list of runner ids from previous steps  | Yes |

### Usage

1. Add the GitHub Classroom Reporter to your workflow.

```yaml
name: Autograding Tests
on:
  - push
  - workflow_dispatch
permissions:
  actions: read
  contents: read
jobs:
  autograding:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Shout Test
        id: shout-test
        uses: classroom-resources/autograding-io-grader@v1
        with:
          test-name: Shout Test
          command: "./test/bin/shout.sh"
          input: hello
          expected-output: HELLO
          comparison-method: exact
          timeout: 10
          max-score: 10
      - name: A command test
        id: a-command-test
        uses: classroom-resources/autograding-command-grader@v1
        with:
          test-name: A command test
          setup-command: bundle install
          command: rspec hello_spec.rb
          timeout: 10
          max-score: 20
      - name: Python test
        id: python-test
        uses: classroom-resources/autograding-python-grader@v1
      - name: Python test with score
        id: python-test-with-score
        uses: classroom-resources/autograding-python-grader@v1
        with:
          max-score: 30
      - name: Autograding Reporter
        uses: ./
        env:
          SHOUT-TEST_RESULTS: "${{steps.shout-test.outputs.result}}"
          A-COMMAND-TEST_RESULTS: "${{steps.a-command-test.outputs.result}}"
          PYTHON-TEST_RESULTS: "${{steps.python-test.outputs.result}}"
          PYTHON-TEST-WITH-SCORE_RESULTS: "${{steps.python-test-with-score.outputs.result}}"
        with:
          runners: shout-test,a-command-test,python-test,python-test-with-score
```

### Example Output
```
🔄 Processing: shout-test
✅ Shout Test
Test code:
./test/bin/shout.sh <stdin>hello

Total points for shout-test: 10.00/10

🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🔄 Processing: a-command-test
✅ A command test
Test code:
rspec hello_spec.rb

Total points for a-command-test: 20.00/20

🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🔄 Processing: python-test
✅ test sample - line 4
Test code:
collection = [1, 2, 3, 4, 5]
assert sample_from_collection(collection) in collection

🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀

🔄 Processing: python-test-with-score
✅ test sample - line 4
Test code:
collection = [1, 2, 3, 4, 5]
assert sample_from_collection(collection) in collection

Total points for python-test-with-score: 30.00/30

Test runner summary
┌────────────────────┬─────────────┬─────────────┐
│ Test Runner Name   │ Test Score  │ Max Score   │
├────────────────────┼─────────────┼─────────────┤
│ shout-test         │ 10          │ 10          │
├────────────────────┼─────────────┼─────────────┤
│ a-command-test     │ 20          │ 20          │
├────────────────────┼─────────────┼─────────────┤
│ python-test        │ 0           │ 0           │
├────────────────────┼─────────────┼─────────────┤
│ python-test-with-… │ 30          │ 30          │
├────────────────────┼─────────────┼─────────────┤
│ Total:             │ 60          │ 60          │
└────────────────────┴─────────────┴─────────────┘
🏆 Grand total tests passed: 4/4
```

