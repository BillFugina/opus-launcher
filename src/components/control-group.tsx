import * as React from 'react'
import { IControlGroupProps, ControlGroup } from '@inmotionnow/momentum-components-react'
import { Omit } from 'src/typescript-next'

type IHasId = {
  id: string
}

type IControlGroupWithChildrenProps = Omit<IControlGroupProps, 'control' | 'htmlFor'> & {
  children: React.ReactElement<IHasId>
  id: string
}

const ControlGroupWithChildren: React.SFC<IControlGroupWithChildrenProps> = (props: IControlGroupWithChildrenProps) => {
  const { children, id, ...rest } = props
  const childId = `${id}-child`

  const childrenWithProps = React.cloneElement(children, { id: childId })

  return <ControlGroup {...{ ...rest, control: childrenWithProps, htmlFor: childId }} />
}

export { ControlGroupWithChildren as ControlGroup2 }
