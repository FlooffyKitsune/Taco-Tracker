import { simpleHandle as authHandle } from './auth-simple'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = authHandle
