import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import { Heading } from '@inmotionnow/momentum-components-react'
import { Logo } from './components/logo'

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
