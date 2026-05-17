import { Star, Quote } from 'lucide-react';

// Real testimonials only — no fake "Loading" stubs.
// Add new entries here as they come in.
const TESTIMONIALS = [
    {
        id: 1,
        name: 'Varun M.',
        role: 'Master of Computer Architecture',
        initials: 'VM',
        rating: 5,
        text: "Finally found a resume builder that's actually free! No hidden fees, no watermarks. The ATS-friendly templates helped me get past screening and land 3 interviews in one week.",
        date: 'November 2025',
    },
];

const TestimonialCard = ({ t, featured = false }) => (
    <div
        className={`bg-white p-8 lg:p-10 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 relative group ${featured ? 'max-w-2xl mx-auto' : ''}`}
    >
        <div className="absolute top-6 right-6 text-teal-50 group-hover:text-teal-100 transition-colors">
            <Quote size={featured ? 56 : 44} fill="currentColor" />
        </div>

        <div className="flex gap-1 mb-4 relative z-10">
            {[...Array(t.rating)].map((_, i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
            ))}
        </div>

        <p className={`text-slate-700 mb-6 leading-relaxed relative z-10 ${featured ? 'text-lg' : 'text-base'}`}>
            &ldquo;{t.text}&rdquo;
        </p>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-stone-50 font-semibold text-sm">
                {t.initials}
            </div>
            <div>
                <div className="font-semibold text-slate-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.role}</div>
            </div>
            <div className="ml-auto text-xs text-slate-400">{t.date}</div>
        </div>
    </div>
);

const Testimonials = () => {
    const list = TESTIMONIALS.filter(Boolean);

    if (list.length === 0) return null;

    // Single testimonial: featured centered card.
    if (list.length === 1) {
        return <TestimonialCard t={list[0]} featured />;
    }

    // Multiple: responsive grid.
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {list.map((t) => (
                <TestimonialCard key={t.id} t={t} />
            ))}
        </div>
    );
};

export default Testimonials;
