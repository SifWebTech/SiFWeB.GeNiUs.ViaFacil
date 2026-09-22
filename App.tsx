//Arquivo que contem as rotas do aplicativo, ou seja, a tela que o usuario verá ao abrir o aplicativo.
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//importar todas as telas do aplicativo
import SplashScreen from './src/screens/splash_screen';
import MainScreen from './src/screens/main_screen';
import LoginScreen from './src/screens/login_screen';
import RegisterScreen from './src/screens/register_screen';
import DashboardScreen from './src/screens/dashboard_screen';

export type RootStackParamList = {
    Splash: undefined;
    Main: undefined;
    Login: undefined;
    Register: undefined;
    Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
