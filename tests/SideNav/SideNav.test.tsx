import * as React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { SideNav } from '../../src/SideNav';
import { NavLink } from '../../src/Nav';
import { useState } from 'react';
describe('<SideNav>', () => {
  it('should output default structure', () => {
    const { getByText } = render(<SideNav>SideNav</SideNav>);
    expect(getByText('SideNav').tagName).toEqual('UL');
    expect(getByText('SideNav').classList).toContain('sgds');
    expect(getByText('SideNav').classList).toContain('sidenav');
    expect(getByText('SideNav').classList).toContain('list-unstyled');
  });

  it('should output div when as=div', () => {
    const { getByText } = render(<SideNav as="div">SideNav</SideNav>);
    expect(getByText('SideNav').tagName).toEqual('DIV');
  });
  it('sticky prop should be forwarded to .sgds.sidenav', () => {
    const { container } = render(<SideNav sticky>SideNav</SideNav>);
    expect(container.querySelector('.sgds.sidenav')?.classList).toContain(
      'sticky'
    );
  });
  it('by default, both items are closed', () => {
    const { container } = render(
      <SideNav>
        <SideNav.Item eventKey="0">
          <SideNav.Collapse>
            <NavLink>Item 1</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
        <SideNav.Item eventKey="1">
          <SideNav.Collapse>
            <NavLink>Item 2</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
      </SideNav>
    );
    expect(container.querySelectorAll('.collapse')[0].classList).not.toContain(
      'show'
    );
    expect(container.querySelectorAll('.collapse')[1].classList).not.toContain(
      'show'
    );
  });
  it('when defaultActiveKey = 0, only item 1 has .show', () => {
    const { container } = render(
      <SideNav defaultActiveKey="0">
        <SideNav.Item eventKey="0">
          <SideNav.Collapse>
            <NavLink>Item 1</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
        <SideNav.Item eventKey="1">
          <SideNav.Collapse>
            <NavLink>Item 2</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
      </SideNav>
    );
    expect(container.querySelectorAll('.collapse')[0].classList).toContain(
      'show'
    );
    expect(container.querySelectorAll('.collapse')[1].classList).not.toContain(
      'show'
    );
  });
  it('when defaultActiveKey = 1, only item 2 has .show', () => {
    const { container } = render(
      <SideNav defaultActiveKey="1">
        <SideNav.Item eventKey="0">
          <SideNav.Collapse>
            <NavLink>Item 1</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
        <SideNav.Item eventKey="1">
          <SideNav.Collapse>
            <NavLink>Item 2</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
      </SideNav>
    );
    expect(container.querySelectorAll('.collapse')[0].classList).not.toContain(
      'show'
    );
    expect(container.querySelectorAll('.collapse')[1].classList).toContain(
      'show'
    );
  });
  it('activeKey overrides defaultActiveKey', () => {
    const { container } = render(
      <SideNav defaultActiveKey="1" activeKey="0">
        <SideNav.Item eventKey="0">
          <SideNav.Collapse>
            <NavLink>Item 1</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
        <SideNav.Item eventKey="1">
          <SideNav.Collapse>
            <NavLink>Item 2</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
      </SideNav>
    );
    expect(container.querySelectorAll('.collapse')[0].classList).toContain(
      'show'
    );
    expect(container.querySelectorAll('.collapse')[1].classList).not.toContain(
      'show'
    );
  });

  it('.show changes when SideNavButton is clicked', async () => {
    const { getByText, container } = render(
      <SideNav>
        <SideNav.Item eventKey="0">
          <SideNav.Button>FirstItemBtn</SideNav.Button>
          <SideNav.Collapse>
            <NavLink>Item 1</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
        <SideNav.Item eventKey="1">
          <SideNav.Button>SecondItemBtn</SideNav.Button>
          <SideNav.Collapse>
            <NavLink>Item 2</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
      </SideNav>
    );
    expect(container.querySelectorAll('.collapse')[0].classList).not.toContain(
      'show'
    );
    expect(container.querySelectorAll('.collapse')[1].classList).not.toContain(
      'show'
    );
    expect(getByText('SecondItemBtn')).toBeDefined();
    fireEvent.click(getByText('SecondItemBtn'));
    await waitFor(() => {
      expect(
        container.querySelectorAll('.collapse')[0].classList
      ).not.toContain('show');
      expect(container.querySelectorAll('.collapse')[1].classList).toContain(
        'show'
      );
    });
    fireEvent.click(getByText('FirstItemBtn'));
    await waitFor(() => {
      expect(container.querySelectorAll('.collapse')[0].classList).toContain(
        'show'
      );
      expect(
        container.querySelectorAll('.collapse')[1].classList
      ).not.toContain('show');
    });
  });

  it('when alwaysOpen set, default is closed, onclick the item remains open always', async () => {
    const { getByText, container } = render(
      <SideNav alwaysOpen>
        <SideNav.Item eventKey="0">
          <SideNav.Button>FirstItemBtn</SideNav.Button>
          <SideNav.Collapse>
            <NavLink>Item 1</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
        <SideNav.Item eventKey="1">
          <SideNav.Button>SecondItemBtn</SideNav.Button>
          <SideNav.Collapse>
            <NavLink>Item 2</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
      </SideNav>
    );
    //initially closed
    expect(container.querySelectorAll('.collapse')[0].classList).not.toContain(
      'show'
    );
    expect(container.querySelectorAll('.collapse')[1].classList).not.toContain(
      'show'
    );

    fireEvent.click(getByText('FirstItemBtn'));
    await waitFor(() => {
      expect(container.querySelectorAll('.collapse')[0].classList).toContain(
        'show'
      );
      expect(
        container.querySelectorAll('.collapse')[1].classList
      ).not.toContain('show');
    });

    fireEvent.click(getByText('SecondItemBtn'));
    await waitFor(() => {
      expect(container.querySelectorAll('.collapse')[0].classList).toContain(
        'show'
      );
      expect(container.querySelectorAll('.collapse')[1].classList).toContain(
        'show'
      );
    });
  });
  it('on initial load make items open', async () => {
    const { getByText, container } = render(
      <SideNav alwaysOpen defaultActiveKey={['0', '1']}>
        <SideNav.Item eventKey="0">
          <SideNav.Button>FirstItemBtn</SideNav.Button>
          <SideNav.Collapse>
            <NavLink>Item 1</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
        <SideNav.Item eventKey="1">
          <SideNav.Button>SecondItemBtn</SideNav.Button>
          <SideNav.Collapse>
            <NavLink>Item 2</NavLink>
          </SideNav.Collapse>
        </SideNav.Item>
      </SideNav>
    );
    //initially open
    expect(container.querySelectorAll('.collapse')[0].classList).toContain(
      'show'
    );
    expect(container.querySelectorAll('.collapse')[1].classList).toContain(
      'show'
    );

    fireEvent.click(getByText('FirstItemBtn'));
    await waitFor(() => {
      expect(
        container.querySelectorAll('.collapse')[0].classList
      ).not.toContain('show');
      expect(container.querySelectorAll('.collapse')[1].classList).toContain(
        'show'
      );
    });

    fireEvent.click(getByText('SecondItemBtn'));
    await waitFor(() => {
      expect(
        container.querySelectorAll('.collapse')[0].classList
      ).not.toContain('show');
      expect(
        container.querySelectorAll('.collapse')[1].classList
      ).not.toContain('show');
    });
  });
});

interface ComponentProps{
  alwaysOpen: boolean;
  initialActiveKey: string | string[]
}
const Component = ({alwaysOpen, initialActiveKey}: ComponentProps) => {
  const [activeKey, setActiveKey] = useState(initialActiveKey);
  const [activeLinkKey, setActiveLinkKey] = useState('two-1');
  const clickLink = (key: string) => {
    setActiveLinkKey(key);
  };
  const clickButton = (key: string) => {
    if(Array.isArray(initialActiveKey)){
      !initialActiveKey.includes(key) ? initialActiveKey.push(key) : null
    } else {
      activeKey === key ? setActiveKey('') : setActiveKey(key);
    }
  };
  const clickButtonLink = (key: string) => {
    setActiveLinkKey('');
    clickButton(key);
  };
  return (
    <SideNav activeNavLinkKey={activeLinkKey} activeKey={activeKey} alwaysOpen={alwaysOpen} defaultActiveKey={initialActiveKey}>
      <SideNav.Item eventKey="0">
        <SideNav.Button onClick={() => clickButton('0')}>
          SideNav Item #1
        </SideNav.Button>
        <SideNav.Collapse>
          <>
            <SideNav.Link
              eventKey="nl-1"
              href="#"
              onClick={() => clickLink('nl-1')}
            >
              number1
            </SideNav.Link>
            <SideNav.Link
              eventKey="nl-2"
              href="#"
              onClick={() => clickLink('nl-2')}
            >
              number one
            </SideNav.Link>
            <SideNav.Link
              eventKey="nl-3"
              href="#"
              onClick={() => clickLink('nl-3')}
            >
              number one
            </SideNav.Link>
          </>
        </SideNav.Collapse>
      </SideNav.Item>
      <SideNav.Item eventKey="1">
        <SideNav.Button onClick={() => clickButton('1')}>
          SideNav Item #2
        </SideNav.Button>
        <SideNav.Collapse>
          <>
            {['one', 'two', 'three', 'four'].map((e, i) => (
              <SideNav.Link
                key={i}
                eventKey={`${e}-${i}`}
                onClick={() => clickLink(`${e}-${i}`)}
              >
                number {e}
              </SideNav.Link>
            ))}
          </>
        </SideNav.Collapse>
      </SideNav.Item>
      <SideNav.Item eventKey="2">
        <SideNav.Button onClick={() => clickButtonLink('2')} href="#">
          SideNav Item #3
        </SideNav.Button>
      </SideNav.Item>
    </SideNav>
  );
};

describe('SideNav behaviour when there are active SideNavLink', () => {
  it('on first load, second navitem should be expanded', async () => {
    const { container, getByText } = render(<Component  alwaysOpen={false}  initialActiveKey="1"/>);
    // second nav item is open and first nav item is closed
    expect(container.querySelectorAll('.show').length).toEqual(1);
    expect(container.querySelectorAll('.btn')[1].classList).not.toContain(
      'collapsed'
    );
    expect(container.querySelectorAll('.btn')[0].classList).toContain(
      'collapsed'
    );
    expect(getByText('number two').classList).toContain('active');

    //when clicked on button number4 navlink is no longer active

    fireEvent.click(getByText('SideNav Item #3'));
    await waitFor(() =>
      expect(getByText('number two').classList).not.toContain('active')
    );

    // click on first navitem
    fireEvent.click(getByText('SideNav Item #1'));
    await waitFor(() => {
      expect(container.querySelectorAll('.btn')[0].classList).not.toContain(
        'collapsed'
      );
      expect(getByText('number1').classList).not.toContain('active');
    });
    //click on navlink number 1
    fireEvent.click(getByText('number1'));
    //navlink 1 should be active
    await waitFor(() =>
      expect(getByText('number1').classList).toContain('active')
    );
  });
});

describe('Active style added to Sidenav when ', () => {
  it("on click on sidenav button in normal mode", async() => {
    const { container, getByText } = render(<Component alwaysOpen={false} initialActiveKey="1"/>);

    expect(container.querySelectorAll('.btn')[1].classList).toContain(
      'active'
    );
    expect(container.querySelectorAll('.btn')[0].classList).not.toContain(
      'active'
    );
    expect(container.querySelectorAll('.btn')[2].classList).not.toContain(
      'active'
    );

    fireEvent.click(getByText('SideNav Item #1'));
    await waitFor(() => {
      expect(container.querySelectorAll('.btn')[0].classList).toContain(
        'active'
      );
      expect(container.querySelectorAll('.btn')[1].classList).not.toContain(
        'active'
      );
      expect(container.querySelectorAll('.btn')[2].classList).not.toContain(
        'active'
      );
    });
  })
  it("on click on sidenav button in alwaysOpen mode", async() => {
    const { container } = render(<Component alwaysOpen={true} initialActiveKey={["0", "1"]}/>);

    expect(container.querySelectorAll('.btn')[1].classList).toContain(
      'active'
    );
    expect(container.querySelectorAll('.btn')[0].classList).toContain(
      'active'
    );
    expect(container.querySelectorAll('.btn')[2].classList).not.toContain(
      'active'
    );

    // fireEvent.click(getByText('SideNav Item #1'));
    // await waitFor(() => {
    //   expect(container.querySelectorAll('.btn')[0].classList).toContain(
    //     'active'
    //   );
    //   expect(container.querySelectorAll('.btn')[1].classList).toContain(
    //     'active'
    //   );
    //   expect(container.querySelectorAll('.btn')[2].classList).not.toContain(
    //     'active'
    //   );
    // });
  })

})