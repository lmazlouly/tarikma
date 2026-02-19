import { useEffect, useMemo, useState } from 'react'
import {
  getIgnoredWarningKeys,
  ignoreWarning,
  subscribeIgnoredWarnings,
  unignoreWarning,
} from './ignoredWarningsStore'

export function useIgnoredWarningKeys() {
  const [keys, setKeys] = useState(() => getIgnoredWarningKeys())

  useEffect(() => {
    return subscribeIgnoredWarnings(() => setKeys(getIgnoredWarningKeys()))
  }, [])

  const actions = useMemo(
    () => ({
      ignore: (key: string) => ignoreWarning(key),
      unignore: (key: string) => unignoreWarning(key),
    }),
    [],
  )

  return { keys, ...actions }
}
