import React, { Component } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { connect } from "react-redux";

// somewhere in your app
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

const mapDispatchToProps = (
    dispatch
) => {
    return {
        setCommonState: (type, data) => {
            dispatch({
                type,
                data
            });
        }
    }
}

// 映射state属性
// const mapStateToProps = (state) => {
//     return {
//         musicSource: state.CommonState.musicSource,            // 音乐源
//     }
// }


class MusicSourceSwitch extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <TouchableOpacity style={{                
                position: 'absolute',
                zIndex: 1000,
                width: 40,
                height: 40,
                borderRadius: 30,
                backgroundColor: '#EEEEEE',
                right: 10,
                bottom: 100
            }}>
                <Menu>
                    <MenuTrigger style={{width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 16}}>{this.props._musicSource}</Text>
                    </MenuTrigger>
                    <MenuOptions customStyles={{
                        optionsContainer: {
                            width: 60
                        },
                        optionWrapper: {
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }
                    }}>
                        <MenuOption onSelect={() => {this.props.setCommonState('setMusicSource', 'QQ'); this.props.setStateMusicSource('QQ')}} >
                            <Text style={{ color: 'red' }}>QQ</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => {this.props.setCommonState('setMusicSource', 'WY'); this.props.setStateMusicSource('WY')}} >
                            <Text style={{ color: 'red' }}>WY</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => {this.props.setCommonState('setMusicSource', 'MG'); this.props.setStateMusicSource('MG')}} >
                            <Text style={{ color: 'red' }}>MG</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => {this.props.setCommonState('setMusicSource', 'KW'); this.props.setStateMusicSource('KW')}} >
                            <Text style={{ color: 'red' }}>KW</Text>
                        </MenuOption>
                        <MenuOption onSelect={() => {this.props.setCommonState('setMusicSource', 'KG'); this.props.setStateMusicSource('KG')}} >
                            <Text style={{ color: 'red' }}>KG</Text>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            </TouchableOpacity>
        );
    }
}

export default connect(null, mapDispatchToProps)(MusicSourceSwitch);