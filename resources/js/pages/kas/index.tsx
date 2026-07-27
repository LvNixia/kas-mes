import { Head } from '@inertiajs/react';
import KasDesktop from './desktop';
import KasMobile from './mobile';
import { C, useIsDesktop } from './shared';
import { useKas } from './use-kas';

const STYLES = `
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes toastin{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
.kas-mono{font-family:'IBM Plex Mono',monospace}
.kas-shell input:focus,.kas-shell select:focus,.kas-shell textarea:focus{outline:2px solid rgba(47,122,104,.3);outline-offset:1px}
.kas-nav:hover{background:rgba(246,242,234,.09) !important}
.kas-teal:hover{background:${C.tealDark} !important}
.kas-row:hover{background:${C.paper}}
.kas-edit:hover{border-color:${C.teal} !important;color:${C.teal} !important}
.kas-danger:hover{border-color:${C.rust} !important;color:${C.rust} !important}
.kas-drop:hover{border-color:${C.teal} !important}
.kas-day:hover{background:${C.paper}}
`;

export default function KasIndex() {
    const kas = useKas();
    const isDesktop = useIsDesktop();

    return (
        <div
            className="kas-shell"
            style={{
                fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            <Head title="Kas Mes">
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
                <style>{STYLES}</style>
            </Head>

            {isDesktop ? <KasDesktop {...kas} /> : <KasMobile {...kas} />}

            {kas.toast && (
                <div
                    style={{
                        position: 'fixed',
                        left: '50%',
                        bottom: isDesktop ? 26 : 112,
                        transform: 'translateX(-50%)',
                        background: C.navy,
                        color: C.cream,
                        padding: '12px 18px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 8px 26px rgba(0,0,0,.22)',
                        animation: 'toastin .25s ease both',
                        zIndex: 80,
                    }}
                >
                    {kas.toast}
                </div>
            )}
        </div>
    );
}
