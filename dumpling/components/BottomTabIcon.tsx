import React from 'react';
import { View } from 'react-native';
import HomeIcon from '../assets/svg/wallet.svg';
import SettingIcon from '../assets/svg/style6.svg';
import ProfileIcon from '../assets/svg/chart.svg';
import SearchIcon from '../assets/svg/discover.svg';
import BlinksIcon from '../assets/svg/BlinksIcon.svg';

interface Props {
  route: string;
  isFocused: boolean;
}

const BottomTabIcon = ({ route, isFocused }: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const renderIcon = (route: string, isFocused: boolean) => {
    let height: number = 34;
    let width: number = 34;

    switch (route) {
      case 'analytics':
        return <ProfileIcon />;
      case 'rewards':
        return <BlinksIcon />;
      case 'holdings':
        return <SettingIcon />;
      case 'creator':
        return <HomeIcon />;
      default:
        break;
    }
  };

  return <View>{renderIcon(route, isFocused)}</View>;
};

export default BottomTabIcon;
