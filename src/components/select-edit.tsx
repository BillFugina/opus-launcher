import React, { useState, useEffect, useCallback, useReducer, useRef, useMemo } from 'react'
import { EntityHook } from 'src/types/entityHook'
import {
  IControlChangeEventArgs,
  Input,
  IInputProps,
  Popup,
  Menu,
  IMenuItemOptions
} from '@inmotionnow/momentum-components-react'
import { IDSelectOption } from 'src/types/select-option'

interface IComponentOwnProps<TEntity> {
  debounce?: number
  getEntitiesHook: EntityHook<TEntity>
  getEntityRender: (item: TEntity) => JSX.Element
  getEntityText?: (item: TEntity) => string
  onChange?: (value: string) => void
  value?: string
}

type IComponentProps<TEntity> = IInputProps & IComponentOwnProps<TEntity>

interface InputState {
  focused: boolean
  touched: boolean
}

type InputAction = {
  type: 'focus' | 'blur' | 'type' | 'choose'
  payload?: any
}

const inputReducer = (state: InputState, action: InputAction): InputState => {
  switch (action.type) {
    case 'focus':
      return { ...state, focused: true, touched: false }
    case 'blur':
      return { ...state, focused: false }
    case 'type':
      if (!state.touched) {
        return { ...state, touched: true }
      } else {
        return state
      }
    case 'choose':
      return { ...state, touched: false }
  }
}

export const SelectEdit: React.SFC<IComponentProps<any>> = <TEntity extends any>(props: IComponentProps<TEntity>) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)

  const [value, setValue] = useState(props.value)
  const [inputState, dispatchInputEvent] = useReducer(inputReducer, { focused: false, touched: false })
  const entities = props.getEntitiesHook()

  const entityMenuItems: IMenuItemOptions[] = useMemo(() => {
    const result = entities.data.map(e => ({ content: props.getEntityRender(e) }))
    return result
  }, [entities, props.getEntityRender])

  const handleInputChange = useCallback((event: IControlChangeEventArgs) => {
    setValue(event.currentValue)
    if (props.onChange) {
      props.onChange(event.currentValue)
    }
  }, [])

  const handleInputFocus = useCallback(() => {
    dispatchInputEvent({ type: 'focus' })
  }, [])

  const handleInputBlur = useCallback(() => {
    dispatchInputEvent({ type: 'blur' })
  }, [])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    dispatchInputEvent({ type: 'type' })
  }, [])

  const handlePopoutClose = useCallback(() => {
    dispatchInputEvent({ type: 'choose' })
  }, [])

  useEffect(() => {
    entities.fetch(value)
  }, [value])

  const {
    debounce,
    getEntitiesHook,
    getEntityRender,
    getEntityText,
    onChange,
    value: propsValue,
    ...inputProps
  } = props

  const showPopup = value !== '' && inputState.focused && inputState.touched

  return (
    <>
      <Input
        {...{
          ...inputProps,
          value,
          handleChange: handleInputChange,
          debounce: props.debounce,
          onFocus: handleInputFocus,
          onBlur: handleInputBlur,
          onKeyDown: handleInputKeyDown,
          inputRef: inputEl
        }}
      />
      <Popup
        {...{
          show: showPopup,
          align: 'left',
          size: 'lg',
          target: inputEl.current || undefined,
          menuPanelRef,
          offset: -10,
          onOutsideClick: handlePopoutClose,
          onCloseClick: handlePopoutClose
        }}
      >
        <Menu
          {...{
            hasSelectableItems: true,
            items: entityMenuItems
          }}
        />
      </Popup>
    </>
  )
}

SelectEdit.defaultProps = {
  debounce: 750
}
