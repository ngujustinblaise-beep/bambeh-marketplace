let _mainOrigin = "/";

const setMainOrigin = (path: string): void => {
  _mainOrigin = path;
};

export default setMainOrigin;
export { setMainOrigin };

export const getMainOrigin = (): string => _mainOrigin;
