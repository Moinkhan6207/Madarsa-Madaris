import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_BASE = 'http://127.0.0.1:5001/api/v1';

async function verify() {
  console.log('🚀 Starting Production-Grade System Verification...');

  try {
    const tenant = await prisma.tenant.findFirst({ where: { slug: 'madarsa-darul-uloom' } });
    if (!tenant) throw new Error('Tenant not found');
    
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'superadmin@system.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    const authHeaders = { Authorization: `Bearer ${token}`, 'x-tenant-id': tenant.id };

    // 1. Sanitization & Validation Test
    console.log('\n🛡️ Phase 1: Security (Sanitization & Validation)');
    const xssPage = {
      title: 'XSS Test Page',
      slug: 'xss-test-' + Date.now(),
      blocks: [
        { 
          type: 'hero', 
          content: { en: { title: 'Safe Title <script>alert("XSS")</script>', subtitle: 'Subtitle' } }, 
          order: 0 
        }
      ],
      isPublished: true
    };

    const createRes = await axios.post(`${API_BASE}/tenant/cms/pages`, xssPage, { headers: authHeaders });
    const pageId = createRes.data.data.id;
    
    const pageInDb = await prisma.page.findUnique({ where: { id: pageId }, include: { blocks: true } });
    const heroTitle = (pageInDb?.blocks[0].content as any)?.en?.title;
    if (heroTitle.includes('<script>')) throw new Error('XSS Sanitization failed');
    console.log('✅ XSS Sanitization Verified (Script removed)');

    // Invalid Block Type Test
    try {
      await axios.post(`${API_BASE}/tenant/cms/pages`, { ...xssPage, slug: 'invalid-type', blocks: [{ type: 'unknown-block', content: {} }] }, { headers: authHeaders });
      throw new Error('Validation failed: Accepted unknown block type');
    } catch (e: any) {
      if (e.response?.status === 400 || e.response?.status === 422 || (e.response?.data?.error?.name === 'ZodError')) {
        console.log('✅ Block Type Validation Verified (Rejected unknown type)');
      } else { throw e; }
    }

    // 2. Performance & Caching Test
    console.log('\n⚡ Phase 2: Performance (Caching)');
    const publicUrl = `${API_BASE}/public/website/${tenant.slug}/${xssPage.slug}`;
    
    console.log('Fetching from DB...');
    const res1 = await axios.get(publicUrl);
    if (res1.data.source !== 'db') throw new Error('Initial fetch should be from DB');
    
    console.log('Fetching from Cache...');
    const res2 = await axios.get(publicUrl);
    if (res2.data.source !== 'cache') throw new Error('Subsequent fetch should be from Cache');
    console.log('✅ In-memory Caching Verified');

    // 3. Lead Engine Hardening (Rate Limiting)
    console.log('\n📨 Phase 3: Lead Engine (Rate Limiting)');
    const leadData = {
       tenantId: tenant.id,
       type: 'CONTACT',
       formData: { name: 'QA', email: 'qa@test.com', message: 'Hi' }
    };

    console.log('Submitting leads to test rate limit...');
    try {
      for (let i = 0; i < 7; i++) {
        await axios.post(`${API_BASE}/public/leads`, leadData);
      }
      throw new Error('Rate limit failed: Allowed > 5 submissions');
    } catch (e: any) {
      if (e.response?.status === 429) {
        console.log('✅ Lead Submission Rate Limiting Verified (Got 429)');
      } else { throw e; }
    }

    // 4. Schema Hardening (Structured Lead)
    console.log('\n📈 Phase 4: Schema Hardening (Structured Lead)');
    const latestLead = await prisma.lead.findFirst({
        where: { tenantId: tenant.id, name: 'QA' },
        orderBy: { createdAt: 'desc' }
    });
    if (!latestLead?.email || !latestLead?.name) throw new Error('Structured lead fields missing');
    console.log(`✅ Structured Lead Fields Verified (Email: ${latestLead.email})`);

    console.log('\n✨ PRODUCTION UPGRADE VERIFIED ✨');
  } catch (e) {
    console.error('\n❌ VERIFICATION FAILED');
    if (axios.isAxiosError(e)) {
      console.error(`Status: ${e.response?.status}`);
      console.error(`Data: ${JSON.stringify(e.response?.data, null, 2)}`);
    } else {
      console.error(e);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
