import Reactotron, {networking, asyncStorage} from 'reactotron-react-native';

Reactotron.configure()
    .useReactNative()
    .use(networking())
    .use(asyncStorage())
    .connect();
