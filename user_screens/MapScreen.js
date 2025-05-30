import React from 'react'
import tw from 'twrnc';
import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'
import MapUser from '../user_components/MapUser';
import MapView from 'react-native-maps';



const MapScreen = () => {
    return (
            <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>

                <MapUser />
                
                    </View>
            </View>

    );
};

export default MapScreen

const styles = StyleSheet.create ({});


// import React from 'react'
// import tw from 'twrnc';
// import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'
// import MapUser from '../user_components/MapUser';
// import MapView from 'react-native-maps';



// const MapScreen = () => {
//     const Stack = createStackNavigator();

//     return (
//         <View>
//             <View style={tw`h-1/2`}>
//                 <Map />
//         </View>
//         <View style={tw`h-1/2`}>
//             <Stack.Navigator>
//              <Stack.Screen
//                 name="NavigateCard"
//                 component={NavigateCard}
//                 options={{
//                     headerShown: false,
//                 }} 
//                 />  
//             </Stack.Navigator>
//         </View>
//         </View>


//     );
// };

// export default MapScreen

// const styles = StyleSheet.create ({});