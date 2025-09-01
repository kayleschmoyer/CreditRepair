declare module 'react-dom/experimental' {
  export function useFormState<T>(
    action: (formData: FormData) => Promise<T>,
    initialState: T
  ): [T, (formData: FormData) => Promise<T>];
}
