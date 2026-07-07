import {
  MaterialDesignIcons,
  type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons';
import type { ColorValue } from 'react-native';

type TabBarIconProps = {
  color: ColorValue;
  name: MaterialDesignIconsIconName;
  size: number;
};

export function TabBarIcon({ color, name, size }: TabBarIconProps) {
  return <MaterialDesignIcons color={color} name={name} size={size} />;
}
