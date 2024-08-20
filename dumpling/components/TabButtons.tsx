// import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
// import { useState } from 'react';
// import { useSharedValue, withTiming} from "react-native-reanimated";
// import { AnimatedView } from 'react-native-reanimated/lib/typescript/reanimated2/component/View';
// export type TabbuttonType = {
//   title: string;
// };

// type TabButtonsProps = {
//   buttons: TabbuttonType[];
//   selectedTab: number;
//   setSelectedTab: (index: number) => void;
// };

// const TabButtons = ({ buttons, selectedTab, setSelectedTab }: TabButtonsProps) => {
//   const [dimensions, setDimensions] = useState({ height: 20, width: 100 });

//   const buttonWidth = dimensions.width / buttons.length;

//   const tabPositionX = useSharedValue(0);

//   const onTabbarLayout = (e: LayoutChangeEvent) => {
//     setDimensions({
//       height: e.nativeEvent.layout.height,
//       width: e.nativeEvent.layout.width,
//     });
//     const handlePress = () => {

//     }

//     const onTabPress = (index:number) => {
//         tabPositionX.value = withTiming(buttonWidth * index, {}, ()=> {

//         } )
//     }
//   };
//   return (
//     <View
//       accessibilityRole="tabbar"
//       style={{ backgroundColor: '#c333cc', borderRadius: 20, justifyContent: 'center' }}>
//       <AnimatedView
//         style={{
//           position: 'absolute',
//           backgroundColor: '#fff',
//           borderRadius: 15,
//           marginHorizontal: 5,
//           height: dimensions.height - 10,
//           width: buttonWidth - 10,
//         }}>
//         <View style={{ flexDirection: 'row' }}>
//           {buttons.map((button, index) => {
//             return (
//               <Pressable key={index} style={{ flex: 1, paddingVertical: 20 }} onPress={() => onTabPress(index)}>
//                 <Text>{button.title}</Text>
//               </Pressable>
//             );
//           })}
//         </View>
//       </AnimatedView>
//     </View>
//   );
// };

// export default TabButtons;

// const styles = StyleSheet.create({});
