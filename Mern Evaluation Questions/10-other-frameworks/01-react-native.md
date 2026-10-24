# React Native

### 1. Difference between React and React Native?

React renders web UI to the DOM with HTML and CSS. React Native uses the same component and state model but renders platform-native mobile views (View, Text, Image instead of div, p, img), using platform styling rather than browser CSS.

### 2. What does it mean that React Native is cross platform?

It means one JavaScript or TypeScript codebase can target iOS and Android while rendering native controls. Platform-specific code is still available (Platform.OS, .ios.tsx/.android.tsx files) when behavior, navigation, permissions, or UI conventions differ.

### 3. What is StyleSheet.create?

StyleSheet.create defines and validates React Native style objects, improving organization and allowing implementation-level optimization. It is not CSS; properties are camelCase and layout follows React Native's styling model, largely based on Flexbox (with flexDirection defaulting to column).

### 4. What is a FlatList component?

FlatList is React Native's performant virtualized list for potentially large data sets. It renders visible items lazily and supports keyExtractor, pull-to-refresh, onEndReached pagination callbacks, and renderItem without the cost of mounting every row.

### 5. What is a ScrollView component?

ScrollView renders all of its children at once inside a scrollable container. It is convenient for small static content but unsuitable for long lists, where FlatList or SectionList virtualization prevents memory and responsiveness issues.

### 6. What is AsyncStorage?

AsyncStorage is an asynchronous key-value persistence API for React Native, used for non-sensitive preferences or cached data. It is not encrypted secure storage, so secrets and authentication credentials should use Keychain or Keystore-backed solutions such as expo-secure-store.
