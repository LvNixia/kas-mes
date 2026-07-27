import { Form } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import KasAuthLayout, {
    authGhostButtonClass,
    authLinkClass,
    authMutedClass,
    authStatusClass,
} from '@/layouts/auth/kas-auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <KasAuthLayout
            head="Email verification"
            title="Verifikasi email"
            description="Klik tautan yang baru kami kirim ke email Anda untuk memverifikasi akun."
        >
            {status === 'verification-link-sent' && (
                <div className={authStatusClass}>
                    Tautan verifikasi baru sudah dikirim ke email yang Anda
                    daftarkan.
                </div>
            )}

            <Form {...send.form()} className="flex flex-col gap-[14px]">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            variant="secondary"
                            className={authGhostButtonClass}
                        >
                            {processing && <Spinner />}
                            Kirim ulang email verifikasi
                        </Button>

                        <p className={'m-0 text-center ' + authMutedClass}>
                            <TextLink href={logout()} className={authLinkClass}>
                                Keluar
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </KasAuthLayout>
    );
}
