import React, { Component } from 'react'
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
  Buttons
} from '@inmotionnow/momentum-components-react'
import { Logo } from 'src/components/logo'
import { ControlGroup2 } from 'src/components/control-group'

class App extends Component {
  render() {
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
                            <Form id='main-form'>
                              <ControlGroup2 id='subdomain-input' label='Subdomain'>
                                <Input required={true} autoFocus={true} />
                              </ControlGroup2>
                              <ControlGroup2 id='environment-input' label='Environment'>
                                <Input required={true} />
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
}

export default App
