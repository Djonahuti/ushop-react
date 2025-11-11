// Stub file - Supabase has been migrated to PHP API
// This file exists only to prevent import errors during migration
// All functionality should use the PHP API via apiGet, apiPost, etc.
// DO NOT import @supabase/supabase-js here - it will cause initialization errors

// Create a mock that returns promises to satisfy TypeScript and runtime expectations
const createMockPromise = <T>(value: T) => Promise.resolve(value);

const stubSupabase = {
  auth: {
    getUser: () => createMockPromise({ data: { user: null }, error: null }),
    signOut: () => createMockPromise({ error: null }),
    signUp: () => createMockPromise({ data: { user: null }, error: null }),
    signInWithPassword: () => createMockPromise({ data: { user: null }, error: null }),
    updateUser: () => createMockPromise({ data: { user: null }, error: null }),
  },
  from: (_table: string) => ({
    select: (_columns?: string) => ({
      data: [],
      error: null,
      eq: (_column: string, _value: any) => ({
        data: [],
        error: null,
        single: () => createMockPromise({ data: null, error: null }),
        then: (onResolve: any) => createMockPromise({ data: [], error: null }).then(onResolve),
        order: (_col: string, _opts?: any) => ({
          data: [],
          error: null,
          then: (onResolve: any) => createMockPromise({ data: [], error: null }).then(onResolve),
        }),
      }),
      order: (_column: string, _options?: any) => ({
        data: [],
        error: null,
        then: (onResolve: any) => createMockPromise({ data: [], error: null }).then(onResolve),
      }),
      in: (_column: string, _values: any[]) => ({
        eq: (_col: string, _val: any) => createMockPromise({ data: null, error: null, count: 0 }),
        then: (onResolve: any) => createMockPromise({ data: null, error: null, count: 0 }).then(onResolve),
      }),
      then: (onResolve: any) => createMockPromise({ data: [], error: null }).then(onResolve),
    }),
    insert: (_values: any) => ({
      data: null,
      error: null,
      select: (_columns?: string) => ({
        single: () => createMockPromise({ data: null, error: null }),
        then: (onResolve: any) => createMockPromise({ data: null, error: null }).then(onResolve),
      }),
      then: (onResolve: any) => createMockPromise({ data: null, error: null }).then(onResolve),
    }),
    update: (_values: any) => ({
      data: null,
      error: null,
      eq: (_column: string, _value: any) => createMockPromise({ data: null, error: null }),
      then: (onResolve: any) => createMockPromise({ data: null, error: null }).then(onResolve),
    }),
    delete: () => ({
      data: null,
      error: null,
      eq: (_column: string, _value: any) => createMockPromise({ data: null, error: null }),
      then: (onResolve: any) => createMockPromise({ data: null, error: null }).then(onResolve),
    }),
  }),
  storage: {
    from: (_bucket: string) => ({
      upload: (_path: string, _file: File) => createMockPromise({ data: { path: null }, error: null }),
    }),
  },
};

export default stubSupabase;
