import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  fetchAuthSession,
  getCurrentUser,
} from 'aws-amplify/auth'
import type { LoginCredentials } from '../types/auth'

export interface SignUpCredentials {
  email: string
  password: string
}

export async function loginRequest({ email, password }: LoginCredentials): Promise<string> {
  const result = await signIn({
    username: email,
    password,
  })

  if (result.nextStep?.signInStep && result.nextStep.signInStep !== 'DONE') {
    throw new Error(`Authentication step not completed: ${result.nextStep.signInStep}`)
  }

  const session = await fetchAuthSession()
  const idToken = session.tokens?.idToken?.toString()

  if (!idToken) {
    throw new Error('No ID token returned by Cognito')
  }

  return idToken
}

export async function signUpRequest({ email, password }: SignUpCredentials) {
  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
      },
    },
  })

  return result
}

export async function confirmSignUpRequest(email: string, code: string) {
  return await confirmSignUp({
    username: email,
    confirmationCode: code,
  })
}

export async function resendConfirmationCodeRequest(email: string) {
  return await resendSignUpCode({
    username: email,
  })
}

export async function logoutRequest(): Promise<void> {
  await signOut()
}

export async function getCurrentIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() ?? null
  } catch {
    return null
  }
}

export async function getAmplifyCurrentUser() {
  try {
    return await getCurrentUser()
  } catch {
    return null
  }
}