import { noop } from 'lodash'

export default {
  log: process.env.NODE_ENV === 'test' ? noop : console.log,
  info: process.env.NODE_ENV === 'testa' ? noop : console.info,
  error: process.env.NODE_ENV === 'test' ? noop : console.error
}
