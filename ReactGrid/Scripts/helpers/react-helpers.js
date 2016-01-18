import useSheet from 'react-jss';

/**
 * Decorator for React class
 * to include CSS rules into component
 *
 * NOTE: It would be prettier to write css rules _inside_ class
 * through class property, not _on top_ of class - in decorator.
 * But this is blocked by issue in 'babel-plugin-transform-class-properties':
 * it does not support static class properties, and static method will be ugly.
 * Looks like transform will be fixed in babel v6.4.4
 * https://github.com/babel/babel/commit/36ebe0c939f34018d665196c9a13903afee12075
 *
 * @example
 *
 * @css({
 *  'my-class': {
 *      'background-color': 'yellow'
 *  }
 * })
 * export default class extends React.Component {
 *  classes = this.props.sheet.classes;
 *  render() {
 *      return <span className={this.classes.component}></span>;
 *  }
 * }
 *
 * @param {object} cssRules - css classes, media, etc.
 * @return {function} function that will be called
 *                    when creating React class
 */
export function css(cssRules) {
    return function(ReactClass) {
        if (cssRules) {
            return useSheet(ReactClass, cssRules);
        }
        return ReactClass;
    };
}
