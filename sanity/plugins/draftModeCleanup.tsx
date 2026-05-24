'use client'

import { definePlugin, useCurrentUser } from 'sanity'
import { useEffect, useRef } from 'react'

function DraftModeCleanup() {
  const user = useCurrentUser()
  const hadUser = useRef(false)

  useEffect(() => {
    if (user) {
      hadUser.current = true
      return
    }

    if (!hadUser.current) return

    hadUser.current = false
    void fetch('/api/draft-mode/disable', { method: 'POST', credentials: 'include' })
  }, [user])

  return null
}

export const draftModeCleanupPlugin = definePlugin({
  name: 'draft-mode-cleanup',
  studio: {
    components: {
      layout: (props) => (
        <>
          <DraftModeCleanup />
          {props.renderDefault(props)}
        </>
      ),
    },
  },
})
