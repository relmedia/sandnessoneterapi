'use client'

import { TrashIcon } from '@sanity/icons'
import { useState } from 'react'
import { useDocumentOperation, type DocumentActionComponent } from 'sanity'

export const DeleteBookingAction: DocumentActionComponent = (props) => {
  const { delete: deleteOp } = useDocumentOperation(props.id, props.type)
  const [dialogOpen, setDialogOpen] = useState(false)

  return {
    label: 'Slett timebestilling',
    icon: TrashIcon,
    tone: 'critical',
    disabled: Boolean(deleteOp.disabled),
    onHandle: () => setDialogOpen(true),
    dialog:
      dialogOpen &&
      ({
        type: 'confirm',
        tone: 'critical',
        message:
          'Er du sikker på at du vil slette denne timebestillingen? Tidsrommet blir ledig igjen på nettsiden.',
        onConfirm: () => {
          deleteOp.execute()
          props.onComplete()
          setDialogOpen(false)
        },
        onCancel: () => setDialogOpen(false),
      } as const),
  }
}

DeleteBookingAction.action = 'delete'
