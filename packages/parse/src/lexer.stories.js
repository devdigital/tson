import React from 'react'
import { State, Store } from '@sambego/storybook-state'
import lexer from './lexer'
import styled from '@emotion/styled'

const TokenContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#eee',
  marginBottom: '0.5rem',
  marginRight: '0.2rem',
  padding: '0.2rem 0.8rem',
  borderRadius: '0.5rem',
})

const TokenType = styled.div({
  color: '#999',
  fontSize: '0.6rem',
})

const TokenValue = styled.div({
  margin: '0.2rem 0',
})

const toTokenType = type => {
  switch (type) {
    case 'string-quoted':
      return 'string (quoted)'
    case 'string-unquoted':
      return 'string (unquoted)'
    default:
      return type
  }
}

const toTokenValue = (type, value) => {
  switch (type) {
    case 'whitespace':
      return value.length
    default:
      return value
  }
}

const Token = ({ type, value }) => (
  <TokenContainer>
    <TokenType>{toTokenType(type)}</TokenType>
    <TokenValue>{toTokenValue(type, value)}</TokenValue>
  </TokenContainer>
)

const TokensContainer = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: '1rem',
})

const LexerTokens = ({ tokens }) => (
  <TokensContainer>
    {tokens.map((t, i) => (
      <Token key={i} type={t.type} value={t.value} />
    ))}
  </TokensContainer>
)

const LexerInput = styled.input({
  width: '500px',
})

const Lexer = ({ text, tokens, error, onChange }) => (
  <>
    <LexerInput
      type="text"
      value={text}
      onChange={e => onChange(e.target.value)}
    />
    {tokens && tokens.length > 0 && <LexerTokens tokens={tokens} />}
    {error && <p>There was an error: {error.message}</p>}
  </>
)

export default { title: 'Lexer' }

const store = new Store({
  text: '',
  tokens: [],
  error: null,
})

const getLexerTokens = text => {
  const tokens = []

  let position = 0
  while (position < text.length) {
    const token = lexer(text, position)
    tokens.push(token)
    position = token.position.end + 1
  }

  return tokens
}

export const withDefault = () => (
  <State store={store}>
    <Lexer
      text={store.get('text')}
      onChange={text => {
        if (!text) {
          store.set({ text: '', tokens: [] })
          return
        }

        try {
          const tokens = getLexerTokens(text)
          store.set({ text, tokens, error: null })
        } catch (error) {
          store.set({ text, tokens: [], error })
        }
      }}
      error={store.get('error')}
    />
  </State>
)
