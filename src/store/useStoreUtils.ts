export class StoreError extends Error {
  constructor(message: string, public readonly critical: boolean = false) {
    super(message);
    this.name = 'StoreError';
    Object.setPrototypeOf(this, StoreError.prototype);
  }
}

export const createSafeStore = <T extends object>(
  config: (set: any, get: any, api: any) => T
) => {
  return (set: any, get: any, api: any): T => {
    const safeSet = (...args: any[]) => {
      try {
        return set(...args);
      } catch (error) {
        console.error('Store operation error:', error);
        throw new StoreError('Error en operación del store');
      }
    };

    try {
      return config(safeSet, get, api);
    } catch (error) {
      console.error('Store initialization error:', error);
      throw new StoreError('Error al inicializar store');
    }
  };
};