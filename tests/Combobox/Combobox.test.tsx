import {  render, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Combobox } from '../../src';
import { CustomFilter } from '../../src/Combobox/Combobox';
const menuList = [
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Anguilla',
  'Antigua &amp; Barbuda',
  'Argentina',
  'Armenia',
  'Aruba',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bermuda',
  'Bhutan',
  'Bolivia',
  'Bosnia &amp; Herzegovina',
  'Botswana',
  'Brazil',
  'British Virgin Islands',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Cape Verde',
  'Cayman Islands',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Congo',
  'Cook Islands',
  'Costa Rica',
  'Cote D Ivoire',
  'Croatia',
  'Cruise Ship',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Estonia',
  'Ethiopia',
  'Falkland Islands',
  'Faroe Islands',
  'Fiji',
  'Finland',
  'France',
  'French Polynesia',
  'French West Indies',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Gibraltar',
  'Greece',
  'Greenland',
  'Grenada',
  'Guam',
  'Guatemala',
  'Guernsey',
  'Guinea',
  'Guinea Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Isle of Man',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jersey',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kuwait',
  'Kyrgyz Republic',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macau',
  'Macedonia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Montserrat',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Nepal',
  'Netherlands',
  'Netherlands Antilles',
  'New Caledonia',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'Norway',
  'Oman',
  'Pakistan',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Puerto Rico',
  'Qatar',
  'Reunion',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Pierre &amp; Miquelon',
  'Samoa',
  'San Marino',
  'Satellite',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'St Kitts &amp; Nevis',
  'St Lucia',
  'St Vincent',
  'St. Lucia',
  'Sudan',
  'Suriname',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  "Timor L'Este",
  'Togo',
  'Tonga',
  'Trinidad &amp; Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Turks &amp; Caicos',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'Uruguay',
  'Uzbekistan',
  'Venezuela',
  'Vietnam',
  'Virgin Islands (US)',
  'Yemen',
  'Zambia',
  'Zimbabwe',
];

describe('<Combobox> a11y', () => {
  it('form control has role="combobox" on input element', async () => {
    const { container } = render(<Combobox menuList={menuList} />);
    expect(container.querySelector('input.form-control')).toHaveAttribute(
      'role',
      'combobox'
    );
  });
  it('form control has aria-autocomplete="list" on input element', async () => {
    const { container } = render(<Combobox menuList={menuList} />);
    expect(container.querySelector('input.form-control')).toHaveAttribute(
      'aria-autocomplete',
      'list'
    );
  });
  it('dropdown menu has role="listbox" on ul element', async () => {
    const { container } = render(<Combobox menuList={menuList} />);
    fireEvent.click(container.querySelector('input.form-control')!);
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toHaveAttribute(
        'role',
        'listbox'
      );
    })
  });
  it('form control input aria-controls id points to ul id', async () => {
    const { container } = render(<Combobox menuList={menuList} />);
    fireEvent.click(container.querySelector('input.form-control')!);
    const menuUlId = container.querySelector('ul')?.getAttribute('id');
    const inputAriaControlValue = container
      .querySelector('input.form-control')
      ?.getAttribute('aria-controls');
    await waitFor(() => expect(inputAriaControlValue).toEqual(menuUlId));
  });
});
describe('<Combobox>', () => {
  it('renders default HTML of dropdown', async () => {
    const { container, getByText } = render(<Combobox menuList={menuList} />);
    expect(container.firstElementChild?.classList).toContain('dropdown');
    expect(container.firstElementChild?.classList).toContain('dropdown');
    expect(container.firstElementChild?.tagName).toContain('DIV');
    expect(
      container.querySelector('input.form-control.dropdown-toggle')
    ).toBeInTheDocument();
    expect(container.querySelector('ul.dropdown-menu')).not.toBeInTheDocument();

    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      expect(getByText('Afghanistan')).toBeInTheDocument();
      expect(getByText('Afghanistan').tagName).toEqual('BUTTON');
    });
  });

  it('reflects initialValue prop', async () => {
    const { container } = render(
      <Combobox menuList={menuList} initialValue="test" />
    );
    expect(container.querySelector('input')?.value).toEqual('test');
    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    //menu shouldnt appear if initialValue doesnt match any in menuList
    await waitFor(() => {
      expect(
        container.querySelector('ul.dropdown-menu')
      ).not.toBeInTheDocument();
    });
  });

  it('when initialValue=Afghanistan matches one of menuList, onClick should show menu', async () => {
    const { container, getByText } = render(
      <Combobox menuList={menuList} initialValue="Afghanistan" />
    );
    expect(container.querySelector('input')?.value).toEqual('Afghanistan');

    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      expect(getByText('Afghanistan')).toBeInTheDocument();
    });
  });
  it('when initialValue=afghanistan matches one of menuList, onClick should show menu', async () => {
    const { container, getByText } = render(
      <Combobox menuList={menuList} initialValue="afghanistan" />
    );
    expect(container.querySelector('input')?.value).toEqual('afghanistan');

    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      expect(getByText('Afghanistan')).toBeInTheDocument();
    });
  });
  it('when initialValue=a matches one of menuList, onClick should show menu', async () => {
    const { container, getByText, queryByText } = render(
      <Combobox menuList={menuList} initialValue="a" />
    );
    expect(container.querySelector('input')?.value).toEqual('a');

    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      expect(getByText('Afghanistan')).toBeInTheDocument();
      expect(getByText('Albania')).toBeInTheDocument();
      expect(getByText('Azerbaijan')).toBeInTheDocument();
      expect(queryByText('Singapore')).toBeNull();
    });
  });

  it('onclick of menuitem , populates value of input', async () => {
    const { container, getByText } = render(
      <Combobox menuList={menuList} initialValue="a" />
    );
    expect(container.querySelector('input')?.value).toEqual('a');

    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      expect(getByText('Afghanistan')).toBeInTheDocument();
    });

    fireEvent.click(getByText('Afghanistan'));
    await waitFor(() => {
      expect(container.querySelector('input')?.value).toEqual('Afghanistan');
    });
  });

  it('onchange of input, menu filters', async () => {
    const { container, getByText, queryByText } = render(
      <Combobox menuList={menuList} />
    );
    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      expect(getByText('Afghanistan')).toBeInTheDocument();
    });

    fireEvent.change(
      container.querySelector('input.form-control.dropdown-toggle')!,
      { target: { value: 's' } }
    );

    await waitFor(() => {
      expect(getByText('Samoa')).toBeInTheDocument();
      expect(queryByText('Afghanistan')).toBeNull();
    });
    fireEvent.change(
      container.querySelector('input.form-control.dropdown-toggle')!,
      { target: { value: 'si' } }
    );
    await waitFor(() => {
      expect(queryByText('Samoa')).toBeNull();
      expect(getByText('Singapore')).toBeInTheDocument();
      expect(getByText('Sierra Leone')).toBeInTheDocument();
    });
  });

  it('key press arrowDown scrolls menu and changes input', async () => {
    const { container, getByText } = render(<Combobox menuList={menuList} />);
    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      expect(getByText('Afghanistan')).toBeInTheDocument();
    });

    fireEvent.keyDown(
      container.querySelector('input.form-control.dropdown-toggle')!,
      { key: 'ArrowDown', code: 'ArrowDown' }
    );

    await waitFor(() => {
      expect(container.querySelector('input')?.value).toEqual('Afghanistan');
    });
    fireEvent.keyDown(
      container.querySelectorAll('li>button.dropdown-item')[0],
      {
        key: 'ArrowDown',
        code: 'ArrowDown',
      }
    );
    await waitFor(() => {
      expect(container.querySelector('input')?.value).toEqual('Albania');
    });
    fireEvent.keyDown(
      container.querySelectorAll('li>button.dropdown-item')[1],
      {
        key: 'ArrowDown',
        code: 'ArrowDown',
      }
    );
    await waitFor(() => {
      expect(container.querySelector('input')?.value).toEqual('Algeria');
    });
  });
  it('menuList is filtered with "ang" initialValue and includes filter method gives 3 items', async () => {
    const { container } = render(
      <Combobox
        menuList={menuList}
        initialValue="ang"
        filterMethod="includes"
      />
    );
    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );

    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
    });
    expect(container.querySelectorAll('li>button.dropdown-item').length).toEqual(3);
  });
  it('menuList is filtered with "ang" initialValue and includes filter method gives 2 items', async () => {
    const { container } = render(
      <Combobox
        menuList={menuList}
        initialValue="ang"
        filterMethod="startsWith"
      />
    );
    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );

    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
    });
    expect(container.querySelectorAll('li>button.dropdown-item').length).toEqual(2);
  });
  it('menuList is filtered with "ang" initialValue and endsWith custom filter method gives 0 items', async () => {
    const customFilter: CustomFilter = (inputValue: string, menuItems: string[]) => {
      const filtered = menuItems.filter((n) => {
        const nLowerCase = n.toLowerCase();
        const valueLower = inputValue.toLowerCase();
        return nLowerCase.endsWith(valueLower);
      });
      return filtered;
    };
    const { container } = render(
      <Combobox
        menuList={menuList}
        filterMethod={customFilter}
        initialValue="ang"
      />
    );

    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );

    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).not.toBeInTheDocument();
    });
    expect(container.querySelectorAll('li>button.dropdown-item').length).toEqual(0);
  });
  it('items in menu are updated when menuList prop changes', async () => {
    const { container, rerender } = render(<Combobox menuList={[]} />);
    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    expect(container.querySelector('ul.dropdown-menu')).not.toBeInTheDocument();
    rerender(<Combobox menuList={menuList} />);
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
    });
    const dropdownItems = container.querySelectorAll('li>button.dropdown-item');
    expect(dropdownItems.length).toEqual(menuList.length);
  });
  it('onChangeInput fires when input changes', async () => {
    const mockFn = jest.fn();
    const { container } = render(
      <Combobox menuList={menuList} onChangeInput={mockFn} />
    );
    fireEvent.change(
      container.querySelector('input.form-control.dropdown-toggle')!,
      { target: { value: 's' } }
    );
    await waitFor(() => expect(mockFn).toBeCalledTimes(1));
    fireEvent.change(
      container.querySelector('input.form-control.dropdown-toggle')!,
      { target: { value: 'si' } }
    );
    await waitFor(() => expect(mockFn).toBeCalledTimes(2));
  });

  it('pass in menuPlacement changes data-popper-placement attri', async () => {
    const { container } = render(
      <Combobox menuList={menuList} menuPlacement="up" />
    );
    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toHaveAttribute(
        'x-placement',
        'top-start'
      );
    });
  });

  it('when label prop defined, firstElementchild is FormLabel', () => {
    const { container, getByText } = render(
      <Combobox menuList={menuList} label="test" />
    );
    expect(container.firstElementChild?.tagName).toEqual('LABEL');
    expect(container.firstElementChild?.classList).toContain('form-label');
    expect(getByText('test')).toBeInTheDocument();
  });

  it('icon has a default value ', () => {
    const { container } = render(<Combobox menuList={menuList} />);
    expect(
      container.querySelector(
        '.dropdown.combobox> i.form-control-icon.bi-chevron-down'
      )
    ).toBeInTheDocument();
  });
  it('when icon defined, icon in container', () => {
    const { container } = render(
      <Combobox menuList={menuList} icon={<i className="bi bi-search"></i>} />
    );

    expect(
      container.querySelector(
        '.dropdown.combobox> i.form-control-icon.bi.bi-search'
      )
    ).toBeInTheDocument();
  });
  it('when scrollable=true, adds scrollable class to combobox', () => {
    const { container } = render(
      <Combobox
        menuList={menuList}
        scrollable
        icon={<i className="bi bi-search"></i>}
      />
    );

    expect(
      container.querySelector('.dropdown.combobox.scrollable')
    ).toBeInTheDocument();
  });
  it('For filterMethod=includes, when gh is typed matches one of menuList, country filtered menuList should show only strings including gh. Results in 2', async () => {
    const { container } = render(
      <Combobox menuList={menuList} filterMethod="includes" />
    );

    fireEvent.change(
      container.querySelector('input.form-control.dropdown-toggle')!,
      { target: { value: 'gh' } }
    );
    expect(container.querySelector('input')?.value).toEqual('gh');

    fireEvent.click(
      container.querySelector('input.form-control.dropdown-toggle')!
    );
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      const dropdownItem = container.querySelectorAll(
        'li>button.dropdown-item'
      );
      expect(dropdownItem.length).toEqual(2);
      expect(dropdownItem[0].textContent).toEqual('Afghanistan');
      expect(dropdownItem[1].textContent).toEqual('Ghana');
    });
  });
  it('For custom filterMethod, custom filter behaviour is applied instead', async () => {
    const customFilter = (inputValue: string, menuItems: string[]) => {
      const filtered = menuItems.filter((n) => {
        const nLowerCase = n.toLowerCase();
        const valueLower = inputValue.toLowerCase();
        return nLowerCase.endsWith(valueLower);
      });
      return filtered;
    };
    const { container } = render(
      <Combobox
        menuList={['apple', 'orange', 'banana']}
        filterMethod={customFilter as CustomFilter}
      />
    );

    fireEvent.change(
      container.querySelector('input.form-control.dropdown-toggle')!,
      { target: { value: 'e' } }
    );
    expect(container.querySelector('input')?.value).toEqual('e');
    await waitFor(() => {
      expect(container.querySelector('ul.dropdown-menu')).toBeInTheDocument();
      const dropdownItem = container.querySelectorAll(
        'li>button.dropdown-item'
      );
      expect(dropdownItem.length).toEqual(2);
      expect(dropdownItem[0].textContent).toEqual('apple');
      expect(dropdownItem[1].textContent).toEqual('orange');
    });
  });
});
