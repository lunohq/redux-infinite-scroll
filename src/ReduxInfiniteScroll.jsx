import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import {topPosition} from './Utilities/DOMPositionUtils';

export default class ReduxInfiniteScroll extends Component {

  constructor(props) {
    super(props);
    this.scrollFunction = this.scrollListener.bind(this);
  }

  componentDidMount () {
    this.attachScrollListener();
  }

  componentDidUpdate () {
    this.attachScrollListener();
  }

  _findElement() {
    return this.props.elementIsScrollable ? ReactDOM.findDOMNode(this) : window;
  }

  attachScrollListener () {
    if (!this.props.hasMore || this.props.loadingMore) return;
    let el = this._findElement();
    el.addEventListener('scroll', this.scrollFunction, true);
    el.addEventListener('resize', this.scrollFunction, true);
    this.scrollListener();
  }

  _elScrollListener() {
    let el = ReactDOM.findDOMNode(this);
    let topScrollPos = el.scrollTop;
    let totalContainerHeight = el.scrollHeight;
    let containerFixedHeight = el.offsetHeight;
    let bottomScrollPos = topScrollPos + containerFixedHeight;

    return (totalContainerHeight - bottomScrollPos);
  }

  _windowScrollListener() {
    let el = ReactDOM.findDOMNode(this);
    let windowScrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    let elTotalHeight = topPosition(el) + el.offsetHeight;
    let currentBottomPosition = elTotalHeight - windowScrollTop - window.innerHeight;

    return currentBottomPosition;
  }

  scrollListener() {
    // This is to prevent the upcoming logic from toggling a load more before
    // redux has passed any data to the component
    if (this.props.children <= 0) return;

    setTimeout(() => {
      let bottomPosition = this.props.elementIsScrollable ? this._elScrollListener() : this._windowScrollListener();

      if (bottomPosition < Number(this.props.threshold)) {
        this.detachScrollListener();
        this.props.loadMore();
      }
    }, 0);
  }

  detachScrollListener () {
    let el = this._findElement();
    el.removeEventListener('scroll', this.scrollFunction, true);
    el.removeEventListener('resize', this.scrollFunction, true);
  }

  componentWillUnmount () {
    this.detachScrollListener();
  }

  renderLoader() {
    return (this.props.loadingMore && this.props.showLoader) ? this.props.loader : undefined;
  }

  render () {
    const { containerHeight, children, ...other} = this.props;
    return (
        <div style={{height: containerHeight}} {...other}>
          {children}
          {this.renderLoader()}
        </div>
    )
  }
}

ReduxInfiniteScroll.propTypes = {
  children: React.PropTypes.node.isRequired,
  containerHeight: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string
  ]),
  elementIsScrollable: React.PropTypes.bool,
  threshold: React.PropTypes.number,
  hasMore: React.PropTypes.bool,
  loadingMore: React.PropTypes.bool,
  loader: React.PropTypes.any,
  showLoader: React.PropTypes.bool,
  loadMore: React.PropTypes.func.isRequired,
};

ReduxInfiniteScroll.defaultProps = {
  elementIsScrollable: true,
  containerHeight: '100%',
  threshold: 100,
  hasMore: true,
  loadingMore: false,
  loader: <div style={{'text-align': 'center'}}>Loading...</div>,
  showLoader: true
};
