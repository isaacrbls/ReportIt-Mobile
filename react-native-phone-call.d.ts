declare module 'react-native-phone-call' {
  interface PhoneCallArgs {
    number: string;
    prompt?: boolean;
  }
  
  function RNImmediatePhoneCall(args: PhoneCallArgs): void;
  
  export default RNImmediatePhoneCall;
}
