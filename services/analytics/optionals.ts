class Optional {
  identifier: string;
  loader: () => Promise<Optional>;

  accepted?: boolean;

  _loadPromise: Promise<Optional> | undefined;
  _acceptPromise: Promise<Optional> | undefined;
  _requirePromise: Promise<any>;
  _requirePromiseResolve: any;
  _requirePromiseReject: any;

  constructor(identifier: string, loader: () => any) {
    if (!identifier) {
      throw new Error('missing required: identifier');
    }

    this.identifier = identifier;
    this.loader = loader;
    this.accepted = false;

    this._loadPromise = undefined;
    this._acceptPromise = undefined;
    this._requirePromise = new Promise((resolve, reject) => {
      this._requirePromiseResolve = resolve;
      this._requirePromiseReject = reject;
    });
  }

  // _load unconditionally runs the specified loader, once
  // it should not be called directly / it implies acceptance
  _load() {
    if (this._loadPromise) {
      return this._loadPromise;
    }
    return (this._loadPromise = new Promise<Optional>((resolve, reject) => {
      if (!this.loader) {
        resolve(this);
        return;
      }

      const loading = this.loader();
      if (Object.prototype.isPrototypeOf.call(Promise, loading)) {
        loading
          .then((loaded) => {
            resolve(loaded || this);
          })
          .catch((error: any) => {
            reject(error);
          });
        return;
      }

      resolve(loading);
    }));
  }

  // accept triggers the loader and resolves and require() promises
  accept() {
    this.accepted = true;
    if (this._acceptPromise) {
      return this._acceptPromise;
    }
    return (this._acceptPromise = this._load()
      .then((loaded) => {
        this._requirePromiseReject = undefined;
        this._requirePromiseResolve(loaded);
        return Promise.resolve(this);
      })
      .catch((error) => {
        if (!this._requirePromiseReject) {
          return Promise.resolve(this);
        }
        const reject = this._requirePromiseReject;
        this._requirePromiseReject = undefined;
        reject(error);
        return Promise.resolve(this);
      }));
  }

  // reject rejects any require() promises
  reject(error: any) {
    this.accepted = false;
    if (!this._requirePromiseReject) {
      return Promise.resolve(this);
    }
    const reject = this._requirePromiseReject;
    this._requirePromiseReject = null;
    reject(error || 'rejected');
    return Promise.resolve(this);
  }

  // require returns a promise which is resolved if the optional is both
  // accepted and loaded, or rejected if the optional is rejected or fails to
  // load
  require() {
    return this._requirePromise;
  }
}

export class Optionals {
  optionals: {
    [key: string]: Optional;
  };

  constructor() {
    this.optionals = {};
  }

  addOptional(identifier: string, loader: () => any) {
    const optional = new Optional(identifier, loader);

    this.optionals = { ...this.optionals, [optional.identifier]: optional };
  }

  acceptAll() {
    const optionals = [];
    for (const optional of Object.values(this.optionals)) {
      optionals.push(optional.accept());
    }

    return Promise.all(optionals);
  }

  rejectAll() {
    const optionals = [];

    for (const optional of Object.values(this.optionals)) {
      optionals.push(optional.reject('Option rejected!'));
    }

    return Promise.all(optionals);
  }

  async rejectUnaccepted() {
    const optionals: Optional[] = [];

    for (const optional of Object.values(this.optionals)) {
      if (optional.accepted) {
        continue;
      }
      optionals.push(await optional.reject('Option unaccepted!'));
    }

    return Promise.all(optionals);
  }

  requireOptional(identifier: string) {
    if (!this.optionals[identifier]) {
      return Promise.reject(new Error('unknown optional: ' + identifier));
    }

    return this.optionals[identifier].require();
  }

  hasOptional(identifier: string) {
    return this.optionals[identifier] && this.optionals[identifier].accepted;
  }

  setCookie(cookie: string) {
    const accepted = [];
    for (const optional of Object.values(this.optionals)) {
      if (optional.accepted) {
        accepted.push(optional.identifier);
      }
    }
    if (accepted.length === 0) {
      accepted.push('nada');
    }

    const expires = new Date();
    expires.setHours(365 * 24);
    window.document.cookie = [
      cookie + '=' + accepted.join(','),
      'domain= ' + window.location.hostname,
      'expires=' + expires.toUTCString(),
      'path=/'
    ].join(';');
  }

  getCookie(cookie: string) {
    const found = window.document.cookie.split('; ').find((candidate) => {
      return candidate.startsWith(cookie + '=');
    });

    if (!found) {
      return undefined;
    }
    return found.split('=')[1].split(',');
  }

  async loadCookie(cookie: string) {
    const cookies: string[] | undefined = this.getCookie(cookie);
    if (!cookies) return Promise.reject(new Error(`Cannot find ${cookie}!`));

    const accepted: Optional[] = [];
    if (!cookies.find((v) => v === 'nada')) {
      for (const listed of cookies) {
        if (this.optionals[listed]) {
          accepted.push(await this.optionals[listed].accept());
        }
      }
    }

    const rejectUnaccepted = await this.rejectUnaccepted();

    accepted.push(...rejectUnaccepted);
    return Promise.all(accepted);
  }
}

export default Optionals;
