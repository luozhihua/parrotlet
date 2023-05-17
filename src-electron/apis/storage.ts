import Storage from 'electron-store';

const storage = new Storage({
  name: 'parrotlet',
  serialize: (value: Record<string, unknown>) => JSON.stringify(value, null, 4),
  schema: {
    projects: {
      type: 'array',
      minItems: 0,
      items: {
        type: 'object',
        required: ['id', 'name', 'path', 'language'],
        properties: {
          id: { type: 'string', minLength: 8, maxLength: 8 },
          name: { type: 'string', minLength: 2, maxLength: 20 },
          path: { type: 'string', minLength: 1 },
          language: { type: 'string' },
          enabledLanguages: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          logo: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },

    setting: {
      type: 'object',
      properties: {
        language: { type: 'string', default: 'en-US' },
        languages: { type: 'object' },
        uimode: {
          type: 'string',
          default: 'auto',
          enum: ['darkness', 'brightness', 'auto'],
        },
        proxy: {
          type: 'object',
          properties: {
            enable: { type: 'boolean', default: false },
            type: {
              type: 'string',
              default: 'http',
              enum: ['http', 'https', 'socks', 'pac'],
            },
            http: { type: 'string', default: '' },
            https: { type: 'string', default: '' },
            socks: { type: 'string', default: '' },
            pac: { type: 'string', default: '' },
          },
        },
      },
    },
  },

  defaults: {
    projects: [],
    setting: {
      language: 'en',
      uimode: 'auto',
      proxy: { enable: false },
    },
  },
});

export const piniaPersistence = {
  get path() {
    return storage.path;
  },

  setItem(key: string, value: string) {
    key = key.replace('parrotlet-store-', '');
    value = JSON.parse(value);
    storage.set(key, value);
  },

  getItem(key: string): string | null {
    key = key.replace('parrotlet-store-', '');
    return JSON.stringify(storage.get(key) as string | null);
  },

  removeItem(key: string) {
    storage.delete(key);
  },

  clear() {
    storage.clear();
  },
};

export default storage;
