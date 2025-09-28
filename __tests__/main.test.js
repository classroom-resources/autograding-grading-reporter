const process = require('process')
const cp = require('child_process')
const path = require('path')

const node = process.execPath
const ip = path.join(__dirname, '..', 'src', 'main.js')
const options = {
  env: process.env,
  encoding: 'utf-8',
}

const {parseRunnerResults} = require('../src/main')

test('test runs', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = 'result1'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  expect(stdout).toContain(`✅ Test 1`)
})

test('test fails', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "fail", "message": "Test failed with non-zero exit code." }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = 'result1'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  expect(stdout).toContain(`❌ Test 1`)
})

test('test errors out', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "error", "message": "Test failed to execute." }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = 'result1'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  expect(stdout).toContain(`Error: Test failed to execute.`)
})

test('fails to run if input not in the right format', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.RESULT2_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 2", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = '[result1,result2]'

  const child = cp.spawnSync(node, [ip], options)
  const stderr = child.stderr.toString()
  expect(stderr).toContain(`The runners input must be a comma-separated list of strings.`)
})

test('test runs with multiple runners', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.RESULT2_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 2", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = 'result1,result2'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  console.log(stdout)
  expect(stdout).toContain('✅')
})

test('test runs with multiple runners with comma and newline', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.RESULT2_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 2", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = 'result1,\nresult2'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  console.log(stdout)
  expect(stdout).toContain('✅')
})
test('test runs with multiple runners with comma and space', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.RESULT2_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 2", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = ' result1, result2 '

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  console.log(stdout)
  expect(stdout).toContain('✅')
})
test('test runs with multiple runners with random whitespace', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.RESULT2_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 2", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = '\n\tresult1 \nresult2 \n'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  console.log(stdout)
  expect(stdout).toContain('✅')
})
test('test fails with multiple runners', () => {
  process.env.RESULT1_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 1", "status": "fail", "message": null }] }',
  ).toString('base64')
  process.env.RESULT2_RESULTS = Buffer.from(
    '{ "tests": [{ "name": "Test 2", "status": "pass", "message": null }] }',
  ).toString('base64')
  process.env.INPUT_RUNNERS = 'result1,result2'

  const child = cp.spawnSync(node, [ip], options)
  const stdout = child.stdout.toString()
  console.log(stdout)
  expect(stdout).toContain('❌')
})

test('test autograding-output.parseRunnerResults', function () {
  process.env.INPUT_RUNNERS = 'result1,result2'

  const testResults1 = parseRunnerResults(process.env.INPUT_RUNNERS)
  expect(testResults1.length).toBe(2)
  expect(testResults1[0].runner).toBe('result1')
  expect(testResults1[1].runner).toBe('result2')

  process.env.INPUT_RUNNERS = '[result1,result2]'
  expect(() => parseRunnerResults(process.env.INPUT_RUNNERS)).toThrow(
    'The runners input must be a comma-separated list of strings.',
  )
})
