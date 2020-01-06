import React, { Component, useState, useCallback, useReducer, useEffect, useMemo } from 'react'
import 'src/App.css'
import {
  Form,
  Input,
  ControlGroup,
  View,
  Main,
  Section,
  Container,
  Application,
  Buttons,
  IControlChangeEventArgs,
  Toggle,
  IToggleChangedEventArgs,
  Select,
  ISelectOption,
  Text
} from '@inmotionnow/momentum-components-react'
import { Logo } from 'src/components/logo'
import { ControlGroup2 } from 'src/components/control-group'
import { navigateTo } from 'src/helpers/navigate-to'
import { useGetEnvironmentEntities } from 'src/hooks/getEnvironmentEntities'
import { IDSelectOption, EmptyIDSelectOption } from 'src/types/select-option'
import { SelectEdit } from 'src/components/select-edit'
import { useGetSubdomainEntities } from 'src/hooks/getSubdomainEntities'
import { Subdomain } from 'src/entities/subdomain'
import { useStorage } from 'src/hooks/useStorage'
import { createURL, hostnameToParts, environmentToDomain, getPath, getCurrentURL } from 'src/helpers/url'
import { debug } from 'util'
import { url } from 'inspector'
import { assertNever } from 'src/helpers/errors'

interface ILauncherAction {
  type: 'setSubdomain' | 'setEnvironment' | 'setNewTab' | 'launch' | 'did-launch' | 'restore-state' | 'set-current-url'
  payload: any
}

interface ILauncherState {
  currentURL?: URL
  environment: string
  environmentError: boolean
  newTab: boolean
  subdomain: string
  subdomainError: boolean
  touched: boolean
  url: string | null
}

type ILauncherReducer = (state: ILauncherState, action: ILauncherAction) => ILauncherState

const subdomainErrorText = 'Subdomain is required'
const environmentErrorText = 'Environment is required'

const reducer = (state: ILauncherState, action: ILauncherAction): ILauncherState => {
  switch (action.type) {
    case 'setSubdomain':
      return { ...state, subdomain: action.payload, subdomainError: action.payload === '', touched: state.touched }
    case 'setEnvironment':
      return { ...state, environment: action.payload, environmentError: action.payload === '' }
    case 'setNewTab':
      return { ...state, newTab: action.payload }
    case 'launch':
      return { ...state, touched: true, url: action.payload }
    case 'did-launch':
      return { ...state, url: null }
    case 'restore-state':
      return { ...action.payload }
    case 'set-current-url':
      return { ...state, currentURL: action.payload }
    default:
      assertNever(action.type)
  }
}

const initialState: ILauncherState = {
  environment: 'localhost',
  environmentError: false,
  newTab: false,
  subdomain: '',
  subdomainError: true,
  touched: false,
  url: null
}

const App: React.SFC = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const appState = useStorage<ILauncherState>('opus-launcher', initialState)

  const environments = useGetEnvironmentEntities()
  const subdomains = useGetSubdomainEntities()

  useEffect(() => {
    dispatch({ type: 'restore-state', payload: appState.data })
  }, [appState.data])

  useEffect(() => {
    environments.query()
    getCurrentURL((currentURL: URL) => {
      console.log(`set-current-url`, currentURL)
      dispatch({ type: 'set-current-url', payload: currentURL })
    })
  }, [])

  useEffect(() => {
    if (state.url) {
      navigateTo(state.url, { newWindow: state.newTab })
      // window.close()
    }
  }, [state.url])

  const environmentMenuItems: IDSelectOption[] = useMemo(() => {
    const result: IDSelectOption[] = environments.data.map((e, index) => ({
      displayText: e.name,
      value: index,
      id: e.id
    }))
    return result
  }, [environments.data])

  const selectedEnvironmentMenuItem: IDSelectOption = useMemo(() => {
    const result = environmentMenuItems.find(so => so.id === state.environment) || EmptyIDSelectOption
    return result
  }, [state.environment])

  const handleSubdomainChange = useCallback((event: IControlChangeEventArgs) => {
    dispatch({ type: 'setSubdomain', payload: event.currentValue })
  }, [])

  const onSubdomainChange = useCallback((text: string) => {
    dispatch({ type: 'setSubdomain', payload: text })
  }, [])

  const handleEnvironmentChange = useCallback(
    (event: IControlChangeEventArgs) => {
      const environment = environmentMenuItems[event.currentValue]
      dispatch({ type: 'setEnvironment', payload: environment.id })
    },
    [environmentMenuItems]
  )

  const handleNewTabChange = useCallback((e: IToggleChangedEventArgs) => {
    dispatch({ type: 'setNewTab', payload: e.currentValue })
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!state.subdomainError && !state.environmentError) {
      if (state.subdomain && state.subdomain !== '') {
        const subdomainEntity = subdomains.data.find(s => s.id === state.subdomain)
        if (!subdomainEntity) {
          const newSubdomainEntity: Subdomain = { id: state.subdomain, name: state.subdomain }
          subdomains.add(newSubdomainEntity)
        }
      }

      const pathname = !state.newTab && state.currentURL ? getPath(state.currentURL) : ''

      appState.setData(state)

      const url = createURL(state.environment, state.subdomain, pathname)
      dispatch({ type: 'launch', payload: url })
    } else {
      dispatch({ type: 'launch', payload: null })
    }
  }

  const handleRenderSubdomain = useCallback((subdomain: Subdomain) => <Text> {subdomain.name} </Text>, [])

  const handleGetSubdomainText = useCallback((subdomain: Subdomain) => subdomain.name, [])

  return appState.isLoading ? null : (
    <div className='mds-h-application-wrapper'>
      <Application>
        <Application.Layout>
          <View
            {...{
              header: <Logo />,
              main: (
                <Main
                  {...{
                    column1: (
                      <Section theme='primary'>
                        <Container>
                          <Form id='main-form' onSubmit={handleSubmit}>
                            <ControlGroup2
                              id='subdomain-input'
                              label='Subdomain'
                              hasError={state.touched && state.subdomainError}
                              helpText={state.touched && state.subdomainError ? subdomainErrorText : ''}
                            >
                              <SelectEdit
                                id='subdomain-select-edit'
                                required={true}
                                autoFocus={true}
                                onChange={onSubdomainChange}
                                value={state.subdomain}
                                hasError={state.touched && state.subdomainError}
                                getEntitiesHook={subdomains}
                                getEntityRender={handleRenderSubdomain}
                                getEntityText={handleGetSubdomainText}
                              />
                            </ControlGroup2>
                            <ControlGroup2
                              id='environment-input'
                              label='Environment'
                              hasError={state.touched && state.environmentError}
                              helpText={state.touched && state.environmentError ? environmentErrorText : ''}
                            >
                              <Select
                                selectOptions={environmentMenuItems}
                                selectedValue={selectedEnvironmentMenuItem.value}
                                handleChange={handleEnvironmentChange}
                                required={true}
                              />
                            </ControlGroup2>
                            <Toggle label='open new tab' onChange={handleNewTabChange} checked={state.newTab} />
                          </Form>
                        </Container>
                      </Section>
                    )
                  }}
                />
              ),
              footer: (
                <Section theme='primary' padding='sm'>
                  <Buttons>
                    <Form.Submit formId='main-form' label='Go' />
                  </Buttons>
                </Section>
              )
            }}
          />
        </Application.Layout>
      </Application>
    </div>
  )
}

export default App
