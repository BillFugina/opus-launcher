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
  IControlChangeEventArgs
} from '@inmotionnow/momentum-components-react'
import { Logo } from 'src/components/logo'
import { ControlGroup2 } from 'src/components/control-group'

interface ILauncherAction {
  type: 'setSubdomain' | 'setEnvironment' | 'launch'
  payload: string
}

interface ILauncherState {
  subdomain: string
  environment: string
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
    case 'launch':
      return { ...state, touched: true }
    default:
      throw new Error()
  }
}

const initialState: ILauncherState = {
  subdomain: '',
  environment: '',
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!state.subdomainError && !state.environmentError) {
      const port = state.environment == 'localhost' ? ':9002' : ''
      const url: any = `https://${state.subdomain}.${state.environment}.goinmo.com${port}`
      chrome.tabs.update({
        url
      })
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
                            <ControlGroup2 id='subdomain-input' label='Subdomain'>
                              <Input
                                required={true}
                                autoFocus={true}
                                handleChange={handleSubdomainChange}
                                value={state.subdomain}
                              />
                            </ControlGroup2>
                            <ControlGroup2 id='environment-input' label='Environment'>
                              <Input required={true} handleChange={handleEnvironmentChange} value={state.environment} />
                            </ControlGroup2>
                          </Form>
                          <Buttons>
                            <Form.Submit formId='main-form' label='Go' />
                          </Buttons>
                        </Container>
                      </Section>
                    )
                  }}
                />
              )
            }}
          />
        </Application.Layout>
      </Application>
    </div>
  )
}

export default App
