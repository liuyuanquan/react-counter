import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import registerServiceWorker from './registerServiceWorker'

// UI组件
const Counter = props => (
  <div>
    <button onClick={props.onDecreaseClick}>-</button>
    <span style={{margin: '0 10px'}}>{props.value}</span>
    <button onClick={props.onIncreaseClick}>+</button>
  </div>
)

// 中间件
const MiddleVisibleCounter = () => (
  <Consumer>
    { ({store}) => <VisibleCounter store={store} /> }
  </Consumer>
)

// 容器组件
class VisibleCounter extends Component {
  constructor(props) {
    super(props)
    const { store } = this.props
    store.subscribe(() => {
      this.setState(store.getState())
      console.log('next  state:', store.getState())
    })
    this.state = store.getState()
  }
  onClick(action) {
    store.dispatch(action)
  }
  render() {
    return (
      <Counter value={this.state.count} onDecreaseClick={() => this.onClick({ type: 'decrease' })} onIncreaseClick={() => this.onClick({ type: 'increase' })}/>
    )
  }
}

// reducer
const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case 'decrease':
      return { count: state.count - 1 }
    case 'increase':
      return { count: state.count + 1 }
    default:
      return state
  }
}

const applyMiddleware = (store, middlewares) => {
  middlewares.reverse()
  let dispatch = store.dispatch
  middlewares.forEach(middleware => {
    dispatch = middleware(store)(dispatch)
  })
  return { ...store, dispatch }
}

// 自定义中间件-log
const logger = store => next => {
  return action => {
    console.log('dispatching:', action)
    next(action)
  }
}

// 自定义中间件-date
const date = store => next => {
  return action => {
    console.log('date1:', Date.now())
    next(action)
    console.log('date2:', Date.now())
  }
}

let store = createStore(reducer)

store = applyMiddleware(store, [logger, date])

const { Provider: Provider2, Consumer } = React.createContext({
  store: store
})

const Provider = (props) => {
  return (
    <Provider2 value={{store:props.store}}>
      { props.children }
    </Provider2>
  )
}

ReactDOM.render(
  <Provider store={store}>
    <MiddleVisibleCounter />
  </Provider>
  , document.getElementById('root'))

registerServiceWorker()