import { Form } from '@inertiajs/react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import KasAuthLayout, {
    authErrorClass,
    authFieldClass,
    authLabelClass,
    authPasskeyClass,
    authPrimaryButtonClass,
} from '@/layouts/auth/kas-auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <KasAuthLayout
            head="Confirm password"
            title="Konfirmasi kata sandi"
            description="Ini area aman. Konfirmasi kata sandi Anda sebelum melanjutkan."
        >
            <div className={authPasskeyClass}>
                <PasskeyVerify
                    routes={{
                        options: confirmOptions(),
                        submit: confirmStore(),
                    }}
                    label="Konfirmasi dengan passkey"
                    loadingLabel="Mengonfirmasi…"
                    separator="atau konfirmasi dengan kata sandi"
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
                            <Label
                                htmlFor="password"
                                className={authLabelClass}
                            >
                                Kata sandi
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                autoFocus
                                className={authFieldClass}
                            />
                            <InputError
                                message={errors.password}
                                className={authErrorClass}
                            />
                        </div>

                        <Button
                            disabled={processing}
                            data-test="confirm-password-button"
                            className={authPrimaryButtonClass}
                        >
                            {processing && <Spinner />}
                            Konfirmasi kata sandi
                        </Button>
                    </>
                )}
            </Form>
        </KasAuthLayout>
    );
}
