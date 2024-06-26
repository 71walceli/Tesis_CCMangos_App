import React, {CSSProperties, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {colores, iconos, styles} from '../theme/appTheme';
import Icon from 'react-native-vector-icons/Ionicons';


interface AccordionProps {
  title: string;
  children: React.ReactNode;
  titleStyle?: CSSProperties;
  innerStyle?: CSSProperties;
  expanded?: Boolean;
}

export const Accordion = ({title, children, titleStyle, innerStyle, expanded, ...props}: AccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded || false);
  const [animation] = useState(new Animated.Value(0));
  const {width} = useWindowDimensions();

  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);

    Animated.timing(animation, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false, // You can set this to true if needed
    }).start();
  };

  return (
    <View style={{...AcordionStyles.container, width: "100%", ...props.style}}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={{flexDirection: 'row'}}
        onPress={toggleAccordion}>
        <Text style={{...AcordionStyles.header, fontSize: 16, ...titleStyle}}>
          {title} {<Icon name={isExpanded ? iconos.arriba : iconos.abajo} size={16} />}
        </Text>
      </TouchableOpacity>
      {isExpanded && <View style={{...AcordionStyles.content, ...innerStyle}}>{children}</View>}
    </View>
  );
};
const AcordionStyles = StyleSheet.create({
  container: {
    backgroundColor: colores.blanco,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderColor: '#000',
    marginBottom: 5,
    overflow: 'hidden',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    textAlign: 'center',
    padding: 5,
    fontWeight: 'bold',
    backgroundColor: colores.primario,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    width: '100%',
    color: colores.blanco,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  arrow: {
    fontSize: 20,
  },
  content: {
    width: '90%',
    //maxHeight: 320,
    ...styles.centerItems,
    borderWidth: 1,
    borderStyle: "dotted",
    borderColor: colores.negro,
    borderTopWidth: 0,
    padding: 4,
    //backgroundColor: colores.LocationBg,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
});
