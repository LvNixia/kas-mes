import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import KasAuthLayout, {
    authErrorClass,
    authFieldClass,
    authLabelClass,
    authLinkClass,
    authMutedClass,
    authPasskeyClass,
    authPrimaryButtonClass,
    authStatusClass,
} from '@/layouts/auth/kas-auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <KasAuthLayout
            head="Log in"
            title="Masuk ke akun"
            description="Gunakan akun bendahara yang terdaftar."
            mobileHeadline="Catat kas mes langsung dari genggaman."
            mobileSubline="Masuk untuk melanjutkan pencatatan kas mes."
            hideHeadingOnMobile
        >
            {status && <div className={authStatusClass}>{status}</div>}

            <div className={authPasskeyClass}>
                <PasskeyVerify
                    label="Masuk dengan passkey"
                    loadingLabel="Memverifikasi…"
                    separator="atau lanjut dengan email"
                />
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-[14px]"
            >
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
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="nama@usaha.id"
                                className={authFieldClass}
                            />
                            <InputError
                                message={errors.email}
                                className={authErrorClass}
                            />
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <Label
                                htmlFor="password"
                                className={authLabelClass}
                            >
                                Kata sandi
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className={authFieldClass}
                            />
                            <InputError
                                message={errors.password}
                                className={authErrorClass}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-[10px] text-[12.5px] text-[rgba(246,242,234,0.6)] lg:text-[rgba(30,39,73,0.6)]">
                            <div className="flex items-center gap-[7px]">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="size-[14px] border-[rgba(246,242,234,0.35)] data-[state=checked]:border-[#2f7a68] data-[state=checked]:bg-[#2f7a68] data-[state=checked]:text-[#f3f6ef] lg:border-[rgba(30,39,73,0.3)]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer text-[12.5px] font-normal text-[rgba(246,242,234,0.6)] lg:text-[rgba(30,39,73,0.6)]"
                                >
                                    Ingat saya
                                </Label>
                            </div>
                            {canResetPassword && (
                                <TextLink
                                    href={request()}
                                    tabIndex={5}
                                    className="text-[12.5px] text-[rgba(246,242,234,0.6)] no-underline hover:text-[#f0b84e] lg:text-[#2f7a68] lg:hover:text-[#1a3f5c]"
                                >
                                    Lupa sandi?
                                </TextLink>
                            )}
                        </div>

                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                            className={authPrimaryButtonClass}
                        >
                            {processing && <Spinner />}
                            Masuk
                        </Button>
                    </>
                )}
            </Form>

            <p className={'m-0 text-center ' + authMutedClass}>
                Belum punya akun?{' '}
                <TextLink
                    href={register()}
                    tabIndex={5}
                    className={authLinkClass}
                >
                    Daftar
                </TextLink>
            </p>
        </KasAuthLayout>
    );
}
