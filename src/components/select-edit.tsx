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
  getEntityText: (item: TEntity) => string
  onChange?: (value: string) => void
  value?: string
}

type IComponentProps<TEntity> = IInputProps & IComponentOwnProps<TEntity>

interface InputState {
  focused: boolean
  touched: boolean
}

type InputAction = {
  type: 'focus' | 'blur' | 'type' | 'choose' | 'cancel'
  payload?: any
}

enum FocusDirection {
  up = -1,
  none = 0,
  down = 1
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
    case 'cancel':
      return { ...state, touched: false }
  }
}

export const SelectEdit: React.SFC<IComponentProps<any>> = <TEntity extends any>(props: IComponentProps<TEntity>) => {
  // references
  const inputEl = useRef<HTMLInputElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)

  // state
  const [value, setValue] = useState(props.value)
  const [inputState, dispatchInputEvent] = useReducer(inputReducer, { focused: false, touched: false })
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [focusDirection, setFocusDirection] = useState<FocusDirection>(FocusDirection.none)
  const entities = props.getEntitiesHook()

  // callbacks
  const handleInputChange = useCallback((event: IControlChangeEventArgs) => {
    setValue(event.currentValue)
  }, [])

  const handleInputFocus = useCallback(() => {
    dispatchInputEvent({ type: 'focus' })
  }, [])

  const handleInputBlur = useCallback(() => {
    dispatchInputEvent({ type: 'blur' })
  }, [])

  const handleEntityClick = useCallback(
    (entity: TEntity) => (event: React.MouseEvent) => {
      dispatchInputEvent({ type: 'choose', payload: entity })
      const newText = props.getEntityText(entity)
      if (newText !== '') {
        setValue(newText)
      }
    },
    []
  )

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const { key } = e
      switch (key) {
        case 'ArrowUp':
        case 'ArrowDown':
          if (entities.data && entities.data.length) {
            e.preventDefault()
            const direction = key === 'ArrowDown' ? FocusDirection.down : FocusDirection.up
            setFocusDirection(direction)
            let nextIndex = focusedIndex + direction
            const isEnd = nextIndex < 0 || nextIndex === entities.data.length

            if (isEnd) {
              nextIndex = isEnd && direction > 0 ? 0 : entities.data.length - 1
            }
            setFocusedIndex(nextIndex)
          }
          break
        case 'Enter':
          if (inputState.touched) {
            e.preventDefault()
            if (entities.data && entities.data.length > 0 && focusedIndex >= 0) {
              const entity = entities.data[focusedIndex]
              if (entity) {
                dispatchInputEvent({ type: 'choose', payload: entity })
                const newText = props.getEntityText(entity)
                if (newText !== '') {
                  setValue(newText)
                }
              }
            }
          }
          break
        case 'PageDown':
          if (entities.data && entities.data.length > 0 && focusedIndex >= 0) {
            e.preventDefault()
            setFocusedIndex(focusedIndex + 10)
          }
          break
        case 'Tab':
        case 'Escape':
          dispatchInputEvent({ type: 'cancel' })
          break
        default:
          dispatchInputEvent({ type: 'type', payload: e })
      }
    },
    [entities]
  )

  const handlePopoutClose = useCallback(() => {
    dispatchInputEvent({ type: 'cancel' })
  }, [])

  // memoized functions
  const entityMenuItems: IMenuItemOptions[] = useMemo(() => {
    const result: IMenuItemOptions[] = entities.data.map<IMenuItemOptions>((e, index) => ({
      content: props.getEntityRender(e),
      focused: index === focusedIndex,
      onClick: handleEntityClick(e)
    }))
    return result
  }, [entities, props.getEntityRender, focusedIndex])

  // effects

  useEffect(() => {
    entities.fetch(value)
  }, [value])

  useEffect(() => {
    if (props.onChange) {
      props.onChange(value)
    }
  }, [value])

  // render

  const {
    debounce,
    getEntitiesHook,
    getEntityRender,
    getEntityText,
    onChange,
    value: propsValue,
    ...inputProps
  } = props

  const showPopup = value !== '' && inputState.touched

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
