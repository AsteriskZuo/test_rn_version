# 介绍

这项目为了测试 react native 0.72 版本 library 的兼容性。

通过命令 `npx react-native@0.71.11 init --template react-native@0.67.5 test_rn_067` 或者 `npx @react-native-community/cli init --version 0.66 test_rn_066` 创建项目，集成 `react-native-chat-sdk` 进行编译和运行，最终得到了验证结果。

| version | ios     | ios(turbo) | android | android(turbo) | remark                                                             |
| ------- | ------- | ---------- | ------- | -------------- | ------------------------------------------------------------------ |
| 0.66    | success | /          | success | /              | node <= 16                                                         |
| 0.67    | success | /          | success | /              | node <= 16                                                         |
| 0.68    | success | fail       | success | fail           | Turbo failed: SDK integration did not generate dynamic native code |
| 0.69    | success | fail       | success | fail           | Turbo failed: SDK integration did not generate dynamic native code |
| 0.71    | success | success    | success | success        |                                                                    |
| 0.72    | success | success    | success | success        |                                                                    |
| 0.73    | success | success    | success | success        |                                                                    |
| 0.74    | success | success    | success | success        |                                                                    |
| 0.75    | success | success    | success | success        |                                                                    |
| 0.76    | success | success    | success | success        |                                                                    |

| version | download count | download percentage |
| ------- | -------------- | ------------------- |
| 0.74    | 628264         | 0.2322              |
| 0.76    | 505184         | 0.1867              |
| 0.73    | 321263         | 0.1188              |
| 0.72    | 305049         | 0.1128              |
| 0.75    | 270733         | 0.1001              |
| 0.67    | 144373         | 0.0534              |
| 0.71    | 131155         | 0.0485              |
| 0.60    | 102272         | 0.0378              |
| 0.64    | 67155          | 0.0248              |
| 0.63    | 38843          | 0.0144              |
