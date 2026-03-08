import { useState } from 'react';
import { useFaqsQuery } from '@/features/cms/api';
import { PageLoader } from '@/components/ui/Spinner';
import { Helmet } from 'react-helmet-async';
import { fallbackFaqs } from '@/lib/fallbackData';

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export function FaqPage() {
  const { data, isLoading } = useFaqsQuery();
  const apiFaqs: Faq[] = data?.data ?? [];
  const faqs: Faq[] = apiFaqs.length > 0 ? apiFaqs : fallbackFaqs;
  const [openId, setOpenId] = useState<number | null>(null);

  if (isLoading) return <PageLoader />;

  // Group by category
  const grouped = faqs.reduce<Record<string, Faq[]>>((acc, faq) => {
    const cat = faq.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  return (
    <>
      <Helmet>
        <title>FAQ - Dhanvanthiri Foods</title>
        <meta name="description" content="Frequently asked questions about Dhanvanthiri Foods products, shipping, and orders." />
      </Helmet>

      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h1>
          <p className="mt-1 text-slate-600">Find answers to common questions about our products and services.</p>
        </div>

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-semibold text-slate-800">{category}</h2>
            <div className="space-y-2">
              {items.map((faq) => (
                <div key={faq.id} className="rounded-xl border bg-white transition-shadow hover:shadow-sm">
                  <button
                    onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-medium text-slate-900">{faq.question}</span>
                    <span className={`ml-2 text-slate-400 transition-transform duration-200 ${openId === faq.id ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {openId === faq.id && (
                    <div className="border-t px-4 py-3 animate-fade-in">
                      <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
