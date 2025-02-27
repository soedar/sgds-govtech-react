import classNames from 'classnames';
import * as React from 'react';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useUncontrolled } from 'uncontrollable';
import {
  SGDSWrapper,
  useBootstrapPrefix,
} from '../ThemeProvider/ThemeProvider';
import SideNavButton from './SideNavButton';
import SideNavCollapse from './SideNavCollapse';
import SideNavContext, {
  SideNavEventKey,
  SideNavSelectCallback,
} from './SideNavContext';
import SideNavItem from './SideNavItem';
import {
  BsPrefixProps,
  BsPrefixRefForwardingComponent,
} from '../utils/helpers';
import SideNavLink from './SideNavLink';

export interface SideNavProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'>,
    BsPrefixProps {
  /** The current active key that corresponds to the currently expanded card */
  activeKey?: SideNavEventKey;
  /**The current active SideNavLink. Its value should point to one of the `eventKey` value of SideNavLink */
  activeNavLinkKey?: string;
  /** The default active key that sets an sidenav item to be expanded on start, value should correspond to assigned `eventKey` prop */
  defaultActiveKey?: SideNavEventKey;
  /**
   * A callback fired when a descendant of a child `<SideNav>` is selected.
   *
   * ```js
   * function (
   *  eventKey: string | string[] | null | undefined,
   *  event?: SyntheticEvent
   * )
   * ```
   */
  onSelect?: SideNavSelectCallback;
  /** Allow accordion items to stay open when another item is opened */
  alwaysOpen?: boolean;
  /** Apply position sticky to the sidenav with a default top and max-height so that sidenav sticks during scrolling */
  sticky?: boolean;
}

const propTypes = {
  /** Set a custom element for this component */
  as: PropTypes.elementType,

  /** @default 'sidenav' */
  bsPrefix: PropTypes.string,

  /** The current active key that corresponds to the currently expanded card */
  activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),

  /** The default active key that is expanded on start */
  defaultActiveKey: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  /** Allow accordion items to stay open when another item is opened */
  alwaysOpen: PropTypes.bool,
  /** The current active NavLink that corresponds to the currently expanded card */
  activeNavLinkKey: PropTypes.string,
  sticky: PropTypes.bool,
};

const SideNav: BsPrefixRefForwardingComponent<'ul', SideNavProps> =
  React.forwardRef<HTMLElement, SideNavProps>((props, ref) => {
    const {
      // Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
      as: Component = 'ul',
      activeKey,
      bsPrefix,
      className,
      onSelect,
      alwaysOpen,
      activeNavLinkKey = '',
      sticky = false,
      ...controlledProps
    } = useUncontrolled(props, {
      activeKey: 'onSelect',
    });
    const prefix = useBootstrapPrefix(bsPrefix, 'sidenav');
    const contextValue = useMemo(
      () => ({
        activeEventKey: activeKey,
        onSelect,
        alwaysOpen,
        activeLinkKey: activeNavLinkKey,
      }),
      [activeKey, onSelect, alwaysOpen, activeNavLinkKey]
    );
    return (
      <SideNavContext.Provider value={contextValue}>
        <SGDSWrapper
          as={Component}
          ref={ref}
          {...controlledProps}
          className={classNames(
            className,
            prefix,
            'list-unstyled',
            sticky && 'sticky'
          )}
        />
      </SideNavContext.Provider>
    );
  });

SideNav.displayName = 'SideNav';
SideNav.propTypes = propTypes;

export default Object.assign(SideNav, {
  Button: SideNavButton,
  Collapse: SideNavCollapse,
  Item: SideNavItem,
  Link: SideNavLink,
});
