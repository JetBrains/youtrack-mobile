import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK} from '../../components/variables/variables';

export default StyleSheet.create({
    container: {
        flex: 1
    },
    summaryInput: {
        minHeight: UNIT*6,
        margin: UNIT,
        padding: UNIT,
        color: '#7E7E84',
        fontSize: 18
    },
    descriptionInput: {
        minHeight: UNIT*6,
        margin: UNIT,
        padding: UNIT,
        flex: 1,
        backgroundColor: '#FFF',
        color: '#7E7E84',
        borderColor: 'black',
        fontSize: 14
    },
    separator: {
        height: 0.5,
        backgroundColor: '#C8C7CC'
    }
});