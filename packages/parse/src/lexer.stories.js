import React from 'react'
import { State, Store } from '@sambego/storybook-state'
import lexer from './lexer'

const Lexer = ({ value, onChange }) => {
  let result = null
  try {
    console.log('value', value)
    result = value ? lexer(value, 0) : null
  } catch (error) {
    result = error.message
  }

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <p>{JSON.stringify(result)}</p>
    </>
  )
}

export default { title: 'Lexer' }

const store = new Store({
  value: '',
})

export const withDefault = () => (
  <State store={store}>
    <Lexer
      value={store.get('value')}
      onChange={text => store.set({ value: text })}
    />
  </State>
)
