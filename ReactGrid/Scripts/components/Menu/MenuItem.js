import React from 'react'
import {css} from '../../helpers/react-helpers'

@css({
    item: {
        'padding': '0 5px',
        '&:hover': {
            'background-color': '#f3f3f3'
        }
    }
})
export default class MenuItem extends React.Component {

    classes = this.props.sheet.classes;

    static propTypes = {
        title: React.PropTypes.string.isRequired,
        onClick: React.PropTypes.func.isRequired
    };

    render() {
        return (
            <div className={this.classes.item}
                 onClick={this.props.onClick}>
                {this.props.title}
            </div>
        )
    }
}