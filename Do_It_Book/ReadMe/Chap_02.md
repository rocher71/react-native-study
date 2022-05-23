# 2. 리액트 네이티브 기본 다지기

## 2-2. JSX 구문 탐구하기

- 조건에 따라 분기되는 JSX문 작성법

1. if문을 JSX 문 바깥쪽에 구현

```jsx
export default function App() {
  const isLoading = true;
  if (isLoading) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView>
      <Text>Hello JSX world!</Text>
    </SafeAreaView>
  );
}
```

2. 조건문을 단축 평가 코드로 바꾸기

```jsx
export default function App() {
  const isLoading = true;
  return (
    <SafeAreaView>
      {isLoading && <Text>Loading...</Text>}
      {!isLoading && <Text>Hello JSX world!</Text>}
    </SafeAreaView>
  );
}
```

3. JSX문을 변수에 담기

```jsx
export default function App() {
  const isLoading = true;
  const children = isLoading ? (
    <Text>Loading...</Text>
  ) : (
    <Text>Hello JSX world!</Text>
  );
  return <SafeAreaView>{children}</SafeAreaView>;
}
```
