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
    try {
      const { width, height, scale, fontScale } = Dimensions.get('window');
      const iosPlatform = Platform as typeof Platform & { isPad?: boolean };
      const deviceInfo = {
        platform: Platform.OS,
        osVersion: Platform.Version,
        deviceType: Platform.OS === 'ios' && iosPlatform.isPad ? 'tablet' : 'phone',
        screenSize: `${width}x${height}`,
        scale,
        fontScale,
      };
      
      const deviceString = JSON.stringify(deviceInfo);
      const deviceHash = simpleHash(deviceString);
      
      onVisitorId(`device_${deviceHash}`);
      return true;
    } catch {
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
    const { data } = event.nativeEvent;
    
    if (data && data !== "error") {
      onVisitorId(`fp_${data}`);
    } else {
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
        (async () => {
          try {
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            window.ReactNativeWebView.postMessage(result.visitorId);
          } catch (e) {
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
      onError={(syntheticEvent) => {
        if (!fallbackUsed) {
          setFallbackUsed(true);
          getDeviceId();
        }
      }}
      onHttpError={(syntheticEvent) => {
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
