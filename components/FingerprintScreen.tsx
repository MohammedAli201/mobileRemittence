import React from 'react';
import { Dimensions, LogBox, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { v4 as uuidv4 } from 'uuid';

// Ignore WebView warnings
LogBox.ignoreLogs(['Encountered an error loading page']);

interface Props {
  onVisitorId: (id: string) => void;
}

const FingerprintScreen: React.FC<Props> = ({ onVisitorId }) => {
  const [fallbackUsed, setFallbackUsed] = React.useState(false);

  const getDeviceId = () => {
    console.log('Generating fallback device ID...');
    try {
      const { width, height, scale, fontScale } = Dimensions.get('window');
      const deviceInfo = {
        platform: Platform.OS,
        osVersion: Platform.Version,
        deviceType: Platform.isPad ? 'tablet' : 'phone',
        screenSize: `${width}x${height}`,
        scale,
        fontScale,
      };
      
      const deviceString = JSON.stringify(deviceInfo);
      const deviceHash = simpleHash(deviceString);
      
      console.log('Generated device fingerprint:', deviceHash);
      onVisitorId(`device_${deviceHash}`);
      return true;
    } catch (error) {
      console.warn('Device ID generation failed, using UUID fallback:', error);
      onVisitorId(`uuid_${uuidv4()}`);
      return false;
    }
  };

  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    console.log('WebView message received:', event.nativeEvent.data);
    const { data } = event.nativeEvent;
    
    if (data && data !== "error") {
      console.log('FingerprintJS successful, ID:', data);
      onVisitorId(`fp_${data}`);
    } else {
      console.log('FingerprintJS failed, attempting fallback...');
      if (!fallbackUsed) {
        setFallbackUsed(true);
        getDeviceId();
      }
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://fpjscdn.net/v3/BTfXJ9q4TCWtTT97wuvl"></script>
    </head>
    <body>
      <script>
        console.log('FingerprintJS script loading...');
        (async () => {
          try {
            const fp = await FingerprintJS.load();
            console.log('FingerprintJS loaded, getting visitorId...');
            const result = await fp.get();
            console.log('Got visitorId:', result.visitorId);
            window.ReactNativeWebView.postMessage(result.visitorId);
          } catch (e) {
            console.error('FingerprintJS error:', e);
            window.ReactNativeWebView.postMessage("error");
          }
        })();
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      javaScriptEnabled={true}
      onMessage={handleMessage}
      onLoad={() => console.log('WebView loaded successfully')}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView error:', nativeEvent);
        if (!fallbackUsed) {
          setFallbackUsed(true);
          getDeviceId();
        }
      }}
      onHttpError={(syntheticEvent) => {
        console.warn('WebView HTTP error:', syntheticEvent.nativeEvent);
        if (!fallbackUsed) {
          setFallbackUsed(true);
          getDeviceId();
        }
      }}
      style={{ 
        width: 1, 
        height: 1,
        opacity: 0.01
      }}
      startInLoadingState={true}
    />
  );
};

export default FingerprintScreen;