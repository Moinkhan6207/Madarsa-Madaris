/**
 * Bootstrap all pages for tenant darul-huda with default content blocks.
 * Run with: node src/scripts/seed-all-pages.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TENANT_ID = '20eb8211-c506-4090-b180-7b2d23eee208';

const defaultPages = [
  {
    slug: 'about',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'ABOUT US',
            title: 'Our Noble Mission',
            subtitle: 'Founded with the vision of nurturing scholars who serve the Ummah with wisdom and faith.',
            ctaText: 'Join Our Family',
            ctaLink: '/admission',
            imageUrl: '',
          },
        },
      },
      {
        type: 'about',
        order: 1,
        content: {
          en: {
            title: 'Who We Are',
            description:
              'Darul Huda Islamic Institute has been at the forefront of providing authentic Islamic education since its establishment. We combine traditional Islamic scholarship with modern pedagogical approaches to produce well-rounded graduates.',
            imageUrl: '',
          },
        },
      },
      {
        type: 'stats',
        order: 2,
        content: {
          en: {
            items: [
              { label: 'Students Enrolled', value: '1200+' },
              { label: 'Alumni', value: '5000+' },
              { label: 'Teachers', value: '45+' },
              { label: 'Years of Excellence', value: '20+' },
            ],
          },
        },
      },
      {
        type: 'testimonials',
        order: 3,
        content: {
          en: {
            title: 'What Our Alumni Say',
            testimonials: [
              {
                name: 'Ahmad Ali',
                role: 'Graduate 2022',
                text: 'Darul Huda shaped my character and gave me a strong foundation in Islamic knowledge.',
                imageUrl: '',
              },
            ],
          },
        },
      },
    ],
  },
  {
    slug: 'admission',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'ADMISSIONS OPEN',
            title: 'Begin Your Islamic Journey',
            subtitle: 'Applications are now open for the upcoming academic year. Limited seats available.',
            ctaText: 'Apply Now',
            ctaLink: '#form',
            imageUrl: '',
          },
        },
      },
      {
        type: 'stats',
        order: 1,
        content: {
          en: {
            items: [
              { label: 'Seats Available', value: '100' },
              { label: 'Programs', value: '5+' },
              { label: 'Scholarships', value: '20+' },
              { label: 'Success Rate', value: '98%' },
            ],
          },
        },
      },
      {
        type: 'form',
        order: 2,
        content: {
          en: {
            formType: 'ADMISSION',
            title: 'Admission Application Form',
            description: 'Fill in your details and our admissions team will contact you within 48 hours.',
          },
        },
      },
    ],
  },
  {
    slug: 'courses',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'OUR PROGRAMS',
            title: 'Academic Programs',
            subtitle: 'Choose the path that aligns with your calling and passion for Islamic knowledge.',
            ctaText: 'Apply Now',
            ctaLink: '/admission',
            imageUrl: '',
          },
        },
      },
      {
        type: 'courses',
        order: 1,
        content: {
          en: {
            title: 'Available Programs',
            courses: [
              {
                title: 'Hifz ul Quran',
                duration: '3-5 Years',
                description:
                  'Complete memorization of the Holy Quran with proper Tajweed rules and pronunciation.',
              },
              {
                title: 'Aalimiyat',
                duration: '7 Years',
                description:
                  'Comprehensive traditional Islamic scholarship program covering Fiqh, Hadith, Tafseer and more.',
              },
              {
                title: 'Nazra',
                duration: '1-2 Years',
                description: 'Quran reading with proper pronunciation and understanding of basic Islamic tenets.',
              },
              {
                title: 'Arabic Language',
                duration: '1 Year',
                description: 'Intensive Arabic language program for understanding Quranic and classical texts.',
              },
            ],
          },
        },
      },
      {
        type: 'cta',
        order: 2,
        content: {
          en: {
            title: 'Ready to Enroll?',
            buttonText: 'Apply for Admission',
            link: '/admission',
          },
        },
      },
    ],
  },
  {
    slug: 'contact',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'CONTACT US',
            title: 'Get In Touch',
            subtitle: 'We are here to answer your questions and guide you on your journey.',
            ctaText: 'Send Message',
            ctaLink: '#form',
            imageUrl: '',
          },
        },
      },
      {
        type: 'form',
        order: 1,
        content: {
          en: {
            formType: 'CONTACT',
            title: 'Send Us a Message',
            description: 'Have a question? We\'d love to hear from you. We\'ll respond within 24 hours.',
          },
        },
      },
    ],
  },
  {
    slug: 'donation',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'SADAQAH JARIYAH',
            title: 'Support the House of Knowledge',
            subtitle:
              'Every contribution, big or small, helps us continue building leaders of tomorrow and earning you ongoing rewards.',
            ctaText: 'Donate Now',
            ctaLink: '#donate',
            imageUrl: '',
          },
        },
      },
      {
        type: 'donation-banner',
        order: 1,
        content: {
          en: {
            title: 'Current Campaign: New Library Fund',
            description:
              'Help us build a state-of-the-art Islamic library for our students. Your waqf (endowment) will continue to benefit generations of students.',
            ctaText: 'Donate Now',
            campaignGoal: '500000',
            amountRaised: '125000',
            currency: 'INR',
          },
        },
      },
      {
        type: 'stats',
        order: 2,
        content: {
          en: {
            items: [
              { label: 'Donors This Year', value: '250+' },
              { label: 'Students Supported', value: '80+' },
              { label: 'Campaigns Completed', value: '12' },
              { label: 'Goals Achieved', value: '100%' },
            ],
          },
        },
      },
    ],
  },
  {
    slug: 'events',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'UPCOMING EVENTS',
            title: 'Events & Programs',
            subtitle:
              'Stay up to date with our latest jalsa, lectures, graduation ceremonies and community gatherings.',
            ctaText: 'Contact Us',
            ctaLink: '/contact',
            imageUrl: '',
          },
        },
      },
      {
        type: 'stats',
        order: 1,
        content: {
          en: {
            items: [
              { label: 'Events This Year', value: '24+' },
              { label: 'Attendees', value: '5000+' },
              { label: 'Guest Scholars', value: '12+' },
              { label: 'Communities Served', value: '8+' },
            ],
          },
        },
      },
      {
        type: 'cta',
        order: 2,
        content: {
          en: {
            title: 'Want to be notified about upcoming events?',
            buttonText: 'Contact Us',
            link: '/contact',
          },
        },
      },
    ],
  },
  {
    slug: 'gallery',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'GALLERY',
            title: 'Life at Darul Huda',
            subtitle: 'Moments from campus life, events, graduation ceremonies and daily routines.',
            ctaText: 'Join Our Community',
            ctaLink: '/admission',
            imageUrl: '',
          },
        },
      },
      {
        type: 'gallery',
        order: 1,
        content: {
          en: {
            title: 'Campus Life',
            images: [],
          },
        },
      },
    ],
  },
  {
    slug: 'results',
    blocks: [
      {
        type: 'hero',
        order: 0,
        content: {
          en: {
            badge: 'ACHIEVEMENTS',
            title: 'Academic Results',
            subtitle: 'Celebrating the outstanding achievements of our students and graduates.',
            ctaText: 'View Programs',
            ctaLink: '/courses',
            imageUrl: '',
          },
        },
      },
      {
        type: 'stats',
        order: 1,
        content: {
          en: {
            items: [
              { label: 'Pass Rate', value: '98%' },
              { label: 'Distinctions', value: '120+' },
              { label: 'Hifz Completions', value: '45' },
              { label: 'Batch Year', value: '2024' },
            ],
          },
        },
      },
      {
        type: 'cta',
        order: 2,
        content: {
          en: {
            title: 'Proud of our alumni and their achievements',
            buttonText: 'Join Our Programs',
            link: '/admission',
          },
        },
      },
    ],
  },
];

async function seedPages() {
  console.log(`\n🌱 Seeding pages for tenant: ${TENANT_ID}\n`);

  for (const pageData of defaultPages) {
    const page = await prisma.page.findFirst({
      where: { tenantId: TENANT_ID, slug: pageData.slug, deletedAt: null },
    });

    if (!page) {
      console.log(`  ❌ Page "${pageData.slug}" not found – skipping.`);
      continue;
    }

    // Delete old blocks
    const deleted = await prisma.pageBlock.deleteMany({
      where: { pageId: page.id, tenantId: TENANT_ID },
    });

    // Insert new blocks
    const created = await prisma.pageBlock.createMany({
      data: pageData.blocks.map((block) => ({
        type: block.type,
        order: block.order,
        content: block.content,
        config: {},
        pageId: page.id,
        tenantId: TENANT_ID,
      })),
    });

    // Make sure page is published
    await prisma.page.update({
      where: { id: page.id },
      data: { isPublished: true },
    });

    console.log(
      `  ✅ "${pageData.slug}" — deleted ${deleted.count} old blocks, created ${created.count} new blocks.`
    );
  }

  console.log('\n🎉 All pages seeded successfully!\n');
}

seedPages()
  .catch((err) => {
    console.error('❌ Error seeding pages:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
