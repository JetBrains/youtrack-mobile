import {StyleSheet} from 'react-native';
import {UNIT, COLOR_PINK, COLOR_FONT_GRAY} from '../../components/variables/variables';

export default StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: UNIT*4,
        paddingLeft: UNIT*4,
        paddingRight: UNIT*4,
        paddingBottom: UNIT*2,
        backgroundColor: '#FFF'
    },
    welcome: {
        fontSize: 26,
        textAlign: 'center'
    },
    linkContainer: {
        padding: 20,
        alignItems: 'center'
    },
    signin: {
        padding: 20,
        borderRadius: 6,
        backgroundColor: COLOR_PINK,
        alignItems: 'center'
    },
    signinText: {
        alignSelf: 'stretch',
        textAlign: 'center'
    },
    linkLike: {
        color: COLOR_PINK
    },
    input: {
        height: UNIT*4,
        marginTop: UNIT,
        marginBottom: UNIT,
        backgroundColor: '#FFF',
        color: '#7E7E84',
        fontSize: 22,
        borderBottomColor: COLOR_PINK,
        borderBottomWidth: 1
    },
    inputsContainer: {
        height: 100,
        padding: UNIT,
        alignItems: 'center'
    },
    actionsContainer: {
    },
    logoContainer: {
        marginTop: UNIT*5,
        alignItems: 'center'
    },
    logoImage: {
        width: UNIT*16,
        height: UNIT*16
    },
    descriptionText: {
        fontSize: 16,
        color: COLOR_FONT_GRAY,
        textAlign: 'center'
    }
});