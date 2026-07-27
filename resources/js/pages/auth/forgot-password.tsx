import { Form } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import KasAuthLayout, {
    authErrorClass,
    authFieldClass,
    authLabelClass,
    authLinkClass,
    authMutedClass,
    authPrimaryButtonClass,
    authStatusClass,
} from '@/layouts/auth/kas-auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <KasAuthLayout
            head="Forgot password"
            title="Lupa kata sandi"
            description="Masukkan email untuk menerima tautan penyetelan ulang."
        >
            {status && <div className={authStatusClass}>{status}</div>}

            <Form {...email.form()} className="flex flex-col gap-[14px]">
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-[6px]">
                            <Label htmlFor="email" className={authLabelClass}>
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="nama@usaha.id"
                                className={authFieldClass}
                            />
                            <InputError
                                message={errors.email}
                                className={authErrorClass}
                            />
                        </div>

                        <Button
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                            className={authPrimaryButtonClass}
                        >
                            {processing && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            Kirim tautan setel ulang
                        </Button>
                    </>
                )}
            </Form>

            <p className={'m-0 text-center ' + authMutedClass}>
                Atau kembali ke{' '}
                <TextLink href={login()} className={authLinkClass}>
                    halaman masuk
                </TextLink>
            </p>
        </KasAuthLayout>
    );
}
