import LogoTheme from './Logo';

export default () => {
  const theme = {
    'Neurolab.Logo': {
      ...LogoTheme()
    },
  }
  return theme;
};