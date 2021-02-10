import * as colors from "./colors";
import hex2rgba from "hex2rgba";
import { ColorMode } from "theme-ui";

export const light = {
  primary: colors.blue,
  secondary: colors.purple,
  text: colors.grayDark,
  muted: colors.grayExtraLight,
  extraMuted: colors.grayUltraLight,
  link: colors.blue,
  background: colors.white,
  border: hex2rgba(colors.grayLight, 0.9),
  bgRow: colors.blueLight,
  search: {
    suggestionHighlightBackground: hex2rgba(colors.white, 0.6),
    suggestionHighlightColor: "inherit"
  },
  searchResults: {
    border: hex2rgba(colors.gray, 0.9),
    header: {
      background: colors.blue,
      color: colors.white
    },
    row: {
      border: colors.grayLight
    },
    subCategory: {
      background: colors.grayExtraLight
    },
    content: {
      background: hex2rgba(colors.grayLight, 0.6),
      color: colors.gray,
      highlight: {
        color: colors.green,
        background: hex2rgba(colors.gray, 0.1)
      }
    }
  },
  searchInput: {
    background: colors.grayExtraLight,
    backgroundFocus: colors.white,
    border: colors.gray,
    focusBorder: colors.white,
    focusBoxShadow: colors.blue,
    icon: colors.grayDark,
    iconFocus: colors.grayDark,
    placeholder: colors.grayDark
  },
  sidebar: {
    bg: colors.grayExtraLight,
    navGroup: colors.black,
    navLink: colors.black,
    navLinkActive: colors.blue,
    tocLink: colors.gray,
    tocLinkActive: colors.grayExtraDark
  },
  header: {
    bg: colors.white,
    text: colors.black,
    border: colors.grayLight,
    button: {
      color: colors.grayExtraDark
    }
  },
  props: {
    bg: colors.grayUltraLight,
    text: colors.grayDark,
    highlight: colors.blue,
    defaultValue: colors.gray,
    descriptionText: colors.grayDark,
    descriptionBg: colors.white
  },
  playground: {
    bg: colors.white,
    border: colors.grayLight
  },
  blockquote: {
    bg: colors.grayExtraLight,
    border: colors.grayLight,
    color: colors.gray
  },
  code: {
    color: colors.gray,
    backgroundcolor: colors.grayMedium
  }
};

export const dark = {
  primary: colors.blue,
  secondary: colors.purple,
  text: colors.white,
  muted: colors.gray,
  link: colors.skyBlue,
  background: colors.black,
  border: colors.white,
  search: {
    suggestionHighlightBackground: colors.blue,
    suggestionHighlightColor: colors.purple
  },
  searchInput: {
    background: colors.grayExtraLight,
    backgroundFocus: colors.white,
    border: colors.gray,
    focusBorder: colors.white,
    focusBoxShadow: colors.purple,
    icon: colors.grayDark,
    iconFocus: colors.grayDark,
    placeholder: colors.grayDark
  },
  sidebar: {
    bg: colors.black,
    navGroup: colors.gray,
    navLink: colors.grayLight,
    navLinkActive: colors.skyBlue,
    tocLink: colors.gray,
    tocLinkActive: colors.grayLight
  },
  header: {
    bg: colors.black,
    text: colors.white,
    border: colors.black,
    button: {
      color: colors.white
    }
  },
  props: {
    bg: colors.dark,
    text: colors.gray,
    highlight: colors.skyBlue,
    defaultValue: colors.grayDark,
    descriptionText: colors.gray,
    descriptionBg: colors.grayExtraDark
  },
  playground: {
    bg: colors.dark,
    border: colors.grayDark
  },
  blockquote: {
    bg: colors.grayDark,
    border: colors.gray,
    color: colors.gray
  },
  code: {
    color: colors.gray,
    backgroundcolor: colors.grayLight
  }
};
