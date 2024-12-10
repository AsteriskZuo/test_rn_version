/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import * as React from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TextInput,
  FlatList,
  SafeAreaView,
  TouchableNativeFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  Pressable,
} from 'react-native';
import {
  ChatClient,
  ChatMessage,
  ChatMessageChatType,
  ChatMessageType,
  ChatOptions,
  ChatPushConfig,
} from 'react-native-chat-sdk';
import {
  ChatPushClient,
  getPlatform,
  getDeviceType,
} from 'react-native-push-collection';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const env = require('./env.ts');
console.log('env:', env);

const MessageItemView = React.memo(props => {
  const {item, onLongPress} = props;
  const onPress = React.useCallback(() => {
    onLongPress?.(item);
  }, [item, onLongPress]);
  return (
    <Pressable style={styles.listItem} onPress={onPress}>
      <Text style={styles.id}>{item.id}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </Pressable>
  );
});

export default function App() {
  const pushTypeMemo = React.useMemo(() => {
    let ret;
    const platform = getPlatform();
    if (platform === 'ios') {
      ret = 'apns';
    } else {
      ret = getDeviceType() ?? 'unknown';
    }
    return ret;
  }, []);

  const [pushType, setPushType] = React.useState(pushTypeMemo);
  const pushTypeRef = React.useRef(pushType);
  const appKeyRef = React.useRef(env.appKey);
  const deviceIdRef = React.useRef(env.deviceIds[pushTypeRef.current]);
  const tokenRef = React.useRef();
  const contentInputRef = React.useRef(null);
  const [data, setData] = React.useState([]);
  const [userId, setUserId] = React.useState(env.userId);
  const [userToken, setUserToken] = React.useState(env.userToken);
  const [targetId, setTargetId] = React.useState(env.targetId);
  const [content, setContent] = React.useState('');
  const [appKey, setAppKey] = React.useState(appKeyRef.current);

  const onLog = React.useCallback(c => {
    console.log(c);
    const t = `log: ${c}`;
    setData(prev => {
      return [{id: new Date().getTime().toString(), text: t}, ...prev];
    });
  }, []);

  const setValueToLocal = React.useCallback(
    async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        onLog('setValueToLocal:error:' + JSON.stringify(error));
      }
    },
    [onLog],
  );

  const getValueFromLocal = React.useCallback(
    async key => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        onLog('getValueFromLocal:error:' + JSON.stringify(error));
      }
    },
    [onLog],
  );

  const onChangePushType = t => {
    setPushType(t);
    if (t === 'fcm') {
      setValueToLocal('pushType', 'fcm');
    } else {
      setValueToLocal('pushType', pushTypeMemo);
    }
  };

  const init = React.useCallback(() => {
    onLog(`push:init:start: ${pushTypeRef.current}, ${deviceIdRef.current}`);
    ChatPushClient.getInstance()
      .init({
        platform: getPlatform(),
        pushType: pushTypeRef.current,
      })
      .then(() => {
        onLog('push:init:success');
        ChatPushClient.getInstance().addListener({
          onError: error => {
            onLog('onError:' + JSON.stringify(error));
          },
          onReceivePushMessage: message => {
            onLog('onReceivePushMessage:' + JSON.stringify(message));
          },
          onReceivePushToken: token => {
            onLog('onReceivePushToken:' + token);
            if (token) {
              tokenRef.current = token;
              Clipboard.setString(token);
              ChatClient.getInstance()
                .updatePushConfig(
                  new ChatPushConfig({
                    deviceId: deviceIdRef.current,
                    deviceToken: token,
                  }),
                )
                .then(() => {
                  onLog('updatePushConfig:success');
                })
                .catch(e => {
                  onLog('updatePushConfig:error:' + JSON.stringify(e));
                });
            }
          },
        });
      })
      .catch(e => {
        onLog('push:init:failed:' + JSON.stringify(e));
      });

    ChatClient.getInstance()
      .init(
        new ChatOptions({
          autoLogin: false,
          debugModel: true,
          appKey: appKey,
          pushConfig: new ChatPushConfig({
            deviceId: deviceIdRef.current,
            deviceToken: tokenRef.current,
          }),
        }),
      )
      .then(() => {
        onLog('chat:init:success');
        ChatClient.getInstance().addConnectionListener({
          onConnected: () => {
            onLog('onConnected');
          },
          onDisconnected: () => {
            onLog('onDisconnected');
          },
        });
      })
      .catch(e => {
        onLog('chat:init:failed:' + JSON.stringify(e));
      });
  }, [appKey, onLog]);

  const onInit = () => {
    init();
  };

  const onGetTokenAsync = async () => {
    onLog('push:getTokenFlow:start');
    const ret = await requestPermission();
    if (ret === false) {
      return;
    }
    ChatPushClient.getInstance()
      .getTokenFlow()
      .then(() => {
        onLog('push:getTokenFlow:success');
      })
      .catch(e => {
        onLog('push:getTokenFlow:failed:' + JSON.stringify(e));
      });
  };

  const onRegister = async () => {
    onLog('push:registerPush:start');
    const ret = await requestPermission();
    if (ret === false) {
      return;
    }
    ChatPushClient.getInstance()
      .registerPush()
      .then(() => {
        onLog('push:registerPush:success');
      })
      .catch(e => {
        onLog('push:registerPush:failed:' + JSON.stringify(e));
      });
  };

  const onGetToken = async () => {
    onLog('push:getToken:start');
    const ret = await requestPermission();
    if (ret === false) {
      return;
    }
    ChatPushClient.getInstance()
      .getToken()
      .then(token => {
        onLog('push:getToken:success:' + token);
        tokenRef.current = token;
        if (token) {
          Clipboard.setString(token);
        }
        ChatClient.getInstance()
          .updatePushConfig(
            new ChatPushConfig({
              deviceId: deviceIdRef.current,
              deviceToken: token,
            }),
          )
          .then(() => {
            onLog('updatePushConfig:success');
          })
          .catch(e => {
            onLog('updatePushConfig:error:' + JSON.stringify(e));
          });
      })
      .catch(e => {
        onLog('push:getToken:failed:' + JSON.stringify(e));
      });
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const version = Platform.Version;
      if (version >= 33) {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (status === PermissionsAndroid.RESULTS.GRANTED) {
          onLog('push:requestPermission:success');
          return true;
        } else {
          return false;
        }
      }
    }
    return true;
  };

  const onLoginAction = () => {
    onLog('chat:login:start');
    ChatClient.getInstance()
      .login(userId, userToken, true)
      .then(() => {
        onLog('chat:login:success');
        ChatClient.getInstance().chatManager.addMessageListener({
          onMessagesReceived: messages => {
            for (const msg of messages) {
              if (msg.body.type === ChatMessageType.TXT) {
                const body = msg.body;
                setData(prev => {
                  return [{id: msg.msgId, text: body.content}, ...prev];
                });
              }
            }
          },
        });
      })
      .catch(e => {
        onLog('chat:login:failed:' + JSON.stringify(e));
      });
  };

  const onLogoutAction = () => {
    onLog('chat:logout:start');
    ChatClient.getInstance()
      .logout(true)
      .then(() => {
        onLog('chat:logout:success');
      })
      .catch(e => {
        onLog('chat:logout:failed:' + JSON.stringify(e));
      });
  };

  const onSendMessage = () => {
    onLog('chat:sendMessage:start');
    const msg = ChatMessage.createTextMessage(
      targetId,
      content,
      ChatMessageChatType.PeerChat,
    );
    ChatClient.getInstance().chatManager.sendMessage(msg, {
      onError: e => {
        onLog('chat:sendMessage:failed:' + JSON.stringify(e));
      },
      onSuccess: newMsg => {
        const body = newMsg.body;
        setData(prev => {
          return [{id: newMsg.msgId, text: body.content}, ...prev];
        });
        contentInputRef.current?.clear();
      },
    });
  };

  const onChangeAppKey = key => {
    setAppKey(key);
  };

  const onChangeUserId = u => {
    setUserId(u);
  };

  const onChangeUserToken = t => {
    setUserToken(t);
  };

  const onChangeTargetId = t => {
    setTargetId(t);
  };

  const onChangeContent = c => {
    setContent(c);
  };

  const onLongPress = React.useCallback(
    props => {
      Clipboard.setString(props.text);
      onLog('copy to clipboard:' + props.text);
    },
    [onLog],
  );

  const renderItem = info => {
    const {item} = info;
    return <MessageItemView item={item} onLongPress={onLongPress} />;
  };

  React.useEffect(() => {
    getValueFromLocal('pushType').then(v => {
      const p = v ?? pushTypeMemo;
      setPushType(p);
      pushTypeRef.current = p;
      deviceIdRef.current = env.deviceIds[p];
      onLog(`useEffect:pushType:${v},${p},${deviceIdRef.current}`);
    });
  }, [getValueFromLocal, onLog, pushTypeMemo]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.target}>
          <KeyboardAvoidingView style={styles.input}>
            <TextInput
              onChangeText={onChangePushType}
              placeholder="pushtype: fcm, apns, ..."
              autoCapitalize="none"
              value={pushType}
            />
            <Text style={styles.warn}>
              {'!!!Restart the app to take effect.'}
            </Text>
          </KeyboardAvoidingView>
        </View>
      </TouchableNativeFeedback>

      <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.target}>
          <KeyboardAvoidingView style={styles.input}>
            <TextInput
              onChangeText={onChangeAppKey}
              placeholder="appkey:"
              autoCapitalize="none"
              value={appKey}
            />
          </KeyboardAvoidingView>
        </View>
      </TouchableNativeFeedback>

      <TouchableHighlight
        underlayColor={'#fffaf0'}
        style={styles.button}
        onPress={onInit}>
        <Text>{'init action'}</Text>
      </TouchableHighlight>

      <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.target}>
          <KeyboardAvoidingView style={styles.input}>
            <TextInput
              onChangeText={onChangeUserId}
              placeholder="user id"
              autoCapitalize="none"
              value={userId}
            />
          </KeyboardAvoidingView>
          <KeyboardAvoidingView style={styles.input}>
            <TextInput
              onChangeText={onChangeUserToken}
              placeholder="user pass"
              autoCapitalize="none"
              value={userToken}
            />
          </KeyboardAvoidingView>
        </View>
      </TouchableNativeFeedback>

      <View style={styles.buttonList}>
        <TouchableHighlight
          underlayColor={'#fffaf0'}
          style={styles.button}
          onPress={onLoginAction}>
          <Text>{'login action'}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={'#fffaf0'}
          style={styles.button}
          onPress={onGetTokenAsync}>
          <Text>{'get token async'}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={'#fffaf0'}
          style={styles.button}
          onPress={onRegister}>
          <Text>{'register async'}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={'#fffaf0'}
          style={styles.button}
          onPress={onGetToken}>
          <Text>{'get token'}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor={'#fffaf0'}
          style={styles.button}
          onPress={onLogoutAction}>
          <Text>{'logout action'}</Text>
        </TouchableHighlight>
      </View>

      <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.target}>
          <Text>{'target id:'}</Text>
          <KeyboardAvoidingView style={styles.input}>
            <TextInput
              onChangeText={onChangeTargetId}
              placeholder="target id"
              autoCapitalize="none"
              value={targetId}
            />
          </KeyboardAvoidingView>
        </View>
      </TouchableNativeFeedback>

      <TouchableNativeFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.target}>
          <Text>{'content:'}</Text>
          <KeyboardAvoidingView style={styles.content}>
            <TextInput
              ref={contentInputRef}
              onChangeText={onChangeContent}
              placeholder="text content"
              autoCapitalize="none"
            />
          </KeyboardAvoidingView>
        </View>
      </TouchableNativeFeedback>

      <TouchableHighlight
        underlayColor={'#fffaf0'}
        style={styles.button}
        onPress={onSendMessage}>
        <Text>{'send text message'}</Text>
      </TouchableHighlight>

      <View style={styles.list}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => {
            return item.id;
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
  },
  button: {
    height: 40,
    minWidth: 50,
    margin: 4,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    maxWidth: '100%',
    flexDirection: 'row',
    margin: 2,
  },
  input: {
    flex: 1,
    height: Platform.select({ios: 30, android: undefined}),
    backgroundColor: 'lightyellow',
    margin: 2,
  },
  content: {
    flex: 1,
    height: Platform.select({ios: 30, android: undefined}),
    backgroundColor: 'lightyellow',
  },
  list: {
    flex: 1,
    backgroundColor: 'lightyellow',
  },
  listItem: {
    margin: 2,
    flexDirection: 'row',
    backgroundColor: 'lightyellow',
    // height: 20,
  },
  id: {
    color: 'black',
  },
  text: {
    color: 'red',
    flex: 1,
  },
  warn: {
    color: 'red',
  },
  buttonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
