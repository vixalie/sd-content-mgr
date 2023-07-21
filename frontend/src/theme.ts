import { ColorScheme } from '@mantine/core';
import { equals, ifElse, max, path, propEq, reverse } from 'ramda';

const bgColorSelectFn = ifElse(
  propEq('colorScheme', 'light'),
  path(['colors', 'cbg', 8]),
  path(['colors', 'cbg', 0])
);
const fgColorSelectFn = ifElse(
  propEq('colorScheme', 'light'),
  path(['colors', 'cfg', 0]),
  path(['colors', 'cfg', 8])
);

export function useAppTheme(scheme: ColorScheme = 'light') {
  return {
    colorScheme: scheme,
    focusRing: 'never',
    defaultRadius: 'xs',
    colors: {
      cfg: [
        '#0f0f0f',
        '#151515',
        '#262626',
        '#414141',
        '#626262',
        '#878787',
        '#acacac',
        '#cecece',
        '#e8e8e8',
        '#f9f9f9'
      ],
      cbg: [
        '#1a202c',
        '#1e2533',
        '#2a3446',
        '#3c4a65',
        '#53678b',
        '#7689ad',
        '#a0adc6',
        '#c6cedd',
        '#e5e8ef',
        '#f8f9fb'
      ],
      dark: reverse([
        '#1a202c',
        '#1e2533',
        '#2a3446',
        '#3c4a65',
        '#53678b',
        '#7689ad',
        '#a0adc6',
        '#c6cedd',
        '#e5e8ef',
        '#f8f9fb'
      ])
    },
    primaryColor: 'indigo',
    primaryShade: 6,
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    globalStyles: theme => ({
      'html, body': {
        height: '100vh',
        color: fgColorSelectFn(theme),
        backgroundColor: bgColorSelectFn(theme)
      },
      '#root': {
        height: '100%'
      },
      a: {
        textDecoration: 'none',
        color: fgColorSelectFn(theme),
        '&:hover, &:active': {
          textDecoration: 'none'
        }
      }
    }),
    components: {
      Tooltip: {
        defaultProps: theme => ({
          color: equals(theme.colorScheme, 'dark') ? 'teal' : 'lime'
        })
      },
      Badge: {
        defaultProps: theme => ({
          radius: 'xs'
        })
      },
      Anchor: {
        defaultProps: theme => ({
          underline: false
        }),
        styles: theme => ({
          root: {
            color: theme.colors[theme.primaryColor][theme.primaryShade],
            '&:hover': {
              color: theme.colors[theme.primaryColor][max(0, theme.primaryShade - 3)]
            }
          }
        })
      },
      Breadcrumbs: {
        styles: theme => ({
          breadcrumb: {
            paddingLeft: theme.spacing.sm,
            paddingRight: theme.spacing.sm
          }
        })
      },
      Drawer: {
        defaultProps: theme => ({
          overlayColor: equals(theme.colorScheme, 'dark')
            ? theme.colors.cbg[0]
            : theme.colors.gray[2],
          overlayOpacity: 0.35,
          overlayBlur: 5
        })
      }
    }
  };
}
