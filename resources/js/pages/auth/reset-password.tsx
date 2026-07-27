import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import KasAuthLayout, {
    authErrorClass,
    authFieldClass,
    authLabelClass,
    authPrimaryButtonClass,
} from '@/layouts/auth/kas-auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <KasAuthLayout
            head="Reset password"
            title="Setel ulang kata sandi"
            description="Masukkan kata sandi baru untuk akun Anda."
        >
            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
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
                                autoComplete="email"
                                value={email}
                                readOnly
                                className={
                                    authFieldClass + ' block w-full opacity-70'
                                }
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
                                Kata sandi baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                placeholder="••••••••"
                                passwordrules={passwordRules}
                                className={authFieldClass + ' block w-full'}
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
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                passwordrules={passwordRules}
                                className={authFieldClass + ' block w-full'}
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className={authErrorClass}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            data-test="reset-password-button"
                            className={authPrimaryButtonClass}
                        >
                            {processing && <Spinner />}
                            Setel ulang kata sandi
                        </Button>
                    </>
                )}
            </Form>
        </KasAuthLayout>
    );
}
