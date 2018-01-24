import React, { Component } from 'react';
import PropTypes from 'prop-types';

class BGM extends Component {
    state = {
        playing: true
    };

    componentDidMount() {
        this.refs.box.addEventListener('click', this.togglePlay, false);
        this.refs.player.addEventListener('pause', this.onpause, false);
        this.refs.player.addEventListener('play', this.onplay, false);

        if (this.props.autoplay) {
            this.autoplay();
        }
    }

    componentWillUnmount() {
        this.refs.box.removeEventListener('click', this.togglePlay, false);
        this.refs.player.addEventListener('pause', this.onpause, false);
        this.refs.player.addEventListener('play', this.onplay, false);

        if (this.props.autoplay) {
            document.removeEventListener('touchstart', this.autoplay, false);
            document.removeEventListener('WeixinJSBridgeReady', this.autoplay, false);
            document.removeEventListener('WeiboJSBridgeReady', this.autoplay, false);
        }
    }

    onpause = () =>
        this.setState(
            {
                playing: false
            },
            this.props.onpause
        );

    onplay = () =>
        this.setState(
            {
                playing: true
            },
            this.props.onplay
        );

    //支持微信、微博下自动播放
    autoplay = ev => {
        const player = this.refs.player;

        if (!this.userClicked && player.paused) {
            if (typeof WeixinJSBridge !== 'undefined') {
                window.WeixinJSBridge.invoke('getNetworkType', {}, e => {
                    player.play();
                });
            } else if (typeof WeiboJSBridge !== 'undefined') {
                window.WeiboJSBridge.invoke('getNetworkType', {}, e => {
                    player.play();
                });
            } else {
                player.play(); //尝试直接播放

                //依然无法播放
                if (player.paused) {
                    document.addEventListener('touchstart', this.autoplay, false);
                    document.addEventListener('WeixinJSBridgeReady', this.autoplay, false);
                    document.addEventListener('WeiboJSBridgeReady', this.autoplay, false);
                }
            }
        }

        if (ev && ev.type === 'touchstart') {
            //移除事件绑定
            document.removeEventListener('touchstart', this.autoplay, false);
        }
    };

    togglePlay = () => {
        const player = this.refs.player;

        this.userClicked = true; //标示用户已操作过

        player.paused ? player.play() : player.pause();
    };

    render() {
        const { playing } = this.state;
        const { className, autoplay, loop, component } = this.props;
        let children = component || this.props.children;

        if (typeof children === 'function') {
            const Children = children;

            children = <Children playing={playing} paused={!playing} />;
        }

        return (
            <div
                className={
                    (className ? className + ' ' : '') +
                    'bgm-box ' +
                    (this.state.playing ? 'bgm-playing' : 'bgm-paused')
                }
                ref="box">
                <audio autoPlay={autoplay} loop={loop} src={this.props.src} className="player" ref="player" />
                {children || <div className="music" />}
            </div>
        );
    }

    static defaultProps = {
        autoplay: true,
        loop: true
    };

    static propTypes = {
        src: PropTypes.string.isRequired,
        autoplay: PropTypes.bool,
        loop: PropTypes.bool,
        onplay: PropTypes.func,
        onpause: PropTypes.func,
        component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
    };
}

export default BGM;
