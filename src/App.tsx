import React, { Component, useState, useCallback, useReducer } from 'react'
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
  IToggleChangedEventArgs
} from '@inmotionnow/momentum-components-react'
import { Logo } from 'src/components/logo'
import { ControlGroup2 } from 'src/components/control-group'
import { navigateTo } from 'src/helpers/navigate-to'

interface ILauncherAction {
  type: 'setSubdomain' | 'setEnvironment' | 'setNewTab' | 'launch'
  payload: any
}

interface ILauncherState {
  subdomain: string
  environment: string
  newTab: boolean
  touched: boolean
  subdomainError: boolean
  environmentError: boolean
}

type ILauncherReducer = (state: ILauncherState, action: ILauncherAction) => Partial<ILauncherState>

const subdomainErrorText = 'Subdomain is required'
const environmentErrorText = 'Environment is required'

const reducer = (state: ILauncherState, action: ILauncherAction): ILauncherState => {
  console.log(`Reducer`, state, action)
  switch (action.type) {
    case 'setSubdomain':
      return { ...state, subdomain: action.payload, subdomainError: action.payload === '', touched: state.touched }
    case 'setEnvironment':
      return { ...state, environment: action.payload, environmentError: action.payload === '' }
    case 'setNewTab':
      return { ...state, newTab: action.payload }
    case 'launch':
      return { ...state, touched: true }
    default:
      throw new Error(`Invalid action: ${action.type}`)
  }
}

const initialState: ILauncherState = {
  subdomain: '',
  environment: '',
  newTab: false,
  touched: false,
  subdomainError: true,
  environmentError: true
}

const App: React.SFC = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleSubdomainChange = useCallback((event: IControlChangeEventArgs) => {
    dispatch({ type: 'setSubdomain', payload: event.currentValue })
  }, [])

  const handleEnvironmentChange = useCallback((event: IControlChangeEventArgs) => {
    dispatch({ type: 'setEnvironment', payload: event.currentValue })
  }, [])

  const handleNewTabChange = useCallback((e: IToggleChangedEventArgs) => {
    dispatch({ type: 'setNewTab', payload: e.currentValue })
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!state.subdomainError && !state.environmentError) {
      const port = state.environment == 'localhost' ? ':9002' : ''
      const url: any = `https://${state.subdomain}.${state.environment}.goinmo.com${port}`
      navigateTo(url, { newWindow: state.newTab })
      window.close()
    } else {
      dispatch({ type: 'launch', payload: '' })
    }
  }

  return (
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
                              <Input
                                required={true}
                                autoFocus={true}
                                handleChange={handleSubdomainChange}
                                value={state.subdomain}
                                hasError={state.touched && state.subdomainError}
                              />
                            </ControlGroup2>
                            <ControlGroup2
                              id='environment-input'
                              label='Environment'
                              hasError={state.touched && state.environmentError}
                              helpText={state.touched && state.environmentError ? environmentErrorText : ''}
                            >
                              <Input
                                required={true}
                                handleChange={handleEnvironmentChange}
                                value={state.environment}
                                hasError={state.touched && state.environmentError}
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
