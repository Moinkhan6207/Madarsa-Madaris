import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_BASE = 'http://127.0.0.1:5001/api/v1';
const WEB_BASE = 'http://127.0.0.1:3000'; // Next.js port

async function finalStrictVerification() {
  console.log('🧐 Final Strict Verification - QA Audit');
  const results: any = {
    security: 'PENDING',
    rateLimiting: 'PENDING',
    caching: 'PENDING',
    seo: 'PENDING',
    leads: 'PENDING',
    routing: 'PENDING'
  };

  try {
    const tenant = await prisma.tenant.findFirst({ where: { slug: 'madarsa-darul-uloom' } });
    if (!tenant) throw new Error('Tenant missing');

    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'superadmin@system.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    const authHeaders = { Authorization: `Bearer ${token}`, 'x-tenant-id': tenant.id };

    // 1. Security (XSS Removal)
    const xssPage = {
      title: 'XSS Audit Page',
      slug: 'xss-audit-' + Date.now(),
      blocks: [
        { type: 'hero', content: { title: 'Malicious <script>alert("xss")</script> Title' }, order: 0 }
      ],
      isPublished: true
    };
    const createRes = await axios.post(`${API_BASE}/tenant/cms/pages`, xssPage, { headers: authHeaders });
    const pageId = createRes.data.data.id;
    const pageInDb = await prisma.page.findUnique({ where: { id: pageId }, include: { blocks: true } });
    const content = JSON.stringify(pageInDb?.blocks[0].content);
    if (!content.includes('<script>')) {
      results.security = 'PASSED (XSS removed successfully)';
    } else {
      results.security = 'FAILED (XSS detected in DB)';
    }

    // 2. Rate Limiting
    try {
      for (let i = 0; i < 7; i++) {
        await axios.post(`${API_BASE}/public/leads`, {
          tenantId: tenant.id,
          type: 'CONTACT',
          formData: { name: 'QA', email: 'test@qa.com' }
        });
      }
      results.rateLimiting = 'FAILED (Allowed > 5 submissions)';
    } catch (e: any) {
      if (e.response?.status === 429) {
        results.rateLimiting = 'PASSED (Correctly rejected with 429)';
      } else {
        results.rateLimiting = `FAILED (Unexpected status: ${e.response?.status})`;
      }
    }

    // 3. Caching
    const publicUrl = `${API_BASE}/public/website/${tenant.slug}/${xssPage.slug}`;
    const start1 = Date.now();
    await axios.get(publicUrl);
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    const res2 = await axios.get(publicUrl);
    const time2 = Date.now() - start2;
    
    if (res2.data.source === 'cache' && time2 < time1) {
      results.caching = `PASSED (Source: cache, Time: ${time2}ms vs ${time1}ms)`;
    } else {
      results.caching = `FAILED (Source: ${res2.data.source}, T2: ${time2}ms, T1: ${time1}ms)`;
    }

    // 4. SEO (Check Metadata in HTML)
    try {
       const htmlRes = await axios.get(`${WEB_BASE}/public/${tenant.slug}/home`);
       const html = htmlRes.data;
       const hasTitle = html.includes('<title>') && html.includes('Madarsa Darul Uloom');
       if (hasTitle) {
         results.seo = 'PASSED (Title exists in SSR HTML)';
       } else {
         results.seo = 'FAILED (Title/Meta missing from SSR HTML)';
       }
    } catch (e) {
       results.seo = 'FAILED (Could not fetch SSR HTML - Frontend might be down)';
    }

    // 5. Lead System (DB + Structured)
    const latestLead = await prisma.lead.findFirst({
      where: { name: 'QA' },
      orderBy: { createdAt: 'desc' }
    });
    if (latestLead) {
      results.leads = `PASSED (Found lead: ${latestLead.email})`;
    } else {
      results.leads = 'FAILED (Lead not found)';
    }

    // 6. Routing (Path Based)
    try {
       const routeRes = await axios.get(`${WEB_BASE}/${tenant.slug}/home`);
       if (routeRes.status === 200) {
         results.routing = 'PASSED (Path-based /tenant/page works)';
       }
    } catch (e) {
       results.routing = 'FAILED (Path-based routing returned error)';
    }

    console.log('\n========= FINAL QA REPORT =========');
    console.table(results);
    
    const allPassed = Object.values(results).every((v: any) => v.startsWith('PASSED'));
    if (allPassed) {
       console.log('\n🌟 ALL QA CHECKS PASSED SUCCESSFULLY 🌟');
    } else {
       console.log('\n⚠️ SOME CHECKS FAILED - NEEDS INVESTIGATION');
       process.exit(1);
    }

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

finalStrictVerification();
