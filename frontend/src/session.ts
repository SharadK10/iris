const LISTENER_ID_KEY = 'iris:listenerId'
const NICKNAME_KEY = 'iris:nickname'
const CONDUCTOR_PREFIX = 'iris:conductor:'

export function listenerId(): string {
  let id = localStorage.getItem(LISTENER_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(LISTENER_ID_KEY, id)
  }
  return id
}

export function getNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) ?? ''
}

export function setNickname(name: string): void {
  localStorage.setItem(NICKNAME_KEY, name.trim())
}

export function rememberConductor(code: string, conductorId: string): void {
  localStorage.setItem(CONDUCTOR_PREFIX + code, conductorId)
}

export function conductorIdFor(code: string): string | null {
  return localStorage.getItem(CONDUCTOR_PREFIX + code)
}
