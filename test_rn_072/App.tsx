/* eslint-disable react/react-in-jsx-scope */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import * as React from 'react';
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
} from 'react-native';
import {
  ChatClient,
  ChatError,
  ChatGroupEventListener,
  ChatMessage,
  ChatMessageStatusCallback,
  ChatOptions,
} from 'react-native-chat-sdk';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const appKey = '1135220126133718#demo';
const gid = 'asterisk003';
const gps = 'qwerty';
const peer = 'asterisk001';

function useApp() {
  const isDarkMode = useColorScheme() === 'dark';
  const [id, setId] = React.useState<string>(gid);
  const [token, setToken] = React.useState<string>(gps);
  const init = () => {
    ChatClient.getInstance()
      .init(new ChatOptions({appKey, debugModel: true}))
      .then(() => {
        console.log('init success');
        ChatClient.getInstance().groupManager.addGroupListener({
          onMemberExited: (params: {groupId: string; member: string}) => {
            console.log('test:zuoyu:onMemberExited', params);
          },
          onMemberRemoved: (params: {groupId: string; groupName?: string}) => {
            console.log('test:zuoyu:onMemberRemoved', params);
          },
        } as ChatGroupEventListener);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const login = () => {
    ChatClient.getInstance()
      .login(id, token, true)
      .then(() => {
        console.log('login success');
      })
      .catch(e => {
        console.log(e);
      });
  };
  const logout = () => {
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log('logout success');
      })
      .catch(e => {
        console.log(e);
      });
  };
  const custom = () => {
    ChatClient.getInstance()
      .groupManager.leaveGroup('264945479516163')
      .then()
      .catch();
  };
  const send = () => {
    const msg = ChatMessage.createTextMessage(peer, '1');
    ChatClient.getInstance()
      .chatManager.sendMessage(msg, {
        onError: (localMsgId: string, error: ChatError) => {
          console.log('onError', error);
        },
        onSuccess: (message: ChatMessage) => {
          console.log('onSuccess', message);
        },
      } as ChatMessageStatusCallback)
      .then(() => {
        console.log('send success');
      })
      .catch(e => {
        console.log(e);
      });
  };
  return {
    isDarkMode,
    id,
    setId,
    token,
    setToken,
    init,
    login,
    logout,
    custom,
    send,
  };
}

function App(): JSX.Element {
  const {
    isDarkMode,
    id,
    setId,
    token,
    setToken,
    init,
    login,
    logout,
    custom,
    send,
  } = useApp();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <TextInput
        style={{height: 40, borderColor: 'orange', borderWidth: 1, margin: 2}}
        value={id}
        onChangeText={setId}
      />
      <TextInput
        style={{height: 40, borderColor: 'orange', borderWidth: 1, margin: 2}}
        value={token}
        onChangeText={setToken}
      />
      <Pressable style={styles.test} onPress={init}>
        <Text>{'init'}</Text>
      </Pressable>
      <Pressable style={styles.test} onPress={login}>
        <Text>{'login'}</Text>
      </Pressable>
      <Pressable style={styles.test} onPress={logout}>
        <Text>{'logout'}</Text>
      </Pressable>
      <Pressable style={styles.test} onPress={custom}>
        <Text>{'custom'}</Text>
      </Pressable>
      <Pressable style={styles.test} onPress={send}>
        <Text>{'send'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  test: {
    height: 40,
    width: '100%',
    marginVertical: 5,
    backgroundColor: 'green',
  },
});

export default App;
