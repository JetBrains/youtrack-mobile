import {StyleSheet} from 'react-native';
import {COLOR_FONT_GRAY, COLOR_FONT} from '../../components/variables/variables';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fa'
  },
  arrowImage: {
    marginTop: 4,
    height: 14,
    resizeMode: 'contain'
  },
  card: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderBottomColor: '#dfe5eb',
    borderBottomWidth: 1,
    borderTopColor: '#dfe5eb',
    borderTopWidth: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  summary: {
    fontSize: 15,
    lineHeight: 18,
    color: COLOR_FONT,
    flexShrink: 1
  },
  cardContent: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopColor: '#dfe5eb',
    borderTopWidth: 1,
    alignItems: 'center'
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textPrimary: {
    lineHeight: 18,
    fontSize: 13,
    color: COLOR_FONT
  },
  textSecondary: {
    lineHeight: 18,
    fontSize: 13,
    color: COLOR_FONT_GRAY
  }
});
