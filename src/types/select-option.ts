import { ISelectOption } from '@inmotionnow/momentum-components-react'
import { IEntityID } from 'src/types/entity-id'

export type IDSelectOption = ISelectOption & {
  id: IEntityID
}

export const EmptyIDSelectOption: IDSelectOption = {
  id: '',
  value: -1,
  displayText: ''
}
