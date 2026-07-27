import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import KasAuthLayout, {
    authErrorClass,
    authFieldClass,
    authLabelClass,
    authLinkClass,
    authMutedClass,
    authPrimaryButtonClass,
} from '@/layouts/auth/kas-auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <KasAuthLayout
            head="Register"
            title="Buat akun"
            description="Isi data di bawah untuk membuat akun bendahara."
        >
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-[14px]"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-[6px]">
                            <Label htmlFor="name" className={authLabelClass}>
                                Nama
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="name"
                                name="name"
                                placeholder="Nama lengkap"
                                className={authFieldClass}
                            />
                            <InputError
                                message={errors.name}
                                className={authErrorClass}
                            />
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <Label htmlFor="email" className={authLabelClass}>
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                tabIndex={2}
                                autoComplete="email"
                                name="email"
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
                                required
                                tabIndex={3}
                                autoComplete="new-password"
                                name="password"
                                placeholder="••••••••"
                                passwordrules={passwordRules}
                                className={authFieldClass}
                            />
                            <InputError
                                message={errors.password}
                                className={authErrorClass}
                            />
                        </div>

                        <div className="flex flex-col gap-[6px]">
                            <Label
                                htmlFor="password_confirmation"
                                className={authLabelClass}
                            >
                                Ulangi kata sandi
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                required
                                tabIndex={4}
                                autoComplete="new-password"
                                name="password_confirmation"
                                placeholder="••••••••"
                                passwordrules={passwordRules}
                                className={authFieldClass}
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className={authErrorClass}
                            />
                        </div>

                        <Button
                            type="submit"
                            tabIndex={5}
                            data-test="register-user-button"
                            className={authPrimaryButtonClass}
                        >
                            {processing && <Spinner />}
                            Buat akun
                        </Button>
                    </>
                )}
            </Form>

            <p className={'m-0 text-center ' + authMutedClass}>
                Sudah punya akun?{' '}
                <TextLink href={login()} tabIndex={6} className={authLinkClass}>
                    Masuk
                </TextLink>
            </p>
        </KasAuthLayout>
    );
}
