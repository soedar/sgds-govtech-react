import DropdownMenu from '../Dropdown/DropdownMenu';
import * as React from 'react';
import { FormControlProps } from '../Form/FormControl';
import FormLabel from '../Form/FormLabel';
import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { BsPrefixRefForwardingComponent } from '../utils/helpers';
import useMergedRefs from '@restart/hooks/useMergedRefs';
import DropdownItem from '../Dropdown/DropdownItem';
import Dropdown from '../Dropdown/Dropdown';
import FormControlToggle from '../Form/FormControlToggle';
import classNames from 'classnames';
import generateId from '../utils/generateId';

export type MenuPlacement = 'up' | 'down';
export type CustomFilter = (
  inputValue: string,
  menuItems: string[]
) => string[];
export interface ComboboxProps extends Omit<FormControlProps, 'type'> {
  /**Initial value of input */
  initialValue?: string;
  /** Placement of menu in relation to input */
  menuPlacement?: MenuPlacement;
  /** Array of values to pass into menu */
  menuList: string[];
  /** The onChange handler for Combobox's input change */
  onChangeInput?: (
    val: string,
    e?: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLLIElement>
  ) => void;
  /** Adds a FormLabel to `<Combobox />` */
  label?: string;
  /** Adds icon defined to FormControl */
  icon?: React.ReactElement;
  /** Enable y-axis scrolling of a menu with a default max-height of 480px */
  scrollable?: boolean;
  /** Filter method of the combobox. Defaults to 'startsWith'. Applying custom filter function to apply your custom logic filter  
   * `type CustomFilter = (inputValue: string, menuItems: string[]) => string[]`
  */
  filterMethod?: 'startsWith' | 'includes' | CustomFilter;
}

const propTypes = {
  initialValue: PropTypes.string,
  onChangeInput: PropTypes.func,
  menuPlacement: PropTypes.oneOf<MenuPlacement>(['up', 'down']),
  menuList: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string,
  icon: PropTypes.element.isRequired,
  scrollable: PropTypes.bool,
  filterMethod: PropTypes.oneOf(['startsWith', 'includes', PropTypes.func]),
};

interface ComboboxState {
  value: string;
  invalid: boolean;
  menuList: string[];
}

const defaultProps: Partial<ComboboxProps> = {
  menuPlacement: 'down',
  initialValue: '',
  icon: <i className="bi bi-chevron-down"></i>,
  filterMethod: 'startsWith'
};

const filterStartsWith = (inputValue: string, menuList: string[]) => {
  const filtered = menuList.filter((n) => {
    const nLowerCase = n.toLowerCase();
    const valueLower = inputValue.toLowerCase();
    return nLowerCase.startsWith(valueLower);
  });

  return filtered;
};

const filterIncludes = (inputValue: string, menuList: string[]) => {
  const filtered = menuList.filter((n) => {
    const nLowerCase = n.toLowerCase();
    const valueLower = inputValue.toLowerCase();
    return nLowerCase.includes(valueLower);
  });
  return filtered;
};

const filteredMenuList = (initialValue: string, filterMethod: 'startsWith' | 'includes' | CustomFilter, menuList: Array<string>) => {
  if(filterMethod === "startsWith"){
    return filterStartsWith(initialValue, menuList);
 }
 if (filterMethod === "includes") {
    return filterIncludes(initialValue, menuList);
 }
 return filterMethod(initialValue, menuList);
}

export const Combobox: BsPrefixRefForwardingComponent<'input', ComboboxProps> =
  React.forwardRef<HTMLInputElement, ComboboxProps>(
    (
      {
        menuPlacement = 'down',
        menuList,
        initialValue = '',
        onChangeInput,
        label = '',
        icon,
        scrollable,
        filterMethod = "startsWith",
        ...props
      },
      ref
    ) => {
      const formControlRef = useRef<HTMLInputElement>(null);
      const inputRef = useMergedRefs(
        ref as React.MutableRefObject<HTMLInputElement>,
        formControlRef
      );
      const [menuOpen, setIsMenuOpen] = useState(undefined);
      const initialState: ComboboxState = {
        value: initialValue,
        invalid: false,
        menuList: initialValue
          ? filteredMenuList(initialValue, filterMethod, menuList)
          : menuList,
      };
      const [state, setState] = useState(initialState);
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!menuOpen) {
          formControlRef.current?.click();
        }
        let filterMenuList: string[] = [];

        if (filterMethod instanceof Function) {
          filterMenuList = filterMethod(e.currentTarget.value, menuList);
        } else if (filterMethod === 'startsWith') {
          filterMenuList = filterStartsWith(e.currentTarget.value, menuList);
        } else if (filterMethod === 'includes') {
          filterMenuList = filterIncludes(e.currentTarget.value, menuList);
        }

        setState({
          ...state,
          value: e.currentTarget.value,
          menuList: filterMenuList,
        });
        if (onChangeInput) onChangeInput(e.currentTarget.value, e);
      };

      const controlProps = {
        onChange: handleChange,
        value: state.value,
        ref: inputRef,
        isInvalid: state.invalid,
        ...props,
      };

      const handleClickItem = (e: React.MouseEvent<HTMLLIElement>) => {
        if (onChangeInput) onChangeInput(e.currentTarget.textContent!, e);

        setState({
          ...state,
          value: e.currentTarget.textContent as string,
          menuList: state.menuList.filter(
            (c) => c === e.currentTarget.textContent!
          ),
        });
      };

      const focusDropdownItem = (
        event: React.FocusEvent<HTMLAnchorElement>
      ) => {
        setState({
          ...state,
          value: event.currentTarget.textContent as string,
        });
      };
      const [comboboxMenuId, setComboboxMenuId] = useState('');
      React.useEffect(() => {
        setComboboxMenuId(generateId('combobox', 'ul'));
      }, []);
      React.useEffect(() => {
        setState({...state, menuList: initialValue
          ? filteredMenuList(initialValue, filterMethod, menuList)
          : menuList})
      }, [menuList]);
      return (
        <>
          {label && <FormLabel htmlFor={props.id}>{label}</FormLabel>}
          <Dropdown
            className={classNames('combobox', scrollable && 'scrollable')}
            focusFirstItemOnShow={false}
            drop={menuPlacement}
          >
            <FormControlToggle
              {...controlProps}
              setIsMenuOpen={setIsMenuOpen}
              role="combobox"
              aria-autocomplete="list"
              aria-controls={comboboxMenuId}
            />
            {icon &&
              React.cloneElement(icon, {
                className: classNames(
                  icon.props.className,
                  'form-control-icon'
                ),
              })}
            {state.menuList.length > 0 && (
              <DropdownMenu id={comboboxMenuId} role="listbox">
                {state.menuList.map((menuItem) => (
                  <DropdownItem
                    as="button"
                    type="button"
                    key={menuItem}
                    onClick={handleClickItem}
                    onFocus={focusDropdownItem}
                  >
                    {menuItem}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </Dropdown>
        </>
      );
    }
  );

Combobox.displayName = 'Combobox';
Combobox.propTypes = propTypes;
Combobox.defaultProps = defaultProps;
export default Combobox;
