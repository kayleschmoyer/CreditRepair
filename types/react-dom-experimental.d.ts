declare module 'react-dom/experimental' {
  export function useFormState<T>(action: any, initialState: T): [T, any];
}
