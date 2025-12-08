import {
  HomeFontIcon,
  AllOutFontIcon,
  SettingsInputComponentFontIcon,
  DevicesOtherFontIcon,
  BatteryUnknownFontIcon,
  TransformFontIcon,
  ErrorFontIcon,
  PeopleFontIcon,
} from '@react-md/material-icons';
import { ReactComponent as TrendSVGIcon } from './sections/Trend/Trend.svg';
import { ReactNode } from 'react';

/**
 * Note: The `parentId` **must** be defaulted to `null` for the navigation tree
 * to render correctly since this uses the @react-md/tree package behind the
 * scenes. Each item that has a `parentId` set to `null` will appear at the root
 * level of your navigation tree.
 */
interface NavItem {
  itemId: string;
  parentId: string | null;
  to: string;
  children: ReactNode;
  leftAddon: ReactNode;
}

interface CreateRouteFn {
  (
    pathname: string,
    children: ReactNode,
    leftAddon: ReactNode,
    parentId?: string | null
  ): NavItem;
}

const createRoute: CreateRouteFn = (
  pathname,
  children,
  leftAddon,
  parentId = null
) => {
  return {
    itemId: pathname,
    parentId,
    to: pathname,
    children,
    leftAddon,
  };
};

const navItems = {
  '/': createRoute('/', 'Home', <HomeFontIcon />),
  '/types': createRoute('/types', 'Types', <AllOutFontIcon />),
  '/um': createRoute('/um', 'um', <TransformFontIcon />),
  '/logicState': createRoute(
    '/logicState',
    'Logic State',
    <TransformFontIcon />,
  ),
  '/templates': createRoute(
    '/templates',
    'Device Templates',
    <BatteryUnknownFontIcon />,
  ),
  '/devices': createRoute('/devices', 'Devices', <DevicesOtherFontIcon />),
  '/users': createRoute('/users', 'Users', <PeopleFontIcon />),
  '/alarms': createRoute('/alarms', 'Alarms', <ErrorFontIcon />),
  '/tags': createRoute('/tags', 'Tags', <SettingsInputComponentFontIcon />),
  '/controls': createRoute(
    '/controls',
    'Controls',
    <SettingsInputComponentFontIcon />,
  ),
  '/trend': createRoute('/trend', 'Trend', <TrendSVGIcon />),
};

export default navItems;

//  "/oven": createRoute("/oven", "Oven", <WhatshotSVGIcon />),
