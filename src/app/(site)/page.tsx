import TitleSection from '@/components/landing-page/title-section'
import Image from 'next/image'
import { Button } from '@/components/ui/button';
import Banner from '../../../public/appBanner.png'
import Cal from '../../../public/cal.png'
import Diamond from '../../../public/icons/diamond.svg'
import CheckIcon from '../../../public/icons/check.svg'
// a bunch of images
import { CLIENTS, PRICING_CARDS, PRICING_PLANS, USERS } from '@/lib/constants';
import { randomUUID } from 'crypto';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import CustomCard from '@/components/landing-page/custom-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    // <main className="text-3xl text-orange-400	 border border-white">
      <>
        <section className='overflow-hidden px-4 sm:px-6 mt-10 sm:flex sm:flex-col gap-4 md:justify-center md:items-center'>  
          <TitleSection pill='✨ Your workspace, Perfected' title="we actually don't need a logout button"></TitleSection>
          {/* this is a title section that is the call column diatomi like sxima at the top 
          also it's the big letter text following up*/}
          <div className='bg-white
          p-[2px]
          mt-6
          rounded-xl
          bg-gradient-to-r
          from-primary
          to-brand-primaryBlue
          sm:w-[300px]
          '>
            {/* padding is 2 px everywhere, and margin top is 6,
            it is rounded with big angles and 
            has a gradient blueish and in the small screens it's 300px which is like 1/3
            in mobile */}
            <Button
              variant={'secondary'}
              className='w-full
              rounded-[10px]
              p-6
              text-2xl
              bg-background'
            >
             some 
            </Button>
            {/* -this is the main button that is see as i enter and it look impressive af */}
            {/* -it takes up the whole screen in mobiles and a smaller part in desktops
            -it is rounded with significant angles, 
            -it has dark background */}
          </div>
          <div className='md:mt-[-90px]
          sm:w-full
          w-[750px]
          flex
          justify-center
          items-center
          mt-[-40px]
          sm:ml-0
          ml-[-50px]'>
            <Image src={Banner} alt={'Application Banner'}/>
            {/* to screenshot apo to app lol */}
            <div className='bottom-0
            top-[50%]
            bg-gradient-to-t
            dark:from-background
            left-0
            right-0
            absolute
            z-10
            '>
              {/* idk what top-[50%] means, it means: the top position of the element is being set to 50% of its parents container's height
              -the element is positioned such that its top edge is at the vertical midpoint (50%) of its parent container. This is often used 
              for vertically centering elements within a conatiner */}
            </div>
          </div>
        </section>
        <section className="relative">
          {/* moving carusel shit 
          -the CLIENTS is an object that contains two properties: an alt and a logo,
          -obv the logos are the ones appearing on the page looking like real brands
          -it's a horizontally moving scrolling carousel of client logos
          - Import statements: it imports various dependencies, including other components, images, constants, utility
          functions, and CSS classes. 
          - Functional Component: this component is defined as Home
          - Section Division: The component is divided into different sections: and each section has its own tag
           */}

           {/* first half: 
            -initially it's hidden
            -then we provide display to be flex
            -then we provide after: property. after: it is used along before:: in order to create additional
            styling elements. These pseudo-elements are styled with gradient background, and their position and dimensions are 
            maniupulated to create visual effects. 
            -after:content[] before:content[] the content of the pseudo-elements is set to a "" empty string to ensure
            that they don't display any kind of content by default. In this case they are used purely for styling
            -after:dark:from-brand-dark and before:dark:from-brand-dark: apply dark theeme to the pseudo-elements
            -after:to-transparent and before:to-transparent: these pseudo-elements should transition to a transparent state,
            the transition occurs when a user interacts or animation is triggered.
            -after:from-background and before:from-background: the pseudo-elements should transition from a background
            color defined by the 
            -after:bg-gradient-to-l and before:bg-gradient-to-r: define gradient background for the pseudoshits
            -after:right-0, after:bottom-0, after:top-0, before:left-0, before:top-0, before:bottom-0: the position
            of the pseudo-elemens before and after
            -the width
            -the z index
            -and the positioning
            */}
          <div

            className="overflow-hidden
            flex
            after:content['']
            after:dark:from-brand-dark
            after:to-transparent
            after:from-background
            after:bg-gradient-to-l
            after:right-0
            after:bottom-0
            after:top-0
            after:w-20
            after:z-10
            after:absolute

            before:content['']
            before:dark:from-brand-dark
            before:to-transparent
            before:from-background
            before:bg-gradient-to-r
            before:left-0
            before:top-0
            before:bottom-0
            before:w-20
            before:z-10
            before:absolute
          "
          >
            {[...Array(2)].map((_,index) => (
              <div
                key={index}
                className="flex
                  flex-nowrap
                  animate-slide
            "
              >
                {CLIENTS.map((client) => (
                  <div
                    key={client.alt}
                    className=" relative
                      w-[200px]
                      m-20
                      shrink-0
                      flex
                      items-center
                    "
                  >
                    <Image
                      src={client.logo}
                      alt={client.alt}
                      width={200}
                      className="object-contain max-w-none"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
        <section
          className="px-4
          sm:px-6
          flex
          justify-center
          items-center
          flex-col
          relative
        "
        >
          <div
            className="w-[30%]
            blur-[120px]
            rounded-full
            h-32
            absolute
            bg-brand-primaryPurple/50
            -z-10
            top-22
          "
          />
          <TitleSection
            title="Keep track of your meetings all in one place"
            subheading="Capture your ideas, thoughts, and meeting notes in a structured and organized manner."
            pill="Features"
          />
          <div
            className="mt-10
            max-w-[450px]
            flex
            justify-center
            items-center
            relative
            sm:ml-0
            rounded-2xl
            border-8
            border-washed-purple-300 
            border-opacity-10
          "
          >
            <Image
              src={Cal}
              alt="Banner"
              className="rounded-2xl"
            />
          </div>
        </section>
        <section className='relative'>
        <div
            className="w-full
            blur-[120px]
            rounded-full
            h-32
            absolute
            bg-brand-primaryPurple/50
            -z-10
            top-56
          "
          />
          <div className='mt-20 px-4 sm:px-6 flex flex-col overflow-x-hidden overflow-visible'>
            <TitleSection
              title="Trusted by all"
              subheading="Join thousands of satisfied users who rely on our platform for their 
              personal and professional productivity needs."
              pill="Testimonials"
            />
            {
              [...Array(2)].map((arr,index)=> (
                <div key={randomUUID()} className={twMerge(clsx('mt-10 flex flex-nowrap gap-6 self-start', {
                  'flex-row-reverse':index===1,
                  'animate-[slide_250s_linear_infinite]':true,
                  'animate-[slide_250s_linear_infinite_reverse]': index===1,
                  'ml-[100vw]':index===1
                }),
                  'hover:paused'
                )}>
                  {
                    USERS.map((testimonial,index)=>(
                      <CustomCard key={testimonial.name} className='w-[500px] shrink-0 rounded-xl dark:bg-gradient-to-t dark:from-broder dark:to-background'
                      cardHeader={<div className='flex items-center gap-4'><Avatar>
                          <AvatarImage src={`/avatars/${index+1}.png`}/>
                          <AvatarFallback>AV</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-foreground">{testimonial.name}</CardTitle>
                          <CardDescription className='dark:text-washed-purple-800'>{testimonial.name.toLowerCase()}</CardDescription>
                        </div>
                        </div>
                      }
                      cardContent={
                        <p className='dark:text-washed-purple-800'>
                          {testimonial.message}
                        </p> 

                      }
                    >

                      </CustomCard>
                    ))
                  }


                </div>
              ))
            }
          </div>

        </section>
        <section className='mt-20 px-4 sm:px-6'>
          <TitleSection
            title="The Perfect Plan For You"
            subheading="Experience all the benefits of our platform. Select a plan that suits your needs and take your productivity to new heights."
            pill="Pricing"
          />
          <div className='
          flex
          flex-col-reverse
          sm:flex-row
          gap-4
          justify-center
          sm:items-stretch
          items-center
          mt-10'>
            <h1 className='hidden'>chi m</h1>
            {PRICING_CARDS.map((card)=>(
              <CustomCard key={card.planType} 
                className={clsx("w-[300px] rounded-2xl dark:bg-black/40 background-blur-3xl relative",
                  {
                    "border-brand-primaryPurple/70":card.planType===PRICING_PLANS.proplan
                  }
                  )}
                cardHeader={<CardTitle className='text-2xl font-semibold '>
                    {
                      card.planType === PRICING_PLANS.proplan && <>
                        <div className='hidden dark:block w-full blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/80 -z-10 top-0'/>
                        <Image src={Diamond} alt="Pro Plan Icon" className='absolute top-6 right-6'/>
                      </>
                    }
                    {card.planType}
                    </CardTitle>
                  }
                  cardContent={
                    <CardContent className='p-0'>
                      <span className='font-normal text-2xl '>
                        ${card.price}
                      </span>
                      {+card.price > 0 ? <span className='dark:text-washed-purple-800 ml-1'>/mo</span> : ""}
                      <p className='dark:text-washed-purple-800'></p>
                      <Button variant={'secondary'} className='whitespace-nowrap w-full mt-4'>
                        {card.planType === PRICING_PLANS.proplan ? "Go Pro" : "Get Started"}
                      </Button>
                    </CardContent>
                  }
                  cardFooter={
                    <ul className='font-normal flex mb-2 flex-col gap-4'>
                      <small>{card.highlightFeature}</small>
                      {card.freatures.map((feature)=>(
                        <li 
                          key={feature}
                          className='flex items-center gap-2 '
                        >
                          <Image src={CheckIcon} alt='Check Icon'/>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  }
              >

              </CustomCard>
            ))}
          </div>
        </section>

      </>
    // </main>
  )
}
