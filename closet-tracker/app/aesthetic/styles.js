

import { StyleSheet } from 'react-native';
import beigeColors from '../aesthetic/beigeColors';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: beigeColors.lightBeige,
        padding: 16,
    },
    header: {
        backgroundColor: beigeColors.cream,
        padding: 20,
        alignItems: 'center',
    },
    headerText: {
        color: beigeColors.taupe,
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: beigeColors.beige,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: beigeColors.taupe,
        fontSize: 16,
    },
    text: {
        color: beigeColors.taupe,
        fontSize: 16,
    },
});
