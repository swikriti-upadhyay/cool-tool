import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { TextInput } from 'react-native-gesture-handler';
import Rating from './Rating'
import { withStyles } from 'react-native-styleman';


class UICheckBoxGroup extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selected: []
        }
        this.dynamicIndex = 0
        this.arr = []
    }

    static defaultProps = {
        items: [],
        onSelected: null
    }

    componentDidUpdate(prevProps) {
        if (prevProps.items !== this.props.items) {
          this.setState({
              selected: []
          })
        }
      }

    handleChangeRating(id, value, key) {
        let { selected } = this.state
        let curItem = {
            id,
            value
        }
        let nextItem = key + 1
        let item = selected.find( item => item.id === id );

        if(!item) {
            selected.push(curItem)
        } else {
            item.value = value
        }
        if (nextItem < this.arr.length) {
            this.dynamicIndex = this.arr[nextItem]
            this.props?.scroll(this.dynamicIndex)
        }
        this.props.items.length === selected.length && this.props.onSelected(selected);
        this.setState({
            selected: selected
        })
    }
    render() {
        let { items, styles } = this.props;
        return <View style={styles.group}>
            {items.map((item, key) => {
                return <View
                            onLayout={event => {
                                const layout = event.nativeEvent.layout;
                                this.arr[key] = layout.y;
                            }}
                            style={styles.container} key={item.id}>
                            {Boolean(item.name) && <Text style={styles.title}>{item.name.toUpperCase()}</Text>}
                            <Rating item={item} onSelected={(id, value) => this.handleChangeRating(id, value, key)} />
                            <View style={styles.labels}>
                                    {Boolean(item.LeftLabel) && <Text style={styles.label}>{item.LeftLabel}</Text>}
                                    {Boolean(item.RightLabel) && <Text style={styles.label}>{item.RightLabel}</Text>}
                            </View>
                        </View>
            })}
        </View>
    }
}

const styles = ({$fontSize, $proximaB, $lightColor, $proximaRegular}) => ({
    container: {
        paddingVertical: 12,
        '@media': [
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    paddingTop: 0
                }
            }
        ]
    },
    item: {
        width: 48,
        height: 48
    },
    title: {
        marginVertical: 20,
        fontSize: $fontSize,
        fontFamily: $proximaB,
        fontWeight: 'bold',
        color: $lightColor,
        '@media': [
            
            {
                orientation: 'landscape',
                minWidth: 320,
                maxWidth: 851,
                styles: {
                    marginTop: 0
                }
            }
        ]
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    label: {
        maxWidth: '50%',
        marginVertical: 12,
        fontSize: $fontSize,
        fontFamily: $proximaRegular,
        color: $lightColor
    }
})

export default withStyles(styles)(UICheckBoxGroup)