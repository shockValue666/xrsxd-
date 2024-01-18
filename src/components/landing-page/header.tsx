'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Logo from '../../../public/cypresslogo.svg';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  //navigationMenuTriggerStyle is a classname(?) that 
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
//a collection of links for navigating websites ^^
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const routes = [
  { title: 'Features', href: '#features' },
  { title: 'Reasources', href: '#resources' },
  { title: 'Pricing', href: '#pricing' },
  { title: 'Testimonials', href: '#testimonial' },
];

const components: { title: string; href: string; description: string }[] = [
  {
    title: 'Alert Dialog',
    href: '#',
    description:
      'A modal dialog that interrupts the user with important content and expects a response.',
  },
  {
    title: 'Hover Card',
    href: '#',
    description:
      'For sighted users to preview content available behind a link.',
  },
  {
    title: 'Progress',
    href: '#',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
  },
  {
    title: 'Scroll-area',
    href: '#',
    description: 'Visually or semantically separates content.',
  },
  {
    title: 'Tabs',
    href: '#',
    description:
      'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
  },
  {
    title: 'Tooltip',
    href: '#',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
  },
];

const Header = () => {
  const [path, setPath] = useState('#products');
  return (
    <header
      className="p-4
      flex
      justify-center
      items-center
  "
  //flex layout in the header, flexible alignment of children
  //justify-center: provide children with horizontal central alignment
  //items-center: provide children central vertical alignment
    >
      {/* Link is used for client side navigation aka NO refresh */}
      {/* <a></a> performs full page refresh */}
      <Link
        href={'/'}
        className="w-full flex gap-2
        justify-left items-center"
        //w-full: the link's width takes up 100$ of its parents container
        //flex: flexbox layout to the link, enabling flexible
        //alignment of child elements
        //justofy-left: aligns children of this flex container
        //to the start(;eft) pf the container.
        //gap-2: add a small space (8px by default) between child
        //elements of this flex container
        //items-center: vertically centers the child elements within the flex container
      >
        <Image
          src={Logo}
          alt="Cypress Logo"
          width={25}
          height={25}
        />
        <span
          className="font-semibold
          dark:text-white
        "
        //dark:text-white conditional class for dark mode.
        >
          cypress.
        </span>
      </Link>
      <NavigationMenu className="hidden md:block">
        {/* hidden: hides the element by default
        md:block  -responsive class, -the element will be displayed as a block-level element on medium-sized screens 
        and larger, making it visible only on these screens
         */}
        <NavigationMenuList className="gap-6">
          {/* gap 6: creates a spacing of 24 pixels (6 times the base spacing unit) between the elements inside
          the NavigationMenuList */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
            //this is a trigger element: ... -it changes the path to #resouces when triggered -
              onClick={() => setPath('#resources')} //TODO: hmm maybe turn that to onHover?
              className={cn({
                'dark:text-white': path === '#resources',
                'dark:text-white/40': path !== '#resources',
                'font-normal': true,
                'text-xl': true,
              })}
              // TODO: fix this shit with the color of the navigation items on hover
              //cn is used for conditional styling it's a little buggy it needs to be fixed
            >
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              {/* obviously it's the content of the submenu of each navigation item */}
              <ul
                className="grid
                gap-3
                p-6
                md:w-[400px]
                lg:w-[500px]
                lg:grid-cols-[_.75fr_1fr]
                "
                //the reason on smaller screens we have 1 column is that the default grid is 1 column
                //but on the larger and up it's 2 because we explicitly declare it lg:grid-cols-[.75fr_1fr]
              >
                <li className="row-span-3 col-span-1 border border-green-500">
                  {/* row-span: this list items is set to span 3 rows in a grid container ... 
                  damn i actually think it does lol. actually row-span changes the space 
                  the welcome component takes up. in particular it expresses the number 
                  of columns of the grid.
                  col-span-1: overwrites lg:grid-cols-[_.75fr_1fr]
                  */}  
                  <span
                    className="flex h-full w-full select-none
                  flex-col
                  justify-end
                  rounded-md
                  bg-gradient-to-b
                  from-muted/50
                  to-muted
                  p-6 no-underline
                  outline-none
                  focus:shadow-md
                  "
                  //flex: enables flexbox
                  //h-full w-full: sets the width and the height of the element to take up its full container
                  //select-none: prevents the text within to be selctable
                  //justify-end: aligns it in the end of the container which is the li instance
                  // muted: colors
                  //
                  >
                    Welcome
                  </span>
                </li>
                <ListItem
                  href="#"
                  title="Introduction"
                >
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem
                  href="#"
                  title="Installation"
                >
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem
                  href="#"
                  title="Typography"
                >
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#pricing')}
              className={cn({
                'dark:text-white': path === '#pricing',
                'dark:text-white/40': path !== '#pricing',
                'font-normal': true,
                'text-xl': true,
              })}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4  md:grid-row-2  ">
                <ListItem
                  title="Pro Plan"
                  href={'#'}
                >
                  Unlock full power with collaboration.
                </ListItem>
                <ListItem
                  title={'free Plan'}
                  href={'#'}
                >
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuContent>
              <ul
                className="grid w-[400px]
              gap-3
              p-4
              md:w-[500px]
              md:grid-cols-2 
              lg:w-[600px]
              "
              >
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), {
                'dark:text-white': path === '#testimonials',
                'dark:text-white/40': path !== '#testimonials',
                'font-normal': true,
                'text-xl': true,
              })}
            >
              Testimonial
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <aside
        className="flex
        w-full
        gap-2
        justify-end
      "
      >
        <Link href={'/login'}>
          <Button
            variant="btn-secondary"
            className=" p-1 hidden sm:block"
          >
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            variant="btn-primary"
            className="whitespace-nowrap"
          >
            Sign Up
          </Button>
        </Link>
      </aside>
    </header>
  );
};

export default Header;

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'group block select-none space-y-1 font-medium leading-none'
          )}
          {...props}
        >
          <div className="text-white text-sm font-medium leading-none">
            {title}
          </div>
          <p
            className="group-hover:text-white/70
            line-clamp-2
            text-sm
            leading-snug
            text-white/40
          "
          >
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = 'ListItem';



// Link with Logo: Next.js <Link> around <Image>, navigates to home without full refresh.
// NavigationMenu: Likely a <nav>, holds navigation structure.
// Menu Items: NavigationMenuList contains NavigationMenuItem with NavigationMenuTrigger and NavigationMenuContent.
// Submenu Grid: ul in NavigationMenuContent has one column, two on large screens (lg:grid-cols-[.75fr_1fr]).
// ListItems: Represents options like "Introduction", "Installation" with titles and descriptions.
// Additional Items: More NavigationMenuItem for sections like "Pricing", "Testimonials".
// Login/Signup Buttons: On the right, in <Link>, for seamless navigation.



// ogo Link: Uses Next.js <Link>; no page refresh on navigation.
// Navigation Structure: Housed in NavigationMenu, possibly a <nav> tag.
// Menu Components: NavigationMenuList with items; NavigationMenuTrigger and NavigationMenuContent included.
// Responsive Grid: One column in ul, two in larger screens (lg:grid-cols-[.75fr_1fr]).
// Option Representation: ListItem for various sections; has titles and descriptions.
// More Menu Items: Additional sections like "Pricing", "Testimonials".
// Login/Signup: Right-aligned, seamless navigation with <Link>.
