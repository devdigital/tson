import React from 'react'
import { State, Store } from '@sambego/storybook-state'
import lexer from './lexer'

const Lexer = ({ text, results, error, onChange }) => {
  return (
    <>
      <input
        type="text"
        value={text}
        onChange={e => onChange(e.target.value)}
      />
      {results && results.length > 0 && <p>{JSON.stringify(results)}</p>}
      {error && <p>There was an error: {error.message}</p>}
    </>
  )
}

export default { title: 'Lexer' }

const store = new Store({
  text: '',
  results: [],
  error: null,
})

const getLexerResults = text => {
  const results = []

  let position = 0
  while (position < text.length) {
    const result = lexer(text, position)
    results.push(result)
    position = result.position.end + 1
  }

  return results
}

export const withDefault = () => (
  <State store={store}>
    <Lexer
      text={store.get('text')}
      onChange={text => {
        if (!text) {
          store.set({ text: '', results: [] })
          return
        }

        try {
          const results = getLexerResults(text)
          store.set({ text, results, error: null })
        } catch (error) {
          store.set({ text, results: [], error })
        }
      }}
      error={store.get('error')}
    />
  </State>
)
