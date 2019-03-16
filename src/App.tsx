import React, { Component } from 'react'
import 'src/App.css'
import { Heading } from '@inmotionnow/momentum-components-react'
import { Logo } from 'src/components/logo'

class App extends Component {
  render() {
    return (
      <div className='App'>
        <Logo />
        <Heading>Hello World</Heading>
      </div>
    )
  }
}

export default App
