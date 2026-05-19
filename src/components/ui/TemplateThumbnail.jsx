// TemplateThumbnail — adapted from the claude.ai/design ThumbPaper pattern.
// Renders distinct headers per layout family with placeholder content bars,
// sized for thumbnail display (no scaling artifacts from a giant A4 page).

import { useEffect, useRef, useState } from 'react';

const DEFAULT_SAMPLE = {
    name: 'Sofia Andersson',
    title: 'Senior Product Designer',
    email: 'sofia@andersson.studio',
    phone: '+46 70 555 0142',
    location: 'Stockholm',
    site: 'sofia.andersson.studio',
};

// Build a thumbnail-display sample from the user's actual personal data.
// Empty fields fall back to defaults so the thumbnail never looks broken.
const buildSample = (personal) => {
    if (!personal) return DEFAULT_SAMPLE;
    const socialUrl = personal.socials?.[0]?.url || '';
    return {
        name: personal.fullName || DEFAULT_SAMPLE.name,
        title: personal.title || DEFAULT_SAMPLE.title,
        email: personal.email || DEFAULT_SAMPLE.email,
        phone: personal.phone || DEFAULT_SAMPLE.phone,
        location: personal.location || DEFAULT_SAMPLE.location,
        site: socialUrl.replace(/^https?:\/\//, '') || DEFAULT_SAMPLE.site,
    };
};

// `sample` flows down as a prop: TemplateThumbnail → ThumbContent → ThumbBody.
// We avoid a module-level mutable variable so renders stay pure (eslint
// `react-hooks` rule).

const accentFor = (layout) =>
    layout === 'gold'
        ? '#A07B1F'
        : layout === 'executive'
          ? '#0F172A'
          : layout === 'leaf'
            ? '#0F766E'
            : layout === 'creative'
              ? '#0F766E'
              : layout === 'glitch'
                ? '#06B6D4'
                : layout === 'google'
                  ? '#1A73E8'
                  : layout === 'bold-recruit'
                    ? '#DC2626'
                    : layout === 'navy-modern'
                      ? '#0F2C5E'
                      : layout === 'executive-serif'
                        ? '#0F172A'
                        : layout === 'minimal-mono'
                          ? '#0F172A'
                          : '#0F172A';

const headFontFor = (layout, px) => {
    const accent = accentFor(layout);
    if (
        [
            'google',
            'ats',
            'jakes',
            'modern-grid',
            'executive',
            'gold',
            'glitch',
            'canvas',
            'sidebar-left',
            'sidebar-right',
            'deedy',
        ].includes(layout)
    ) {
        return {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: px(7),
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            borderBottom: `1px solid ${accent}`,
            paddingBottom: px(2),
            color: accent,
        };
    }
    return {
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontWeight: 400,
        fontSize: px(11),
        color: accent,
        letterSpacing: '-0.005em',
    };
};

// ThumbBody renders the lower portion of the thumbnail (Experience + Skills
// placeholders). It intentionally uses fixed sample copy — varying every
// thumbnail's body by the user's actual data would make the gallery look like
// 6 copies of the same thing. Only the headers personalize (via ThumbContent).
const ThumbBody = ({ layout, px }) => {
    const headStyle = headFontFor(layout, px);
    const bullet = (width) => (
        <div style={{ height: px(2), background: '#E2E8F0', borderRadius: 1, width, marginBottom: px(2) }} />
    );
    return (
        <>
            <section style={{ marginTop: px(10) }}>
                <div style={headStyle}>Experience</div>
                <div style={{ marginTop: px(5) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: px(7), fontWeight: 600, color: '#0F172A' }}>
                            Senior Product Designer
                        </span>
                        <span style={{ fontSize: px(6), color: '#64748B' }}>2022 – pres.</span>
                    </div>
                    <div style={{ fontSize: px(6), fontWeight: 500, color: '#64748B', marginBottom: px(2) }}>
                        Helix
                    </div>
                    {bullet('90%')}
                    {bullet('72%')}
                    {bullet('84%')}
                </div>
                <div style={{ marginTop: px(5) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: px(7), fontWeight: 600, color: '#0F172A' }}>
                            Product Designer
                        </span>
                        <span style={{ fontSize: px(6), color: '#64748B' }}>2019 – 2022</span>
                    </div>
                    <div style={{ fontSize: px(6), fontWeight: 500, color: '#64748B', marginBottom: px(2) }}>
                        Field &amp; Co.
                    </div>
                    {bullet('86%')}
                    {bullet('64%')}
                </div>
            </section>
            <section style={{ marginTop: px(8) }}>
                <div style={headStyle}>Skills</div>
                <div style={{ marginTop: px(5), display: 'flex', flexWrap: 'wrap', gap: px(2) }}>
                    {['Figma', 'Design systems', 'Prototyping', 'Research', 'Writing'].map((s) => (
                        <span
                            key={s}
                            style={{
                                fontSize: px(5.5),
                                padding: `${px(1)}px ${px(4)}px`,
                                background: layout === 'creative' ? '#0F766E' : '#F1F5F9',
                                color: layout === 'creative' ? '#fff' : '#334155',
                                borderRadius: 999,
                            }}
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </section>
        </>
    );
};

const ThumbContent = ({ layout, w, sample }) => {
    const px = (n) => (n * w) / 240;

    // ─── Header variants ─────────────────────────────────────────────
    if (['classic', 'minimal', 'leaf', 'freeform'].includes(layout)) {
        const isLeaf = layout === 'leaf';
        return (
            <div style={{ padding: `${px(16)}px ${px(18)}px` }}>
                <header style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            fontFamily: isLeaf
                                ? '"Instrument Serif", Georgia, serif'
                                : 'Inter, system-ui, sans-serif',
                            fontWeight: isLeaf ? 400 : 600,
                            fontSize: px(isLeaf ? 18 : 15),
                            letterSpacing: isLeaf ? '-0.01em' : '-0.005em',
                            lineHeight: 1,
                        }}
                    >
                        {sample.name}
                    </div>
                    <div
                        style={{
                            marginTop: px(2),
                            fontSize: px(7),
                            color: isLeaf ? '#0F766E' : '#334155',
                            fontStyle: isLeaf ? 'italic' : 'normal',
                        }}
                    >
                        {sample.title}
                    </div>
                    <div
                        style={{
                            marginTop: px(3),
                            fontSize: px(5.5),
                            color: '#64748B',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: px(3),
                        }}
                    >
                        <span>{sample.email}</span>
                        <span>·</span>
                        <span>SF</span>
                        <span>·</span>
                        <span>{sample.site}</span>
                    </div>
                    <div style={{ height: 1, background: '#0F172A', marginTop: px(8) }} />
                </header>
                <ThumbBody layout={layout} px={px} />
            </div>
        );
    }

    if (['google', 'ats', 'jakes'].includes(layout)) {
        const isGoogle = layout === 'google';
        return (
            <div style={{ padding: `${px(16)}px ${px(18)}px` }}>
                <header style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 600,
                            fontSize: px(16),
                            letterSpacing: '-0.005em',
                            lineHeight: 1,
                            color: isGoogle ? '#202124' : '#0F172A',
                        }}
                    >
                        {sample.name}
                    </div>
                    {isGoogle && (
                        <div style={{ marginTop: px(1), fontSize: px(6.5), color: '#5F6368' }}>
                            {sample.title}
                        </div>
                    )}
                    <div
                        style={{
                            marginTop: px(3),
                            fontSize: px(5.5),
                            color: '#64748B',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: px(3),
                        }}
                    >
                        <span>{sample.email}</span>
                        <span>·</span>
                        <span>{sample.phone}</span>
                        <span>·</span>
                        <span>{sample.location}</span>
                    </div>
                    {isGoogle && (
                        <div
                            style={{
                                height: px(2),
                                width: px(20),
                                background: '#1A73E8',
                                margin: `${px(5)}px auto 0`,
                            }}
                        />
                    )}
                </header>
                <ThumbBody layout={layout} px={px} />
            </div>
        );
    }

    if (['modern-grid', 'executive', 'gold', 'canvas'].includes(layout)) {
        return (
            <div style={{ padding: `${px(16)}px ${px(18)}px` }}>
                <header>
                    <div
                        style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 800,
                            fontSize: px(14),
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            lineHeight: 1,
                        }}
                    >
                        {sample.name}
                    </div>
                    <div
                        style={{
                            marginTop: px(2),
                            color: accentFor(layout),
                            fontSize: px(6),
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        {sample.title}
                    </div>
                    <div style={{ marginTop: px(3), fontSize: px(5.5), color: '#64748B' }}>
                        {sample.email} · {sample.location} · {sample.site}
                    </div>
                </header>
                <ThumbBody layout={layout} px={px} />
            </div>
        );
    }

    if (['sidebar-left', 'sidebar-right', 'deedy'].includes(layout)) {
        const sidebarOnRight = layout === 'sidebar-right';
        const sidebar = (
            <div
                style={{
                    width: w * 0.34,
                    background: '#0F172A',
                    color: '#FAFAF9',
                    padding: `${px(14)}px ${px(12)}px`,
                }}
            >
                <div
                    style={{
                        width: px(40),
                        height: px(40),
                        borderRadius: 9999,
                        background: '#CBD5E1',
                        marginBottom: px(8),
                    }}
                />
                <div
                    style={{
                        fontSize: px(5),
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: px(3),
                    }}
                >
                    Contact
                </div>
                <div style={{ fontSize: px(5.5), color: '#E2E8F0', marginBottom: px(2) }}>{sample.email}</div>
                <div style={{ fontSize: px(5.5), color: '#E2E8F0', marginBottom: px(2) }}>{sample.phone}</div>
                <div style={{ fontSize: px(5.5), color: '#E2E8F0', marginBottom: px(8) }}>
                    {sample.location}
                </div>
                <div
                    style={{
                        fontSize: px(5),
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: px(3),
                    }}
                >
                    Skills
                </div>
                {['Figma', 'Design systems', 'Research', 'Writing'].map((s) => (
                    <div key={s} style={{ fontSize: px(5.5), color: '#E2E8F0', marginBottom: px(1.5) }}>
                        · {s}
                    </div>
                ))}
            </div>
        );
        const main = (
            <div style={{ flex: 1, padding: `${px(14)}px ${px(12)}px` }}>
                <div
                    style={{
                        fontFamily: '"Instrument Serif", Georgia, serif',
                        fontStyle: 'italic',
                        fontSize: px(15),
                        letterSpacing: '-0.01em',
                        lineHeight: 1,
                    }}
                >
                    {sample.name}
                </div>
                <div style={{ fontSize: px(6.5), color: '#475569', marginTop: px(1.5) }}>{sample.title}</div>
                <section style={{ marginTop: px(7) }}>
                    <div
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: px(7),
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid #0F172A',
                            paddingBottom: px(2),
                        }}
                    >
                        Experience
                    </div>
                    <div style={{ marginTop: px(4) }}>
                        <div style={{ fontSize: px(7), fontWeight: 600 }}>Senior Designer</div>
                        <div style={{ fontSize: px(5.5), color: '#64748B' }}>Helix · 2022–pres.</div>
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    height: px(2),
                                    background: '#E2E8F0',
                                    borderRadius: 1,
                                    width: i === 1 ? '85%' : '70%',
                                    marginTop: px(2.5),
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ marginTop: px(5) }}>
                        <div style={{ fontSize: px(7), fontWeight: 600 }}>Product Designer</div>
                        <div style={{ fontSize: px(5.5), color: '#64748B' }}>Field &amp; Co.</div>
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    height: px(2),
                                    background: '#E2E8F0',
                                    borderRadius: 1,
                                    width: i === 1 ? '90%' : '60%',
                                    marginTop: px(2.5),
                                }}
                            />
                        ))}
                    </div>
                </section>
            </div>
        );
        return (
            <div style={{ display: 'flex', height: '100%' }}>
                {sidebarOnRight ? (
                    <>
                        {main}
                        {sidebar}
                    </>
                ) : (
                    <>
                        {sidebar}
                        {main}
                    </>
                )}
            </div>
        );
    }

    if (layout === 'creative') {
        return (
            <div style={{ padding: `${px(16)}px ${px(18)}px` }}>
                <header>
                    <div
                        style={{
                            fontFamily: '"Instrument Serif", Georgia, serif',
                            fontWeight: 400,
                            fontSize: px(22),
                            letterSpacing: '-0.02em',
                            lineHeight: 0.95,
                        }}
                    >
                        Anna
                        <br />
                        <em style={{ color: '#0F766E' }}>Reyes</em>
                    </div>
                    <div style={{ marginTop: px(4), fontSize: px(6.5), color: '#334155' }}>
                        {sample.title}
                    </div>
                    <div style={{ marginTop: px(2), fontSize: px(5.5), color: '#64748B' }}>
                        {sample.email} · {sample.location}
                    </div>
                </header>
                <ThumbBody layout={layout} px={px} />
            </div>
        );
    }

    if (layout === 'executive-serif') {
        const bullet = (w) => (
            <div
                style={{
                    height: px(2),
                    background: '#E2E8F0',
                    borderRadius: 1,
                    width: w,
                    marginBottom: px(2),
                    marginLeft: px(6),
                }}
            />
        );
        const headStyle = {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontWeight: 700,
            fontSize: px(7),
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: '#0F172A',
            borderBottom: '1px solid #0F172A',
            paddingBottom: px(2),
        };
        return (
            <div
                style={{
                    padding: `${px(18)}px ${px(20)}px`,
                    fontFamily: 'Georgia, "Times New Roman", serif',
                }}
            >
                <header style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            fontSize: px(15),
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            lineHeight: 1,
                        }}
                    >
                        {sample.name}
                    </div>
                    <div style={{ marginTop: px(2), fontSize: px(7), fontStyle: 'italic', color: '#475569' }}>
                        {sample.title}
                    </div>
                    <div style={{ marginTop: px(4), fontSize: px(5.5), color: '#0F172A' }}>
                        {sample.email} • {sample.phone} • {sample.location}
                    </div>
                    <div style={{ height: 1, background: '#0F172A', marginTop: px(5) }} />
                </header>
                <section style={{ marginTop: px(6) }}>
                    <div style={headStyle}>Experience</div>
                    <div style={{ marginTop: px(4) }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: px(7), fontWeight: 700 }}>Helix, San Francisco</span>
                            <span style={{ fontSize: px(5.5), color: '#475569' }}>2022 – pres.</span>
                        </div>
                        <div style={{ fontSize: px(6.5), fontStyle: 'italic', marginBottom: px(2) }}>
                            Senior Designer
                        </div>
                        {bullet('88%')}
                        {bullet('72%')}
                    </div>
                </section>
            </div>
        );
    }

    if (layout === 'navy-modern') {
        const NAVY = '#0F2C5E';
        const headStyle = {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: px(7),
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: NAVY,
        };
        const bullet = (w) => (
            <div
                style={{
                    height: px(2),
                    background: '#E2E8F0',
                    borderRadius: 1,
                    width: w,
                    marginBottom: px(2),
                    marginLeft: px(6),
                }}
            />
        );
        return (
            <div style={{ padding: `${px(14)}px ${px(16)}px` }}>
                <header
                    style={{ borderBottom: '1px solid #CBD5E1', paddingBottom: px(4), marginBottom: px(4) }}
                >
                    <div
                        style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 800,
                            fontSize: px(17),
                            color: NAVY,
                            lineHeight: 1,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {sample.name}
                    </div>
                    <div style={{ marginTop: px(2), fontSize: px(7), color: '#475569' }}>{sample.title}</div>
                    <div style={{ marginTop: px(2), fontSize: px(5.5), color: '#0F172A' }}>
                        {sample.phone} · {sample.email} · {sample.location}
                    </div>
                </header>
                <section style={{ marginTop: px(5) }}>
                    <div style={headStyle}>Experience</div>
                    <div style={{ height: px(2), width: px(18), background: NAVY, marginTop: px(2) }} />
                    <div style={{ marginTop: px(4) }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: px(7), fontWeight: 700, color: NAVY }}>
                                Senior Designer · Helix
                            </span>
                            <span style={{ fontSize: px(5.5), color: '#475569' }}>2022 – pres.</span>
                        </div>
                        {bullet('86%')}
                        {bullet('72%')}
                    </div>
                </section>
                <section style={{ marginTop: px(6) }}>
                    <div style={headStyle}>Skills</div>
                    <div style={{ height: px(2), width: px(18), background: NAVY, marginTop: px(2) }} />
                    <div style={{ marginTop: px(3), display: 'flex', flexWrap: 'wrap', gap: px(2) }}>
                        {['Figma', 'React', 'AWS', 'SQL'].map((s) => (
                            <span
                                key={s}
                                style={{
                                    fontSize: px(5.5),
                                    padding: `${px(1)}px ${px(4)}px`,
                                    background: '#E0EAFC',
                                    color: NAVY,
                                    borderRadius: 3,
                                }}
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    if (layout === 'minimal-mono') {
        const bullet = (w) => (
            <div
                style={{
                    height: px(2),
                    background: '#E2E8F0',
                    borderRadius: 1,
                    width: w,
                    marginBottom: px(1.5),
                    marginLeft: px(6),
                }}
            />
        );
        const headStyle = {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: px(6.5),
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#0F172A',
        };
        return (
            <div style={{ padding: `${px(14)}px ${px(16)}px` }}>
                <header>
                    <div
                        style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 700,
                            fontSize: px(14),
                            lineHeight: 1,
                            color: '#0F172A',
                        }}
                    >
                        {sample.name}
                    </div>
                    <div style={{ marginTop: px(1), fontSize: px(6.5), color: '#475569' }}>
                        {sample.title}
                    </div>
                    <div style={{ marginTop: px(2), fontSize: px(5), color: '#0F172A' }}>
                        {sample.phone} | {sample.email} | {sample.location}
                    </div>
                </header>
                <section style={{ marginTop: px(8) }}>
                    <div style={headStyle}>Experience</div>
                    <div style={{ marginTop: px(3) }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: px(6.5), color: '#0F172A' }}>
                                <b>Senior Designer</b> — Helix
                            </span>
                            <span style={{ fontSize: px(5.5), color: '#475569' }}>2022 – pres.</span>
                        </div>
                        {bullet('86%')}
                        {bullet('70%')}
                    </div>
                </section>
                <section style={{ marginTop: px(6) }}>
                    <div style={headStyle}>Skills</div>
                    <div style={{ marginTop: px(3), fontSize: px(5.5), color: '#0F172A', lineHeight: 1.5 }}>
                        Figma, Design systems, React, AWS, SQL, Prototyping, Research
                    </div>
                </section>
            </div>
        );
    }

    if (layout === 'bold-recruit') {
        const RED = '#DC2626';
        const headStyle = {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: px(8),
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: RED,
            borderBottom: '1px solid #CBD5E1',
            paddingBottom: px(2),
        };
        const bullet = (w) => (
            <div
                style={{
                    height: px(2),
                    background: '#E2E8F0',
                    borderRadius: 1,
                    width: w,
                    marginBottom: px(2),
                    marginLeft: px(6),
                }}
            />
        );
        return (
            <div style={{ padding: `${px(14)}px ${px(16)}px` }}>
                <header>
                    <div
                        style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 800,
                            fontSize: px(18),
                            color: RED,
                            lineHeight: 1,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {sample.name}
                    </div>
                    <div
                        style={{
                            marginTop: px(3),
                            fontSize: px(5.5),
                            color: '#0F172A',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: px(2),
                        }}
                    >
                        <span>{sample.phone}</span>
                        <span style={{ color: '#CBD5E1' }}>|</span>
                        <span>{sample.email}</span>
                        <span style={{ color: '#CBD5E1' }}>|</span>
                        <span>{sample.location}</span>
                    </div>
                    <div style={{ height: 1, background: '#CBD5E1', marginTop: px(5) }} />
                </header>

                <section style={{ marginTop: px(6) }}>
                    <div style={headStyle}>Summary</div>
                    <div style={{ marginTop: px(3) }}>
                        {bullet('92%')}
                        {bullet('78%')}
                    </div>
                </section>

                <section style={{ marginTop: px(6) }}>
                    <div style={headStyle}>Skills</div>
                    <div style={{ marginTop: px(3) }}>
                        {['Languages: Python, SQL', 'Cloud: AWS, GCP', 'Tools: Docker, K8s'].map((s) => (
                            <div
                                key={s}
                                style={{
                                    fontSize: px(5.5),
                                    color: '#0F172A',
                                    marginBottom: px(1),
                                    paddingLeft: px(6),
                                    textIndent: -px(6),
                                }}
                            >
                                – <span style={{ fontWeight: 700 }}>{s.split(':')[0]}:</span>
                                {s.split(':')[1]}
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginTop: px(6) }}>
                    <div style={headStyle}>Experience</div>
                    <div style={{ marginTop: px(3) }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                            }}
                        >
                            <span style={{ fontSize: px(6.5), color: '#0F172A' }}>
                                <b>Analyst</b>, Helix | SF
                            </span>
                            <span style={{ fontSize: px(5.5), color: '#475569' }}>2022 – pres.</span>
                        </div>
                        {bullet('88%')}
                        {bullet('70%')}
                    </div>
                </section>
            </div>
        );
    }

    if (layout === 'glitch') {
        return (
            <div
                style={{
                    padding: `${px(16)}px ${px(18)}px`,
                    background: '#020617',
                    color: '#E2E8F0',
                    height: '100%',
                }}
            >
                <header>
                    <div
                        style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: px(14),
                            color: '#06B6D4',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {sample.name}
                    </div>
                    <div
                        style={{
                            marginTop: px(2),
                            color: '#06B6D4',
                            fontSize: px(6),
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {sample.title}
                    </div>
                    <div style={{ marginTop: px(3), fontSize: px(5.5), color: '#94A3B8' }}>
                        {sample.email} · {sample.location}
                    </div>
                </header>
                <section style={{ marginTop: px(10) }}>
                    <div
                        style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: px(7),
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase',
                            borderBottom: '1px solid #06B6D4',
                            paddingBottom: px(2),
                            color: '#06B6D4',
                        }}
                    >
                        Experience
                    </div>
                    <div style={{ marginTop: px(5) }}>
                        <div style={{ fontSize: px(7), fontWeight: 600, color: '#E2E8F0' }}>
                            Senior Designer
                        </div>
                        <div style={{ fontSize: px(6), color: '#94A3B8' }}>Helix · 2022 – pres.</div>
                        <div
                            style={{ height: px(2), background: '#334155', width: '90%', marginTop: px(2) }}
                        />
                        <div
                            style={{ height: px(2), background: '#334155', width: '70%', marginTop: px(2) }}
                        />
                    </div>
                </section>
            </div>
        );
    }

    // default fallback: classic-style
    return (
        <div style={{ padding: `${px(16)}px ${px(18)}px` }}>
            <header style={{ textAlign: 'center' }}>
                <div
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: px(15),
                        lineHeight: 1,
                    }}
                >
                    {sample.name}
                </div>
                <div style={{ marginTop: px(2), fontSize: px(7), color: '#334155' }}>{sample.title}</div>
            </header>
            <ThumbBody layout={layout} px={px} />
        </div>
    );
};

const TemplateThumbnail = ({ layout, selected, personal }) => {
    const ref = useRef(null);
    const [width, setWidth] = useState(240);

    useEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver((entries) => {
            for (const e of entries) setWidth(Math.round(e.contentRect.width));
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, []);

    // Build a display sample from the user's actual personal data, with the
    // default Anna Reyes sample as fallback on screens where personal is null
    // (e.g. the marketing landing page).
    const sample = buildSample(personal);

    return (
        <div
            ref={ref}
            className="relative w-full aspect-[210/297] bg-white overflow-hidden"
            style={{ color: '#0F172A', lineHeight: 1.35 }}
        >
            <div style={{ position: 'absolute', inset: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
                <ThumbContent layout={layout} w={width} sample={sample} />
            </div>
            {selected && (
                <div className="absolute inset-0 ring-2 ring-slate-900 rounded pointer-events-none" />
            )}
        </div>
    );
};

export default TemplateThumbnail;
