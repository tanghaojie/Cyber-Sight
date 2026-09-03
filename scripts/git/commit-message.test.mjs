import assert from 'node:assert/strict'
import test from 'node:test'
import { commitTypes, validateCommitMessage } from './commit-message.mjs'

test('accepts every allowed commit type with an optional scope and breaking marker', () => {
  for (const type of commitTypes) {
    assert.equal(
      validateCommitMessage(`${type}(sync)!: classify new records\n\nBody remains optional.`),
      `${type}(sync)!: classify new records`,
    )
  }
})

test('rejects an unknown type, an empty summary, and the default merge title', () => {
  for (const message of ['merge: combine branches', 'feat:', 'Merge branch master']) {
    assert.throws(() => validateCommitMessage(message), /Invalid commit title/)
  }
})
