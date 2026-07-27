import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

/** Input chrome: translucent on the navy mobile panel, solid on the cream desktop card. */
export const authFieldClass =
    'h-auto rounded-[12px] border-[rgba(246,242,234,0.18)] bg-[rgba(246,242,234,0.06)] px-[14px] py-[14px] text-[15px] font-medium text-[#f6f2ea] placeholder:text-[rgba(246,242,234,0.35)] md:text-[15px] lg:rounded-[9px] lg:border-[rgba(30,39,73,0.16)] lg:bg-white lg:px-[13px] lg:py-[12px] lg:text-[14px] lg:text-[#1e2749] lg:placeholder:text-[rgba(30,39,73,0.35)]';

export const authLabelClass =
    'text-[12px] font-semibold text-[rgba(246,242,234,0.6)] lg:text-[rgba(30,39,73,0.7)]';

export const authErrorClass = 'text-[12px] text-[#f0a878] lg:text-[#b8471f]';

/** Amber on the navy mobile panel, teal on the cream desktop card. */
export const authPrimaryButtonClass =
    'mt-[4px] h-auto w-full rounded-[14px] bg-[#f0b84e] py-[16px] text-[15px] font-bold text-[#1e2749] shadow-none hover:bg-[#e0a93f] lg:rounded-[9px] lg:bg-[#2f7a68] lg:py-[13px] lg:text-[14px] lg:font-semibold lg:text-[#f3f6ef] lg:hover:bg-[#1a3f5c]';

export const authGhostButtonClass =
    'h-auto w-full rounded-[12px] border border-[rgba(246,242,234,0.22)] bg-transparent py-[14px] text-[14px] font-semibold text-[#f6f2ea] shadow-none hover:bg-[rgba(246,242,234,0.08)] hover:text-[#f6f2ea] lg:rounded-[9px] lg:border-[rgba(30,39,73,0.16)] lg:bg-white lg:py-[12px] lg:text-[#1e2749] lg:hover:bg-[rgba(30,39,73,0.04)] lg:hover:text-[#1e2749]';

export const authMutedClass =
    'text-[12.5px] text-[rgba(246,242,234,0.55)] lg:text-[rgba(30,39,73,0.5)]';

export const authLinkClass =
    'font-semibold text-[#f0b84e] no-underline hover:underline lg:text-[#2f7a68]';

export const authStatusClass =
    'rounded-[9px] bg-[rgba(47,122,104,0.14)] px-[13px] py-[10px] text-center text-[12.5px] font-medium text-[#f0b84e] lg:bg-[rgba(47,122,104,0.1)] lg:text-[#2f7a68]';

/**
 * Repaints the shared passkey component from the outside so it keeps its own
 * behaviour while matching the surrounding panel.
 */
export const authPasskeyClass =
    '[&_[data-slot=separator-root]]:bg-[rgba(246,242,234,0.18)] lg:[&_[data-slot=separator-root]]:bg-[rgba(30,39,73,0.14)] [&_button]:h-auto [&_button]:w-full [&_button]:rounded-[12px] [&_button]:border-[rgba(246,242,234,0.22)] [&_button]:bg-transparent [&_button]:py-[14px] [&_button]:text-[14px] [&_button]:font-semibold [&_button]:text-[#f6f2ea] [&_button]:shadow-none lg:[&_button]:rounded-[9px] lg:[&_button]:border-[rgba(30,39,73,0.16)] lg:[&_button]:bg-white lg:[&_button]:py-[12px] lg:[&_button]:text-[#1e2749] [&_button:hover]:bg-[rgba(246,242,234,0.08)] [&_button:hover]:text-[#f6f2ea] lg:[&_button:hover]:bg-[rgba(30,39,73,0.04)] lg:[&_button:hover]:text-[#1e2749] [&_span]:bg-[#1e2749] [&_span]:text-[rgba(246,242,234,0.45)] lg:[&_span]:bg-[#f6f2ea] lg:[&_span]:text-[rgba(30,39,73,0.45)]';

type Props = {
    /** Browser tab title. */
    head: string;
    /** Heading shown above the form. */
    title: string;
    description?: string;
    /** Headline on the brand panel; defaults to the marketing copy. */
    mobileHeadline?: string;
    mobileSubline?: string;
    /** Login already shows its headline on the navy panel, so it hides this one. */
    hideHeadingOnMobile?: boolean;
    children: ReactNode;
};

export default function KasAuthLayout({
    head,
    title,
    description,
    mobileHeadline,
    mobileSubline,
    hideHeadingOnMobile = false,
    children,
}: Props) {
    return (
        <div className="grid min-h-screen bg-[#1e2749] font-['Plus_Jakarta_Sans',system-ui,sans-serif] antialiased lg:grid-cols-[1.05fr_.95fr]">
            <Head title={head}>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Brand panel — full bleed on mobile, left column on desktop */}
            <div className="flex flex-col gap-[30px] bg-[#1e2749] px-[26px] pt-[112px] text-[#f6f2ea] lg:justify-between lg:gap-0 lg:px-[60px] lg:py-[56px]">
                <div className="flex items-center gap-[10px]">
                    <div className="size-[24px] rounded-[7px] bg-[#f0b84e] lg:size-[26px]" />
                    <span className="text-[15px] font-bold tracking-[-0.01em]">
                        Kas Mes
                    </span>
                </div>

                <div className="mt-[20px] flex max-w-[460px] flex-col gap-[10px] lg:mt-0 lg:gap-[22px]">
                    <h1 className="m-0 text-[34px] leading-[1.08] font-extrabold tracking-[-0.03em] text-pretty lg:text-[52px] lg:leading-[1.03] lg:tracking-[-0.035em]">
                        <span className="lg:hidden">
                            {mobileHeadline ?? title}
                        </span>
                        <span className="hidden lg:inline">
                            Catat iuran dan pengeluaran mes tanpa ribet.
                        </span>
                    </h1>
                    <p className="m-0 max-w-[400px] text-[14px] leading-[1.6] text-[rgba(246,242,234,0.62)] lg:text-[15px]">
                        <span className="lg:hidden">
                            {mobileSubline ?? description}
                        </span>
                        <span className="hidden lg:inline">
                            Satu tempat untuk iuran penghuni, belanja dapur,
                            laporan harian sampai tahunan, dan cadangan data
                            mes.
                        </span>
                    </p>

                    <div className="hidden gap-[34px] border-t border-[rgba(246,242,234,0.15)] pt-[8px] lg:flex">
                        {[
                            ['3 dtk', 'input transaksi'],
                            ['PDF · XLS', 'ekspor laporan'],
                        ].map(([value, caption]) => (
                            <div
                                key={caption}
                                className="flex flex-col gap-[3px] pt-[14px]"
                            >
                                <span className="kas-mono text-[20px] font-semibold text-[#f0b84e]">
                                    {value}
                                </span>
                                <span className="text-[11.5px] text-[rgba(246,242,234,0.5)]">
                                    {caption}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <span className="hidden text-[11.5px] text-[rgba(246,242,234,0.38)] lg:block">
                    © 2026 Kas Mes · versi 1.0
                </span>
            </div>

            {/* Form panel */}
            <div className="flex flex-col justify-end bg-[#1e2749] px-[26px] pt-[30px] pb-[54px] lg:items-center lg:justify-center lg:bg-[#f6f2ea] lg:p-[40px]">
                <div className="flex w-full flex-col gap-[12px] lg:max-w-[372px] lg:gap-[24px]">
                    <div
                        className={
                            (hideHeadingOnMobile ? 'hidden lg:flex' : 'flex') +
                            ' flex-col gap-[7px]'
                        }
                    >
                        <h2 className="m-0 text-[22px] font-bold tracking-[-0.025em] text-[#f6f2ea] lg:text-[26px] lg:text-[#1e2749]">
                            {title}
                        </h2>
                        {description && (
                            <p className="m-0 text-[13.5px] text-[rgba(246,242,234,0.55)] lg:text-[rgba(30,39,73,0.55)]">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
