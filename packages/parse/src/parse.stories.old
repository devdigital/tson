import React from 'react'
import { State, Store } from '@sambego/storybook-state'
import parse from './parse'
import styled from '@emotion/styled'
import ReactJson from 'react-json-view'

const ObjectContainer = styled.div({
  marginTop: '1rem',
})

const Obj = ({ object }) => (
  <ObjectContainer>
    <ReactJson src={object} />
  </ObjectContainer>
)

const ParserInput = styled.input({
  width: '500px',
})

const Parser = ({ text, obj, error, onChange }) => (
  <>
    <ParserInput
      type="text"
      value={text}
      onChange={e => onChange(e.target.value)}
    />
    {obj && <Obj object={obj} />}
    {error && <p>There was an error: {error.message}</p>}
  </>
)

export default { title: 'Parser' }

const store = new Store({
  text: '',
  obj: null,
  error: null,
})

export const withDefault = () => (
  <State store={store}>
    <Parser
      text={store.get('text')}
      onChange={text => {
        if (!text) {
          store.set({ text: '', obj: null })
          return
        }

        try {
          const obj = parse(text)
          store.set({ text, obj, error: null })
        } catch (error) {
          store.set({ text, obj: null, error })
        }
      }}
      error={store.get('error')}
    />
  </State>
)
