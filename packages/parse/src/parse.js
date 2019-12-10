import { isString } from '@utilz/types'
import { createMachine, interpret, assign } from '@xstate/fsm'

// const process = async (context, event) => {
//   console.log(context)
//   console.log(event)
// }

// const parseInternal = value => {
//   const parseMachine = createMachine({
//     id: 'parse',
//     initial: 'start',
//     context: {
//       text: value,
//       position: 0,
//       tokens: [],
//     },
//     strict: true,
//     states: {
//       start: {
//         invoke: {
//           id: 'process',
//           src: process,
//           onError: {
//             target: 'failure',
//             actions: assign({
//               error: (context, event) => {
//                 return 'foo'
//               },
//             }),
//           },
//         },
//         on: { WHITESPACE: 'awaitingPropertyName', TEXT: 'propertyName' },
//       },
//       awaitingPropertyName: { on: { TOGGLE: 'inactive' } },
//     },
//   })

//   const service = interpret(parseMachine)

// service.subscribe(state => {
//   switch (state) {
//     case 'start':
//       break
//   }

//   service.stop()
// })

//   service.start()
// }

const parseInternal = text => {
  
}

const parse = value => {
  if (value === undefined || value === null) {
    throw new Error('No value specified.')
  }

  if (!isString(value)) {
    throw new Error('The value specified must be a string.')
  }

  if (value.length === 0) {
    return {}
  }

  if (/^\s*$/.test(value)) {
    return {}
  }

  return parseInternal(value)
}

export default parse
