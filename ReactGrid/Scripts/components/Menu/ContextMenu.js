import React from 'react'
import {css} from '../../helpers/react-helpers'
import MenuItem from './MenuItem'

@css({
    menu: {
        'position': 'absolute',
        'width': '200px',
        'background-color': 'white',
        'padding': '5px 0',
        'border': '1px solid lightgray'
    }
})
export default class ContextMenu extends React.Component {
    
    classes = this.props.sheet.classes;

    static propTypes = {
        pos: React.PropTypes.object.isRequired
    };

    render() {
        let {pos} = this.props;

        return (
            <div className={this.classes.menu}
                 style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`
                 }}>
                <MenuItem title={'Item 1'} />
                <MenuItem title={'Item 2'} />
                <MenuItem title={'Item 3'} />
            </div>    
        )
    }
}