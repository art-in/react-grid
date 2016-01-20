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
        pos: React.PropTypes.object.isRequired,
        menuItems: React.PropTypes.arrayOf(
            React.PropTypes.shape({
                title: React.PropTypes.string.isRequired,
                onClick: React.PropTypes.func.isRequired
            })).isRequired
    };

    render() {
        let {pos, menuItems} = this.props;

        let menuItemComponents = menuItems.map(i => {
            return (
                <MenuItem key={i.title} title={i.title} onClick={i.onClick} />
            );
        })

        return (
            <div className={this.classes.menu}
                 style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`
                 }}>
                 {menuItemComponents}
            </div>    
        )
    }
}